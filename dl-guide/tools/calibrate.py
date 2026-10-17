#!/usr/bin/env python3
"""Run five real reference trainings before atomically changing thresholds.

CUDA is required by default. --allow-cpu is an explicit exploratory opt-in;
its provenance is labeled CPU and must never be presented as a T4 calibration.
No outcome files are emitted. --write edits authored metadata only after all
five runs succeed. Unsupported/draft pipelines fail instead of fabricating data.
"""
import argparse
from datetime import datetime, timezone
import importlib.util
import json
import os
from pathlib import Path
import sys
import tempfile
from common import ROOT, config, is_stub, read_json, records, reference

sys.path.insert(0, str(ROOT / "dlguide"))
from dlguide import Problem, Submission
from dlguide.runtime import metric_spec

SEEDS = (11, 23, 37, 53, 71)


def train_once(problem, root, seed, allow_cpu=False):
    namespace = {"__name__": "dlguide_reference", "Submission": Submission}
    code = reference(root, problem)
    exec(compile(code, str(root / problem.get("reference", problem.get("reference_path", "reference.py"))), "exec"), namespace)
    if not callable(namespace.get("solve")):
        raise RuntimeError("Reference must define solve(data) returning Submission.")
    p = Problem(problem["id"], root / "dlguide" / "dlguide" / "metadata", seed)
    data = p.data()
    with p.budget() as budget:
        submission = namespace["solve"](data)
        p.check(submission)
        budget.validate(submission.model)
        if budget.gpu == "CPU" and not allow_cpu:
            raise RuntimeError("Reference trained a CPU model. Move model and batches to CUDA, or opt into --allow-cpu; available GPU is not proof of GPU training.")
        score = p._score(submission, "val")
    return score, budget


def calibrate(problem, root=ROOT, allow_cpu=False):
    import torch
    if not torch.cuda.is_available() and not allow_cpu:
        raise RuntimeError("Calibration requires CUDA. Use --allow-cpu only for explicitly labeled CPU exploration.")
    code = reference(root, problem)
    if is_stub(problem, code):
        # A complete implementation may still be a draft before its first calibration.
        if not code.strip() or "raise NotImplementedError" in code:
            raise RuntimeError("Reference pipeline is unimplemented; cannot calibrate.")
    import ast
    for node in ast.walk(ast.parse(code)):
        if (isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute)
                and node.func.attr == "manual_seed" and isinstance(node.func.value, ast.Name)
                and node.func.value.id == "torch" and node.args
                and isinstance(node.args[0], ast.Constant)):
            raise RuntimeError("Reference hard-codes torch.manual_seed and would erase the five calibration seeds. Use the seed established by P.budget(), or torch.initial_seed().")
    scores, budgets = [], []
    for seed in SEEDS:
        score, budget = train_once(problem, root, seed, allow_cpu)
        if not __import__("math").isfinite(score):
            raise RuntimeError("Reference produced a nonfinite metric.")
        scores.append(score)
        budgets.append(budget)
        print("seed={} metric={:.6f} time={:.3f}s parameters={} GPU={}".format(seed, score, budget.elapsed, budget.parameters, budget.gpu))
    direction = metric_spec(problem)["direction"]
    lower = direction in ("minimize", "lower", "min", "lower_is_better")
    # Conservative envelope over five actual runs; no invented measurements.
    target = max(scores) if lower else min(scores)
    calibration = {"calibrated": True, "seed_count": len(SEEDS), "seeds": list(SEEDS),
                   "device": budgets[0].gpu, "hardware": budgets[0].gpu,
                   "split": "val", "direction": direction,
                   "date": datetime.now(timezone.utc).isoformat(),
                   "allow_cpu": budgets[0].gpu == "CPU"}
    return target, calibration


def atomic_update(root, problem, target, calibration):
    source = root / problem.get("_source", "content/catalog.json")
    obj = read_json(source)
    if isinstance(obj, dict) and obj.get("id") == problem["id"]:
        item = obj
    else:
        sequence = obj if isinstance(obj, list) else obj.get("problems", [])
        item = next((p for p in sequence if p.get("id") == problem["id"]), None)
    if item is None:
        raise RuntimeError("Cannot locate authored metadata for atomic update.")
    item["threshold"] = target
    if isinstance(item.get("metric"), dict):
        item["metric"]["threshold"] = target
    item["calibration"] = dict(calibration, state="calibrated")
    # Publication remains an explicit editorial choice, not a side effect.
    fd, temp = tempfile.mkstemp(prefix=".calibration-", suffix=".tmp", dir=str(source.parent))
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(obj, handle, indent=2, ensure_ascii=False)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temp, source)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("problem")
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--allow-cpu", action="store_true", help="Explicitly labeled CPU exploration, never T4 evidence")
    parser.add_argument("--write", action="store_true", help="Atomically update authored threshold/provenance after five successful runs")
    args = parser.parse_args()
    try:
        problems, _, _ = records(args.root)
        item = next(p for p in problems if p["id"] == args.problem)
        target, provenance = calibrate(item, args.root, args.allow_cpu)
        print("Proposed threshold:", target, "hardware:", provenance["device"])
        if args.write:
            atomic_update(args.root, item, target, provenance)
            print("Authored metadata updated atomically. Rebuild the runtime bundle before use.")
    except Exception as exc:
        print("Calibration FAIL: {}: {}".format(type(exc).__name__, exc), file=sys.stderr)
        sys.exit(1)
