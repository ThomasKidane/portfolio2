import json
import subprocess
import sys
import time
from pathlib import Path

import pytest

from dlguide import Budget, BudgetExceeded, Problem, Submission
from build_problem_tables import build


def problem(guide, **updates):
    root, meta = guide
    meta.update(updates)
    (root / "content" / "catalog.json").write_text(json.dumps({"problems": [meta], "modules": [], "contests": []}))
    build(root)
    return Problem(meta["id"], root / "dlguide" / "dlguide" / "metadata")


def test_import_does_not_load_tensor_libraries():
    result = subprocess.run([sys.executable, "-c", "import dlguide,sys; assert 'torch' not in sys.modules; assert 'numpy' not in sys.modules"], capture_output=True, text=True)
    assert result.returncode == 0, result.stderr


def test_data_is_deterministic_and_private_by_convention(guide):
    import torch
    p = problem(guide)
    data = p.data()
    assert set(data) == {"train", "val"}
    assert isinstance(data["train"], torch.utils.data.TensorDataset)
    assert torch.equal(data["train"].tensors[0], p.data()["train"].tensors[0])
    assert p._data["test"].tensors[0].shape[0] == 16


def test_unmodified_starter_fails_without_exception(guide, capsys):
    p = problem(guide)
    verdict = p.grade()
    assert not verdict
    assert "FAIL" in capsys.readouterr().out


def test_wrong_return_contract_fails(guide):
    p = problem(guide)
    with pytest.raises(TypeError):
        p.check(object())
    assert not p.grade(object())


def test_grade_requires_budget(guide):
    import torch
    p = problem(guide)
    verdict = p.grade(Submission(torch.nn.Linear(2, 2)))
    assert not verdict
    assert "budget" in verdict.message


def test_grade_prints_context_and_mark_link(guide, capsys):
    import torch
    p = problem(guide)
    with p.budget() as budget:
        sub = Submission(torch.nn.Linear(2, 2))
        budget.validate(sub.model)
    verdict = p.grade(sub)
    assert verdict
    text = capsys.readouterr().out
    for field in ("Threshold:", "metric=", "time=", "parameters=", "GPU=CPU", "seed=0", "Mark Solved"):
        assert field in text


def test_parameter_budget(guide):
    import torch
    with pytest.raises(BudgetExceeded, match="parameter"):
        with Budget({"parameters": 1}) as budget:
            budget.validate(torch.nn.Linear(2, 2))


def test_wall_budget_without_sleep(monkeypatch):
    import dlguide.runtime as runtime
    moments = iter([0.0, 0.1, 5.0, 5.1])
    monkeypatch.setattr(runtime.time, "perf_counter", lambda: next(moments))
    with pytest.raises(BudgetExceeded, match="wall"):
        with Budget({"wall_seconds": 1}) as budget:
            budget.tick()


def test_lower_is_better(guide):
    import torch
    p = problem(guide, dataset={"name": "synthetic-regression", "features": 2, "noise": 0, "train_size": 48, "val_size": 16, "test_size": 16}, metric={"name": "mse", "direction": "minimize"}, threshold=1e-8)
    model = torch.nn.Linear(2, 1)
    with torch.no_grad():
        model.weight.copy_(torch.tensor([[0.5, 1.0]]))
        model.bias.fill_(0.25)
    with p.budget() as budget:
        budget.validate(model)
    assert p.grade(Submission(model))


def test_text_runtime_exposes_vocabulary_but_not_test_split(guide, monkeypatch):
    monkeypatch.setenv("DLGUIDE_SMOKE", "1")
    p = problem(guide, dataset={"name": "tinyshakespeare", "sequence_length": 8,
                                "split": {"train": 12, "val": 4, "test": 4}})
    with pytest.warns(UserWarning):
        data = p.data()
    assert "test" not in data
    assert data["sequence_length"] == 8
    assert data["vocab_size"] == len(data["vocab"])
    assert len(data["train"]) == 12
    assert len(p._data["test"]) == 4


def test_bits_per_character_conversion(guide):
    import math
    import torch
    p = problem(guide, metric={"name": "bpc", "direction": "minimize"})
    dataset = torch.utils.data.TensorDataset(torch.zeros(4, 2), torch.zeros(4, dtype=torch.long))
    p._data = {"train": dataset, "val": dataset, "test": dataset}
    model = torch.nn.Linear(2, 4)
    with torch.no_grad():
        model.weight.zero_()
        model.bias.zero_()
    assert p._score(Submission(model)) == pytest.approx(math.log2(4))


def test_unsupported_dataset_never_fakes_real(guide):
    p = problem(guide, dataset={"name": "imaginary-large-language-corpus"})
    with pytest.raises(RuntimeError, match="not implemented"):
        p.data()


def test_nonfinite_predictions_fail(guide):
    import torch
    p = problem(guide)
    model = torch.nn.Linear(2, 2)
    with p.budget() as budget:
        budget.validate(model)
    verdict = p.grade(Submission(model, predict_fn=lambda m, x: torch.full((len(x), 2), float("nan"))))
    assert not verdict
    assert "finite" in verdict.message


def test_attention_operator_uses_real_equivalence_metric(guide):
    import torch
    p = problem(guide, dataset={"name": "attention-equivalence", "train_size": 8, "val_size": 4, "test_size": 4}, metric={"name": "attention_max_error", "direction": "minimize"}, threshold=1e-7)
    class Attention(torch.nn.Module):
        def forward(self, q, k, v):
            return torch.nn.functional.scaled_dot_product_attention(q, k, v)
    model = Attention()
    with p.budget() as budget:
        budget.validate(model)
    verdict = p.grade(Submission(model))
    assert verdict
    assert verdict.metric == 0
    assert verdict.parameters == 0


def test_unknown_problem_actionable(tmp_path):
    with pytest.raises(ValueError, match="build_problem_tables"):
        Problem("missing", tmp_path)
