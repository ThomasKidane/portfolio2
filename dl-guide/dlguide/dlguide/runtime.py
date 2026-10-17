"""Local grading. No telemetry, credentials, result artifacts, or hidden service."""
import importlib.util
import json
import math
import os
from pathlib import Path
import random
import time
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, Optional
from urllib.parse import urlencode


class BudgetExceeded(RuntimeError):
    pass


@dataclass
class Submission:
    model: Any
    predict_fn: Optional[Callable] = None
    extras: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Verdict:
    passed: bool
    message: str
    metric: Optional[float] = None
    elapsed: float = 0.0
    parameters: int = 0
    gpu: str = "CPU"
    seed: int = 0

    def __bool__(self):
        return self.passed


def _torch():
    try:
        import torch
    except ImportError as exc:
        raise RuntimeError('Training requires torch; install "dlguide[train]" (or dlguide[vision] for images).') from exc
    return torch


def _limits(meta):
    return meta.get("budget", meta.get("budgets", {}))


def _limit(limits, *keys):
    for key in keys:
        if key in limits:
            return limits[key]
    return None


class Budget:
    """Cooperative limits: call tick() inside training loops; no process sandbox.

    Wall time includes solve and evaluation when used by Problem. CUDA memory is
    peak allocated bytes, not total device reservation. CPU memory is peak RSS,
    including framework overhead, and is never presented as GPU memory.
    """
    def __init__(self, limits=None, seed=0):
        self.limits = limits or {}
        self.seed = seed
        self.started = None
        self.elapsed = 0.0
        self.parameters = 0
        self.peak_memory_mb = 0.0
        self.gpu = "CPU"
        self.failure = None

    def __enter__(self):
        torch = _torch()
        random.seed(self.seed)
        torch.manual_seed(self.seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(self.seed)
            torch.cuda.reset_peak_memory_stats()
            self.gpu = torch.cuda.get_device_name(0)
        self.started = time.perf_counter()
        self.tick()
        return self

    def tick(self):
        if self.started is None:
            raise RuntimeError("Enter the budget context before calling tick().")
        self.elapsed = time.perf_counter() - self.started
        wall = _limit(self.limits, "wall_seconds", "time_seconds", "seconds", "max_seconds")
        if wall is not None and self.elapsed > float(wall):
            self.failure = "wall-time budget exceeded"
            raise BudgetExceeded(self.failure)
        torch = _torch()
        if self.gpu != "CPU" and torch.cuda.is_available():
            self.peak_memory_mb = torch.cuda.max_memory_allocated() / (1024 ** 2)
        else:
            # ru_maxrss is bytes on macOS and KiB on Linux. This is process
            # peak RSS (including framework overhead), not a sandbox limit.
            import resource
            import sys
            rss = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
            self.peak_memory_mb = rss / (1024 ** 2 if sys.platform == "darwin" else 1024)
        memory = _limit(self.limits, "memory_mb", "gpu_memory_mb", "max_memory_mb")
        if memory is not None and self.peak_memory_mb > float(memory):
            self.failure = "{} memory budget exceeded".format("CPU peak RSS" if self.gpu == "CPU" else "GPU allocated")
            raise BudgetExceeded(self.failure)
        if self.limits.get("require_gpu") and self.gpu == "CPU":
            self.failure = "This problem requires a CUDA GPU"
            raise BudgetExceeded(self.failure)
        return self

    def validate(self, model):
        if model is None or not callable(getattr(model, "parameters", None)):
            raise TypeError("Submission.model must be a torch module with parameters().")
        parameters = list(model.parameters())
        self.parameters = sum(p.numel() for p in parameters)
        devices = {p.device for p in parameters}
        cuda_devices = [device for device in devices if device.type == "cuda"]
        self.gpu = _torch().cuda.get_device_name(cuda_devices[0]) if cuda_devices else "CPU"
        cap = _limit(self.limits, "parameters", "max_parameters", "parameter_count", "max_params")
        if cap is not None and self.parameters > int(cap):
            self.failure = "parameter budget exceeded: {} > {}".format(self.parameters, cap)
            raise BudgetExceeded(self.failure)
        return self.tick()

    def __exit__(self, exc_type, exc, tb):
        if exc_type is None:
            self.tick()
        elif self.started is not None:
            self.elapsed = time.perf_counter() - self.started
        return False


def metric_spec(meta):
    spec = meta.get("metric", "accuracy")
    spec = dict(spec) if isinstance(spec, dict) else {"name": spec}
    spec.setdefault("direction", meta.get("direction", meta.get("metric_direction", "maximize")))
    return spec


def threshold(meta):
    value = meta.get("threshold", meta.get("thresholds", {}))
    if isinstance(value, dict):
        value = value.get("pass", value.get("target", value.get("value")))
    if value is None:
        value = metric_spec(meta).get("threshold")
    return value


class Problem:
    def __init__(self, problem_id, metadata_dir=None, seed=0):
        self.id = problem_id
        self.seed = seed
        directory = Path(metadata_dir or os.environ.get("DLGUIDE_METADATA", Path(__file__).parent / "metadata"))
        path = directory / (problem_id + ".json")
        if not path.is_file():
            raise ValueError("Unknown problem {!r}. Rebuild bundled metadata with tools/build_problem_tables.py.".format(problem_id))
        self.meta = json.loads(path.read_text(encoding="utf-8"))
        self._data = None
        self._budget = None
        self._failure = None

    def data(self):
        """Return train/val TensorDatasets. The held-out split stays private by convention."""
        if self._data is None:
            from .datasets import load
            self._data = load(self.meta, self.seed)
        public = {"train": self._data["train"], "val": self._data["val"]}
        for key in ("vocab_size", "vocab", "block_size", "sequence_length"):
            if key in self._data:
                public[key] = self._data[key]
        return public

    def budget(self):
        self._budget = Budget(_limits(self.meta), self.seed)
        return self._budget

    def check(self, submission=None):
        """Fast, local contract checks; this is not the held-out grade."""
        if submission is None:
            print("Self-check: metadata loaded for {}. Implement solve(data), then check your Submission.".format(self.id))
            return True
        if not isinstance(submission, Submission):
            raise TypeError("solve(data) must return Submission(model, predict_fn=None, extras=None).")
        torch = _torch()
        if not isinstance(submission.model, torch.nn.Module):
            raise TypeError("Submission.model must be torch.nn.Module.")
        if submission.predict_fn is not None and not callable(submission.predict_fn):
            raise TypeError("predict_fn must be callable(model, inputs).")
        checker = self.meta.get("check_module")
        if checker:
            root = Path(__file__).parent / "checks"
            path = (root / checker).resolve()
            if root.resolve() not in path.parents or not path.is_file():
                raise RuntimeError("Bundled self-check is unavailable: {}".format(checker))
            spec = importlib.util.spec_from_file_location("dlguide_check", str(path))
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            module.check(submission)
        print("Self-check PASS: submission contract is valid (not a grade).")
        return True

    def _score(self, submission, split="test"):
        torch = _torch()
        self.data()
        ds = self._data[split]
        model = submission.model
        model.eval()
        params = list(model.parameters())
        device = params[0].device if params else torch.device("cpu")
        spec = metric_spec(self.meta)
        name = spec["name"].lower()
        total, count = 0.0, 0
        reconstruction = spec.get("target") in ("clean-input", "clean-image") or (isinstance(self.meta.get("dataset"), dict) and self.meta["dataset"].get("target") == "clean-image")
        corruption_generator = torch.Generator().manual_seed(int(spec.get("corruption_seed", 1729)))
        probability = float(spec.get("corruption_probability", self.meta.get("dataset", {}).get("corruption_probability", 0.3) if isinstance(self.meta.get("dataset"), dict) else 0.3))
        if reconstruction and not 0 <= probability <= 1:
            raise ValueError("Corruption probability must lie in [0, 1].")
        with torch.no_grad():
            for batch in torch.utils.data.DataLoader(ds, batch_size=256, shuffle=False):
                if name == "attention_max_error":
                    q, k, v, expected = (t.to(device) for t in batch)
                    actual = submission.predict_fn(model, (q, k, v)) if submission.predict_fn else model(q, k, v)
                    if actual.shape != expected.shape or not torch.isfinite(actual).all():
                        raise ValueError("Attention outputs must have the expected shape and finite values.")
                    total = max(total, (actual - expected).abs().max().item())
                    count += 1
                    if self._budget and self._budget.started is not None:
                        self._budget.tick()
                    continue
                x, y = batch[0].to(device), batch[1].to(device)
                if reconstruction:
                    # Evaluation corruption is deterministic and independent of
                    # training RNG. Targets are clean pixels, never digit labels.
                    y = x
                    keep = torch.rand(x.shape, generator=corruption_generator) >= probability
                    x = x * keep.to(device)
                output = submission.predict_fn(model, x) if submission.predict_fn else model(x)
                if not isinstance(output, torch.Tensor) or not torch.isfinite(output).all():
                    raise ValueError("Predictions must be finite torch tensors.")
                if name in ("accuracy", "acc", "classification_accuracy"):
                    pred = output.argmax(dim=-1) if output.ndim > y.ndim else (output > 0.5).long()
                    if pred.shape != y.shape:
                        raise ValueError("Prediction shape does not match target shape.")
                    total += (pred == y).sum().item()
                    count += y.numel()
                elif name in ("mse", "rmse", "mae", "loss"):
                    if output.numel() != y.numel():
                        raise ValueError("Prediction shape does not match regression targets.")
                    delta = output.reshape_as(y) - y
                    total += (delta.abs() if name == "mae" else delta.square()).sum().item()
                    count += y.numel()
                elif name in ("cross_entropy", "nll", "bpc", "bits_per_character"):
                    loss = torch.nn.functional.cross_entropy(output, y, reduction="sum").item()
                    total += loss / math.log(2) if name in ("bpc", "bits_per_character") else loss
                    count += y.numel()
                else:
                    raise RuntimeError("Metric {!r} is not implemented; no proxy grade is available.".format(name))
                if self._budget and self._budget.started is not None:
                    self._budget.tick()
        if not count:
            raise ValueError("Evaluation split is empty.")
        if name == "attention_max_error":
            return total
        result = total / count
        return math.sqrt(result) if name == "rmse" else result

    def grade(self, submission=None):
        """Print a transparent verdict, never persist or transmit training outcomes."""
        score = None
        try:
            if self._failure:
                raise RuntimeError(self._failure)
            if submission is None:
                raise NotImplementedError("Starter is not implemented: solve(data) must return a Submission.")
            self.check(submission)
            budget = self._budget
            if budget is None or budget.started is None:
                raise RuntimeError("Wrap solve(data) in `with P.budget() as budget:` and call budget.validate(submission.model).")
            budget.validate(submission.model)
            score = self._score(submission)
            target = threshold(self.meta)
            if target is None:
                raise RuntimeError("No calibrated pass threshold is available; this draft cannot receive PASS.")
            direction = metric_spec(self.meta)["direction"]
            passed = score <= float(target) if direction in ("minimize", "lower", "min", "lower_is_better") else score >= float(target)
            message = "Threshold met" if passed else "Threshold not met"
        except Exception as exc:
            passed, message = False, "{}: {}".format(type(exc).__name__, exc)
        budget = self._budget
        verdict = Verdict(passed, message, score, budget.elapsed if budget else 0.0,
                          budget.parameters if budget else 0, budget.gpu if budget else "CPU", self.seed)
        spec = metric_spec(self.meta)
        print("{} — {}".format("PASS" if passed else "FAIL", message))
        print("Threshold: {} {} {}; metric={}; time={:.3f}s; parameters={}; GPU={}; seed={}".format(
            spec["name"], "<=" if spec["direction"] in ("minimize", "lower", "min", "lower_is_better") else ">=",
            threshold(self.meta), score, verdict.elapsed, verdict.parameters, verdict.gpu, verdict.seed))
        if passed:
            config = self.meta.get("config", {})
            site = config.get("site_url", "/dl-guide/")
            print("Mark Solved (self-reported, local browser progress): {}#/problem/{}?{}".format(site.rstrip("/") + "/", self.id, urlencode({"mark": "solved"})))
        return verdict
