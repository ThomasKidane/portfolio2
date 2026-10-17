"""Offline tests for the additive loader; not runtime-agent-owned tests/."""
import hashlib
import importlib.util
import io
from pathlib import Path
import random
import stat
import subprocess
import sys
import zipfile

import pytest
import torch


MODULE_PATH = Path(__file__).resolve().parents[1] / "dlguide" / "dlguide" / "data_text.py"
MODULE_SPEC = importlib.util.spec_from_file_location("data_text_under_test", MODULE_PATH)
text_data = importlib.util.module_from_spec(MODULE_SPEC)
MODULE_SPEC.loader.exec_module(text_data)
COUNTS = {"train_size": 17, "val_size": 7, "test_size": 9, "block_size": 8}


@pytest.fixture(autouse=True)
def no_network(monkeypatch):
    def blocked(*args, **kwargs):
        pytest.fail("Tests must never use the network")
    monkeypatch.setattr(text_data.urllib.request, "urlopen", blocked)


@pytest.fixture
def shakespeare(monkeypatch):
    # Distinct held-out characters establish both partition and vocabulary safety.
    raw = ("abcdefgh " * 100 + "V" * 110 + "T" * 110).encode()
    calls = []
    monkeypatch.setattr(text_data, "TINY_SHAKESPEARE_SHA256", hashlib.sha256(raw).hexdigest())
    def download(url, destination, maximum):
        calls.append((url, maximum))
        destination.write(raw)
    monkeypatch.setattr(text_data, "_download", download)
    return raw.decode(), calls


def make_zip(name="text8", raw=b"a text fixture " * 100, *, extra=False, symlink=False):
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        info = zipfile.ZipInfo(name)
        if symlink:
            info.create_system = 3
            info.external_attr = (stat.S_IFLNK | 0o777) << 16
        archive.writestr(info, raw)
        if extra:
            archive.writestr("unexpected", b"no")
    return buffer.getvalue()


def pin_text8(monkeypatch, payload, raw):
    monkeypatch.setattr(text_data, "TEXT8_SHA256", hashlib.sha256(payload).hexdigest())
    monkeypatch.setattr(text_data, "TEXT8_CORPUS_SHA256", hashlib.sha256(raw).hexdigest())
    monkeypatch.setattr(text_data, "TEXT8_CORPUS_BYTES", len(raw))
    monkeypatch.setattr(text_data, "_download", lambda url, destination, maximum: destination.write(payload))


def test_import_is_lazy():
    script = (
        "import importlib.util, sys; "
        "s=importlib.util.spec_from_file_location('isolated_text', sys.argv[1]); "
        "m=importlib.util.module_from_spec(s); s.loader.exec_module(m); "
        "assert 'torch' not in sys.modules; assert 'numpy' not in sys.modules"
    )
    subprocess.run([sys.executable, "-c", script, str(MODULE_PATH)], check=True)


@pytest.mark.parametrize("name", ["tinyshakespeare", "TinyShakespeare", "tiny-shakespeare", "tiny_shakespeare"])
def test_genuine_path_aliases_and_cache(name, tmp_path, shakespeare):
    _, calls = shakespeare
    result = text_data.load_text_dataset(name, COUNTS, cache_dir=tmp_path)
    cached = text_data.load_text_dataset(name, COUNTS, cache_dir=tmp_path)
    assert len(calls) == 1
    assert result["source"]["kind"] == "verified-corpus"
    assert result["source"]["commit"] == text_data.TINY_SHAKESPEARE_COMMIT
    assert result["block_size"] == result["sequence_length"] == 8
    assert result["vocab_size"] == len(result["vocab"])
    for split in ("train", "val", "test"):
        assert isinstance(result[split], torch.utils.data.TensorDataset)
        x, y = result[split].tensors
        assert x.shape == (COUNTS[split + "_size"], 8)
        assert y.shape == (COUNTS[split + "_size"],)
        assert x.dtype == y.dtype == torch.long
        assert torch.equal(x, cached[split].tensors[0])
        assert torch.equal(y, cached[split].tensors[1])


def test_partitions_targets_and_train_only_vocabulary(tmp_path, shakespeare):
    raw, _ = shakespeare
    result = text_data.load_text_dataset("TinyShakespeare", COUNTS, cache_dir=tmp_path)
    assert "V" not in result["vocab"] and "T" not in result["vocab"]
    assert result["vocab"]["<unk>"] == 0
    ranges = result["split_ranges"]
    assert ranges == {"train": (0, len(raw) * 8 // 10),
                      "val": (len(raw) * 8 // 10, len(raw) * 9 // 10),
                      "test": (len(raw) * 9 // 10, len(raw))}
    for index, split in enumerate(("train", "val", "test")):
        start, end = ranges[split]
        offsets = random.Random(1729 + index).sample(range(start, end - 8), COUNTS[split + "_size"])
        assert len(set(offsets)) == len(offsets)
        x, y = result[split].tensors
        for row, offset in enumerate(offsets):
            assert start <= offset and offset + 8 < end
            assert x[row].tolist() == [result["vocab"].get(c, 0) for c in raw[offset:offset + 8]]
            assert y[row].item() == result["vocab"].get(raw[offset + 8], 0)
    assert not any(isinstance(v, (bytes, str)) and raw in v for v in result.values())


def test_fixed_seed_independent_global_rng_and_sizes(tmp_path, shakespeare):
    spec = dict(COUNTS, seed=42)
    first = text_data.load_text_dataset("tinyshakespeare", spec, cache_dir=tmp_path)
    random.seed(99)
    torch.manual_seed(999)
    second = text_data.load_text_dataset("tinyshakespeare", spec, cache_dir=tmp_path)
    changed = text_data.load_text_dataset("tinyshakespeare", dict(spec, seed=43), cache_dir=tmp_path)
    assert torch.equal(first["train"].tensors[0], second["train"].tensors[0])
    assert not torch.equal(first["train"].tensors[0], changed["train"].tensors[0])
    fewer = text_data.load_text_dataset("tinyshakespeare", dict(spec, train_size=5), cache_dir=tmp_path)
    assert first["split_ranges"] == fewer["split_ranges"]
    assert torch.equal(first["val"].tensors[0], fewer["val"].tensors[0])


def test_corrupt_cache_checked_on_every_read(tmp_path, shakespeare):
    _, calls = shakespeare
    text_data.load_text_dataset("tinyshakespeare", COUNTS, cache_dir=tmp_path)
    path = next(tmp_path.glob("*.txt"))
    path.write_bytes(b"corrupt")
    with pytest.raises(ValueError, match="SHA256 mismatch"):
        text_data.load_text_dataset("tinyshakespeare", COUNTS, cache_dir=tmp_path)
    assert len(calls) == 1  # No silent replacement/fallback.


def test_failed_download_never_installs_cache(tmp_path, shakespeare, monkeypatch):
    def broken(url, destination, maximum):
        destination.write(b"partial")
        raise OSError("connection lost")
    monkeypatch.setattr(text_data, "_download", broken)
    with pytest.raises(OSError, match="connection lost"):
        text_data.load_text_dataset("tinyshakespeare", COUNTS, cache_dir=tmp_path)
    assert list(tmp_path.iterdir()) == []


def test_bad_download_hash_never_installs_cache(tmp_path, monkeypatch):
    monkeypatch.setattr(text_data, "_download", lambda url, out, maximum: out.write(b"bad"))
    with pytest.raises(ValueError, match="SHA256 mismatch"):
        text_data.load_text_dataset("TinyShakespeare", COUNTS, cache_dir=tmp_path)
    assert list(tmp_path.iterdir()) == []


def test_oversized_cache_fails(tmp_path, monkeypatch):
    monkeypatch.setattr(text_data, "TINY_SHAKESPEARE_MAX_BYTES", 3)
    path = tmp_path / ("tinyshakespeare-" + text_data.TINY_SHAKESPEARE_COMMIT + ".txt")
    path.write_bytes(b"1234")
    with pytest.raises(ValueError, match="byte limit"):
        text_data.load_text_dataset("tinyshakespeare", COUNTS, cache_dir=tmp_path)


def test_text8_archive_verified_and_used(tmp_path, monkeypatch):
    raw = b"abcdefghijklmnopqrstuvwxyz " * 100
    pin_text8(monkeypatch, make_zip(raw=raw), raw)
    result = text_data.load_text_dataset("text8", COUNTS, cache_dir=tmp_path)
    assert len(result["train"]) == 17
    assert result["source"]["url"] == "https://mattmahoney.net/dc/text8.zip"
    assert result["source"]["corpus_sha256"] == hashlib.sha256(raw).hexdigest()
    (tmp_path / "text8.zip").write_bytes(b"broken cache")
    with pytest.raises(ValueError, match="SHA256 mismatch"):
        text_data.load_text_dataset("text8", COUNTS, cache_dir=tmp_path)


@pytest.mark.parametrize("name,extra,symlink", [
    ("../text8", False, False), ("/text8", False, False),
    ("text8", True, False), ("text8", False, True),
])
def test_text8_rejects_unsafe_members(tmp_path, monkeypatch, name, extra, symlink):
    raw = b"fixture " * 100
    pin_text8(monkeypatch, make_zip(name, raw, extra=extra, symlink=symlink), raw)
    with pytest.raises(ValueError, match="archive|member"):
        text_data.load_text_dataset("text8", COUNTS, cache_dir=tmp_path)
    assert not (tmp_path.parent / "text8").exists()


def test_text8_uncompressed_bound_and_hash(tmp_path, monkeypatch):
    raw = b"fixture " * 100
    pin_text8(monkeypatch, make_zip(raw=raw), raw)
    monkeypatch.setattr(text_data, "TEXT8_CORPUS_BYTES", len(raw) - 1)
    with pytest.raises(ValueError, match="member"):
        text_data.load_text_dataset("text8", COUNTS, cache_dir=tmp_path)
    monkeypatch.setattr(text_data, "TEXT8_CORPUS_BYTES", len(raw))
    monkeypatch.setattr(text_data, "TEXT8_CORPUS_SHA256", "0" * 64)
    with pytest.raises(ValueError, match="SHA256 mismatch"):
        text_data.load_text_dataset("text8", COUNTS, cache_dir=tmp_path)


def test_text8_published_alphabet(tmp_path, monkeypatch):
    raw = b"INVALID! " * 100
    pin_text8(monkeypatch, make_zip(raw=raw), raw)
    with pytest.raises(ValueError, match="alphabet"):
        text_data.load_text_dataset("text8", COUNTS, cache_dir=tmp_path)


@pytest.mark.parametrize("name", ["TinyShakespeare", "text8"])
def test_smoke_explicit_fixture_no_network_or_cache(tmp_path, name):
    with pytest.warns(UserWarning, match="Synthetic tiny text fixture.*NOT the actual"):
        result = text_data.load_text_dataset(name, {}, smoke=True, cache_dir=tmp_path)
    assert result["smoke"] is True
    assert result["source"] == {"kind": "synthetic-fixture", "url": None, "sha256": None}
    assert result["block_size"] == result["sequence_length"] == 32
    assert [len(result[s]) for s in ("train", "val", "test")] == [512, 128, 128]
    assert list(tmp_path.iterdir()) == []


@pytest.mark.parametrize("key,value", [("block_size", 0), ("block_size", 2.5),
                                      ("train_size", -1), ("val_size", True),
                                      ("test_size", "bad"), ("train_size", 1000000)])
def test_invalid_spec(tmp_path, shakespeare, key, value):
    with pytest.raises(ValueError):
        text_data.load_text_dataset("TinyShakespeare", dict(COUNTS, **{key: value}), cache_dir=tmp_path)


def test_sequence_length_and_nested_counts(tmp_path, shakespeare):
    result = text_data.load_text_dataset("TinyShakespeare", {
        "sequence_length": 4, "splits": {"train": 3, "val": 4, "test": 5}
    }, cache_dir=tmp_path)
    assert result["block_size"] == 4
    assert [len(result[s]) for s in ("train", "val", "test")] == [3, 4, 5]


def test_unknown_dataset_refuses_fallback(tmp_path):
    with pytest.raises(ValueError, match="Unsupported"):
        text_data.load_text_dataset("not-a-benchmark", {}, smoke=True, cache_dir=tmp_path)


def test_environment_cache_path(monkeypatch, tmp_path, shakespeare):
    monkeypatch.setenv("DLGUIDE_DATA", str(tmp_path))
    text_data.load_text_dataset("TinyShakespeare", COUNTS)
    assert len(list(tmp_path.glob("*.txt"))) == 1


@pytest.mark.parametrize("advertised,actual,final_url", [
    ("100", b"x", "https://source.invalid/file"),
    (None, b"123456", "https://source.invalid/file"),
    (None, b"x", "http://source.invalid/file"),
])
def test_download_transport_bounds(monkeypatch, advertised, actual, final_url):
    class Response(io.BytesIO):
        headers = {} if advertised is None else {"Content-Length": advertised}
        def geturl(self):
            return final_url
    monkeypatch.setattr(text_data.urllib.request, "urlopen", lambda *a, **k: Response(actual))
    with pytest.raises(ValueError, match="limit|HTTPS"):
        text_data._download("https://source.invalid/file", io.BytesIO(), 5)


def test_download_stream_success_and_initial_https(monkeypatch):
    class Response(io.BytesIO):
        headers = {"Content-Length": "5"}
        def geturl(self):
            return "https://source.invalid/file"
    monkeypatch.setattr(text_data.urllib.request, "urlopen", lambda *a, **k: Response(b"12345"))
    destination = io.BytesIO()
    text_data._download("https://source.invalid/file", destination, 5)
    assert destination.getvalue() == b"12345"
    with pytest.raises(ValueError, match="HTTPS"):
        text_data._download("http://source.invalid/file", io.BytesIO(), 5)
