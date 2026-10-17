import json

import pytest

from dlguide.datasets import load


def test_synthetic_regression_and_xor_have_real_split_contract():
    import torch
    for name in ("synthetic-regression", "synthetic-xor"):
        data = load({"dataset": {"name": name, "train_size": 20, "val_size": 5, "test_size": 7}})
        assert {key: len(value) for key, value in data.items()} == {"train": 20, "val": 5, "test": 7}
        assert not torch.equal(data["train"].tensors[0][:5], data["val"].tensors[0])


def test_image_loader_fails_actionably_without_optional_dependency(monkeypatch):
    import sys
    monkeypatch.setitem(sys.modules, "torchvision.datasets", None)
    with pytest.raises(RuntimeError, match="torchvision"):
        load({"dataset": {"name": "MNIST"}})


def test_image_loader_never_downloads_without_opt_in(monkeypatch):
    import sys
    import types
    calls = []
    def missing(*args, **kwargs):
        calls.append(kwargs)
        raise RuntimeError("Dataset not found")
    fake = types.ModuleType("torchvision")
    fake.__path__ = []
    datasets = types.ModuleType("torchvision.datasets")
    datasets.MNIST = missing
    datasets.CIFAR10 = missing
    fake.datasets = datasets
    monkeypatch.setitem(sys.modules, "torchvision", fake)
    monkeypatch.setitem(sys.modules, "torchvision.datasets", datasets)
    monkeypatch.delenv("DLGUIDE_DOWNLOAD", raising=False)
    with pytest.raises(RuntimeError, match="DLGUIDE_DOWNLOAD=1"):
        load({"dataset": {"name": "MNIST"}})
    assert calls[0]["download"] is False


def test_memory_cap_enforced_on_cpu(monkeypatch):
    import torch
    from dlguide import Budget, BudgetExceeded
    monkeypatch.setattr(torch.cuda, "is_available", lambda: False)
    with pytest.raises(BudgetExceeded, match="memory"):
        with Budget({"memory_mb": 0.00001}):
            pass
