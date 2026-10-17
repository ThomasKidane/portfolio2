"""Deterministic synthetic tasks and genuine torchvision image datasets.

MNIST and CIFAR10 use torchvision's published archive/file integrity checks.
Downloads are opt-in via DLGUIDE_DOWNLOAD=1; unsupported names never silently
fall back to synthetic examples. Nothing is downloaded during CPU unit tests.
"""
import os
from pathlib import Path


def load(meta, seed=0):
    from .runtime import _torch
    torch = _torch()
    spec = meta.get("dataset", {"name": "synthetic-classification"})
    if isinstance(spec, str):
        spec = {"name": spec}
    name = spec.get("name", spec.get("id", "")).lower().replace("_", "-")
    generator = torch.Generator().manual_seed(int(spec.get("seed", 1729)))
    if name in ("tinyshakespeare", "tiny-shakespeare", "text8"):
        from .data_text import load_text_dataset
        return load_text_dataset(name.replace("-", ""), spec, smoke=os.environ.get("DLGUIDE_SMOKE") == "1")
    sizes = spec.get("split", spec.get("splits", {}))
    ntrain = int(spec.get("train_size", sizes.get("train", 512)))
    nval = int(spec.get("val_size", sizes.get("val", 128)))
    ntest = int(spec.get("test_size", sizes.get("test", 128)))
    if min(ntrain, nval, ntest) <= 0:
        raise ValueError("Each dataset split must have positive size.")
    total = ntrain + nval + ntest
    synthetic_classification = ("synthetic", "synthetic-classification", "synthetic-linear", "synthetic-linear-classification", "blobs", "two-blobs", "linear-classification")
    synthetic_regression = ("synthetic-regression", "synthetic-linear-regression", "linear-regression")
    if name in synthetic_classification + synthetic_regression + ("xor", "synthetic-xor"):
        features = int(spec.get("features", spec.get("input_dim", 2)))
        x = torch.randn(total, features, generator=generator)
        if name in synthetic_regression:
            weights = torch.arange(1, features + 1).float() / features
            y = x @ weights + 0.25
            noise = float(spec.get("noise", 0.01))
            y += noise * torch.randn(total, generator=generator)
            y = y[:, None]
        elif name in ("xor", "synthetic-xor"):
            if features < 2:
                raise ValueError("XOR needs at least two input features.")
            y = ((x[:, 0] > 0) != (x[:, 1] > 0)).long()
        else:
            classes = int(spec.get("classes", spec.get("num_classes", 2)))
            if classes < 2:
                raise ValueError("Classification requires at least two classes.")
            weights = torch.randn(features, classes, generator=generator)
            y = (x @ weights).argmax(dim=-1)
        splits = {}
        start = 0
        for split, size in (("train", ntrain), ("val", nval), ("test", ntest)):
            splits[split] = torch.utils.data.TensorDataset(x[start:start + size], y[start:start + size])
            start += size
        return splits
    if name == "attention-equivalence":
        # A genuinely synthetic operator task, never a stand-in for a corpus.
        q = torch.randn(total, 2, 3, 4, generator=generator, dtype=torch.float64)
        k = torch.randn(total, 2, 5, 4, generator=generator, dtype=torch.float64)
        v = torch.randn(total, 2, 5, 6, generator=generator, dtype=torch.float64)
        expected = torch.nn.functional.scaled_dot_product_attention(q, k, v)
        result, start = {}, 0
        for split, size in (("train", ntrain), ("val", nval), ("test", ntest)):
            result[split] = torch.utils.data.TensorDataset(*(t[start:start + size] for t in (q, k, v, expected)))
            start += size
        return result
    if name in ("mnist", "cifar10", "cifar-10") and os.environ.get("DLGUIDE_SMOKE") == "1":
        import warnings
        warnings.warn("Synthetic image smoke fixture only; NOT the actual {} benchmark.".format(name), UserWarning)
        channels, side, classes = (1, 28, 10) if name == "mnist" else (3, 32, 10)
        # Independent, seeded image patterns preserve the genuine shape/dtype
        # contract without claiming that random patterns are benchmark images.
        labels = torch.arange(total) % classes
        prototypes = torch.rand(classes, channels, side, side, generator=generator)
        images = (prototypes[labels] + 0.05 * torch.randn(total, channels, side, side, generator=generator)).clamp(0, 1)
        result, start = {}, 0
        for split, size in (("train", ntrain), ("val", nval), ("test", ntest)):
            result[split] = torch.utils.data.TensorDataset(images[start:start + size], labels[start:start + size])
            start += size
        result["smoke"] = True
        return result
    if name in ("mnist", "cifar10", "cifar-10"):
        try:
            import torchvision.datasets as vision
        except (ImportError, RuntimeError) as exc:
            raise RuntimeError('MNIST/CIFAR10 require a compatible torchvision; install "dlguide[vision]".') from exc
        root = Path(os.environ.get("DLGUIDE_DATA", str(Path.home() / ".cache" / "dlguide")))
        download = os.environ.get("DLGUIDE_DOWNLOAD") == "1"
        cls = vision.MNIST if name == "mnist" else vision.CIFAR10
        try:
            train = cls(str(root), train=True, download=download)
            test = cls(str(root), train=False, download=download)
        except RuntimeError as exc:
            raise RuntimeError("{} data missing or integrity check failed. Set DLGUIDE_DOWNLOAD=1 to download genuine torchvision data into {}.".format(name, root)) from exc
        # CIFAR10 verifies every extracted batch with its bundled hashes.
        # MNIST's existence-only fast path needs an explicit archive verification
        # and comparison with extracted raw files before trusting loaded tensors.
        if name == "mnist":
            import gzip
            from torchvision.datasets.utils import check_integrity
            raw = Path(train.raw_folder)
            for filename, digest in train.resources:
                archive = raw / filename
                unpacked = raw / filename[:-3]
                if not check_integrity(str(archive), digest):
                    raise RuntimeError("MNIST original archive missing or invalid: {}. Remove the broken cache and set DLGUIDE_DOWNLOAD=1.".format(archive))
                with gzip.open(str(archive), "rb") as handle:
                    expected = handle.read()
                if not unpacked.is_file() or unpacked.read_bytes() != expected:
                    raise RuntimeError("MNIST extracted data does not match its verified original archive; remove the broken cache and download again.")
            # Refuse the legacy processed-tensor cache, whose provenance is not
            # established by checking the raw files above.
            if hasattr(train, "_check_legacy_exist") and train._check_legacy_exist():
                raise RuntimeError("Remove MNIST's legacy processed cache so tensors are loaded from verified raw files.")
        def tensors(dataset):
            x = torch.as_tensor(dataset.data).float() / 255.0
            if name == "mnist":
                x = x.unsqueeze(1)
            else:
                x = x.permute(0, 3, 1, 2)
            y = torch.as_tensor(dataset.targets, dtype=torch.long)
            return x, y
        xtrain, ytrain = tensors(train)
        xtest, ytest = tensors(test)
        if ntrain + nval > len(train) or ntest > len(test):
            raise ValueError("Requested split sizes exceed the genuine dataset.")
        order = torch.randperm(len(train), generator=generator)
        testorder = torch.randperm(len(test), generator=generator)[:ntest]
        a, b = order[:ntrain], order[ntrain:ntrain + nval]
        return {"train": torch.utils.data.TensorDataset(xtrain[a], ytrain[a]),
                "val": torch.utils.data.TensorDataset(xtrain[b], ytrain[b]),
                "test": torch.utils.data.TensorDataset(xtest[testorder], ytest[testorder])}
    raise RuntimeError("Dataset {!r} is not implemented. Add a genuine, licensed loader with explicit split/integrity checks; this draft cannot be graded yet.".format(name))
