"""Verified character-level text loaders, not pretrained models or benchmark results.

``load_text_dataset(name, spec, *, smoke=False, cache_dir=None)`` returns
train/val/test TensorDatasets: long inputs [N, block_size] and next-character
labels [N] (the character immediately AFTER each input sequence). Split sizes
are counts of distinct windows, not raw characters. Defaults are 512/128/128.

Raw text is partitioned contiguously 80/10/10 BEFORE selecting windows, so even
input/target characters cannot straddle splits. A local fixed-seed RNG samples
windows independently in each partition. Vocabulary is fit on TRAIN ONLY;
held-out unknown characters map to the reserved <unk> token. Neither raw text
nor held-out tensors are included in training tensors or vocabulary metadata.

Missing corpora download automatically over HTTPS; cache_dir overrides
DLGUIDE_DATA, otherwise ~/.cache/dlguide/text is used. Every cache read verifies
the pinned SHA256; damaged caches fail closed (delete the file to redownload).
Smoke mode is an explicitly synthetic fixture, NEVER the named benchmark.
Only the standard library is imported until the loader needs torch; numpy is
not needed. This module deliberately does not integrate with the runtime.
"""

import hashlib
import io
import os
from pathlib import Path
import random
import stat
import tempfile
import urllib.request
import warnings
import zipfile


# Measured from the immutable GitHub contents API with `gh api` (raw media).
TINY_SHAKESPEARE_COMMIT = "370cbcd448eb7daf32f21a6be560b70e0b33c4e3"
TINY_SHAKESPEARE_URL = (
    "https://raw.githubusercontent.com/karpathy/char-rnn/"
    + TINY_SHAKESPEARE_COMMIT + "/data/tinyshakespeare/input.txt"
)
TINY_SHAKESPEARE_SHA256 = "86c4e6aa9db7c042ec79f339dcb96d42b0075e16b8fc2e86bf0ca57e2dc565ed"
TINY_SHAKESPEARE_MAX_BYTES = 2 * 1024 * 1024

# Official HTTPS archive measured 2026-10-17: 31,344,016 bytes, one member.
TEXT8_URL = "https://mattmahoney.net/dc/text8.zip"
TEXT8_SHA256 = "a6640522afe85d1963ad56c05b0ede0a0c000dddc9671758a6cc09b7a38e5232"
TEXT8_MAX_DOWNLOAD_BYTES = 34 * 1024 * 1024
TEXT8_CORPUS_BYTES = 100_000_000
TEXT8_CORPUS_SHA256 = "6e890197040d37d85beb962ae1f041ff1d9a9ca8d20c7d99c85027eebf51dca7"

_SPLITS = ("train", "val", "test")
# Deliberately authored nonsense, not an excerpt of either benchmark.
_SMOKE_TEXT = (
    "a tiny synthetic fixture: red robots read blue books.\n"
    "the moon is made of tokens; this is not benchmark text.\n"
) * 96


def _download(url, destination, max_bytes):
    """Bounded streaming HTTPS download into an already-open temporary file."""
    if not url.startswith("https://"):
        raise ValueError("Text corpus sources must use HTTPS.")
    with urllib.request.urlopen(url, timeout=60) as response:
        if not response.geturl().startswith("https://"):
            raise ValueError("Refusing a non-HTTPS download redirect.")
        length = response.headers.get("Content-Length")
        if length is not None and (int(length) < 0 or int(length) > max_bytes):
            raise ValueError("Text corpus download exceeds the byte limit.")
        count = 0
        while True:
            chunk = response.read(min(64 * 1024, max_bytes - count + 1))
            if not chunk:
                break
            count += len(chunk)
            if count > max_bytes:
                raise ValueError("Text corpus download exceeds the byte limit.")
            destination.write(chunk)


def _verified_bytes(path, digest, max_bytes):
    with path.open("rb") as handle:
        payload = handle.read(max_bytes + 1)
    if len(payload) > max_bytes:
        raise ValueError("Cached text corpus exceeds the byte limit: {}".format(path))
    if hashlib.sha256(payload).hexdigest() != digest:
        raise ValueError("SHA256 mismatch for {}; remove the corrupt cache and retry.".format(path))
    return payload


def _cached_source(root, filename, url, digest, max_bytes):
    root.mkdir(parents=True, exist_ok=True)
    path = root / filename
    if path.exists():
        return _verified_bytes(path, digest, max_bytes)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=root, prefix="." + filename + ".", delete=False) as handle:
            temporary = Path(handle.name)
            _download(url, handle, max_bytes)
            handle.flush()
            os.fsync(handle.fileno())
        payload = _verified_bytes(temporary, digest, max_bytes)
        os.replace(temporary, path)
        return payload
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)


def _text8_text(payload):
    """Read only the expected member, never extract paths to the filesystem."""
    with zipfile.ZipFile(io.BytesIO(payload)) as archive:
        members = archive.infolist()
        if len(members) != 1 or members[0].filename != "text8":
            raise ValueError("text8 archive must contain exactly one member named text8.")
        member = members[0]
        mode = member.external_attr >> 16
        if (member.is_dir() or stat.S_ISLNK(mode) or member.flag_bits & 1
                or member.compress_type not in (zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED)
                or member.file_size != TEXT8_CORPUS_BYTES):
            raise ValueError("Unsafe or unexpected text8 archive member.")
        with archive.open(member) as handle:
            raw = handle.read(TEXT8_CORPUS_BYTES + 1)
        if len(raw) != TEXT8_CORPUS_BYTES or hashlib.sha256(raw).hexdigest() != TEXT8_CORPUS_SHA256:
            raise ValueError("text8 uncompressed corpus size or SHA256 mismatch.")
    text = raw.decode("ascii")
    if not set(text).issubset(set(" abcdefghijklmnopqrstuvwxyz")):
        raise ValueError("text8 contains characters outside its published alphabet.")
    return text


def _positive_integer(value, label):
    # Refuse fractional counts rather than silently truncating metadata.
    if isinstance(value, bool):
        raise ValueError("{} must be a positive integer.".format(label))
    try:
        number = int(value)
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValueError("{} must be a positive integer.".format(label)) from exc
    if number <= 0 or str(number) != str(value):
        raise ValueError("{} must be a positive integer.".format(label))
    return number


def load_text_dataset(name, spec, *, smoke=False, cache_dir=None):
    """Load genuine TinyShakespeare/text8, or an explicit synthetic smoke fixture.

    ``spec`` accepts seed (default 1729), block_size (default 32; aliases
    sequence_length/seq_len), train_size/val_size/test_size, or ``splits`` with
    train/val/test integer window counts. Returned metadata includes vocab
    (character -> id, <unk> -> 0), vocab_size, block_size, sequence_length,
    split_ranges (half-open raw character offsets), and source provenance.
    No training, model weights, or benchmark claims are provided.
    """
    normalized = str(name).lower().replace("_", "").replace("-", "")
    if normalized not in ("tinyshakespeare", "text8"):
        raise ValueError("Unsupported text dataset: {!r}".format(name))
    if not isinstance(spec, dict):
        raise TypeError("Text dataset spec must be a dictionary.")
    block_size = _positive_integer(
        spec.get("block_size", spec.get("sequence_length", spec.get("seq_len", 32))), "block_size"
    )
    sizes = spec.get("split", spec.get("splits", {}))
    if not isinstance(sizes, dict):
        raise ValueError("splits must map train/val/test to integer window counts.")
    counts = {
        split: _positive_integer(spec.get(split + "_size", sizes.get(split, default)), split + "_size")
        for split, default in zip(_SPLITS, (512, 128, 128))
    }
    seed = int(spec.get("seed", 1729))
    if smoke:
        warnings.warn(
            "Synthetic tiny text fixture only; NOT the actual {} benchmark.".format(name),
            UserWarning, stacklevel=2,
        )
        text = _SMOKE_TEXT
        source = {"kind": "synthetic-fixture", "url": None, "sha256": None}
    else:
        root = Path(cache_dir) if cache_dir is not None else Path(
            os.environ.get("DLGUIDE_DATA", str(Path.home() / ".cache" / "dlguide" / "text"))
        )
        if normalized == "tinyshakespeare":
            payload = _cached_source(root, "tinyshakespeare-" + TINY_SHAKESPEARE_COMMIT + ".txt",
                                     TINY_SHAKESPEARE_URL, TINY_SHAKESPEARE_SHA256,
                                     TINY_SHAKESPEARE_MAX_BYTES)
            text = payload.decode("utf-8")
            source = {"kind": "verified-corpus", "url": TINY_SHAKESPEARE_URL,
                      "sha256": TINY_SHAKESPEARE_SHA256, "commit": TINY_SHAKESPEARE_COMMIT}
        else:
            payload = _cached_source(root, "text8.zip", TEXT8_URL, TEXT8_SHA256,
                                     TEXT8_MAX_DOWNLOAD_BYTES)
            text = _text8_text(payload)
            source = {"kind": "verified-corpus", "url": TEXT8_URL,
                      "sha256": TEXT8_SHA256, "corpus_sha256": TEXT8_CORPUS_SHA256}
    n = len(text)
    boundaries = (0, n * 8 // 10, n * 9 // 10, n)
    ranges = dict(zip(_SPLITS, zip(boundaries[:-1], boundaries[1:])))
    for split, (start, end) in ranges.items():
        available = end - start - block_size
        if counts[split] > available:
            raise ValueError("{} requests {} windows but its disjoint raw partition supports {} "
                             "at block_size={}.".format(split, counts[split], max(0, available), block_size))
    # Vocabulary cannot learn a held-out character, even in smoke mode.
    vocab = {"<unk>": 0}
    vocab.update((character, index) for index, character in enumerate(sorted(set(text[:boundaries[1]])), 1))
    try:
        import torch
    except ImportError as exc:
        raise RuntimeError('Text datasets require torch; install "dlguide[train]".') from exc
    result = {}
    for index, (split, (start, end)) in enumerate(ranges.items()):
        rng = random.Random(seed + index)
        offsets = rng.sample(range(start, end - block_size), counts[split])
        inputs = torch.tensor(
            [[vocab.get(c, 0) for c in text[offset:offset + block_size]] for offset in offsets],
            dtype=torch.long,
        )
        labels = torch.tensor([vocab.get(text[offset + block_size], 0) for offset in offsets], dtype=torch.long)
        result[split] = torch.utils.data.TensorDataset(inputs, labels)
    result.update(vocab=vocab, vocab_size=len(vocab), block_size=block_size,
                  sequence_length=block_size, split_ranges=ranges, source=source,
                  smoke=bool(smoke), dataset_name=normalized)
    return result
