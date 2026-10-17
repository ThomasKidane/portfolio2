#!/usr/bin/env python3
"""Validate authored metadata, graph, source links and generated notebooks."""
import argparse
import math
from pathlib import Path
import re
import sys
from common import ROOT, config, links, read_json, records, reference, safe_path, source, starter

DIVISIONS = {"bronze", "silver", "gold", "platinum", "Bronze", "Silver", "Gold", "Platinum"}
DIRECTIONS = {"maximize", "minimize", "higher", "lower", "max", "min", "higher_is_better", "lower_is_better"}
STATUSES = {"draft", "stub", "planned", "published", "calibrated", "ready"}


def validate(root=ROOT, notebooks=True):
    errors = []
    cfg = config(root)
    problems, modules, contests = records(root)
    if not problems:
        errors.append("No problems found under content/.")
    for key in ("org", "repo", "branch", "notebook_root", "runtime_ref", "site_url"):
        if not cfg.get(key):
            errors.append("site.config.json missing {}".format(key))
    ids = set()
    all_records = problems + modules + contests
    by_id = {}
    for record in all_records:
        rid = record.get("id")
        if not isinstance(rid, str) or not re.fullmatch(r"[a-z0-9][a-z0-9-]*", rid):
            errors.append("Invalid stable id: {!r}".format(rid))
            continue
        if rid in ids:
            errors.append("Duplicate id: " + rid)
        ids.add(rid)
        by_id[rid] = record
    graph = {}
    for record in all_records:
        rid = record.get("id", "<missing>")
        if not record.get("title"):
            errors.append("{} missing title".format(rid))
        deps = record.get("prerequisites", [])
        if not isinstance(deps, list):
            errors.append("{} prerequisites must be a list".format(rid))
            deps = []
        deps = list(deps)
        previous = record.get("previous_model")
        if previous:
            deps.append(previous)
        graph[rid] = deps
        for dependency in deps:
            if dependency not in ids:
                errors.append("{} unknown prerequisite {}".format(rid, dependency))
    visiting, visited = set(), set()
    def visit(node):
        if node in visiting:
            errors.append("Prerequisite cycle at " + node)
            return
        if node in visited:
            return
        visiting.add(node)
        for dep in graph.get(node, []):
            visit(dep)
        visiting.remove(node)
        visited.add(node)
    for node in graph:
        visit(node)
    for problem in problems:
        pid = problem.get("id", "<missing>")
        for key in ("division", "dataset", "metric", "budget", "status"):
            if key not in problem:
                errors.append("{} missing {}".format(pid, key))
        if problem.get("division") not in DIVISIONS:
            errors.append("{} invalid division".format(pid))
        if problem.get("status") not in STATUSES:
            errors.append("{} invalid status".format(pid))
        if "implementation" in problem and problem["implementation"] not in ("reference", "stub", "planned"):
            errors.append("{} invalid implementation enum".format(pid))
        if "kind" in problem and problem["kind"] not in ("model", "mechanism", "pipeline", "ablation", "operator", "training"):
            errors.append("{} invalid kind enum".format(pid))
        if "difficulty" in problem and (not isinstance(problem["difficulty"], int) or not 1 <= problem["difficulty"] <= 5):
            errors.append("{} difficulty must be integer 1..5".format(pid))
        paper = problem.get("paper", {})
        if paper and (not isinstance(paper, dict) or not re.match(r"https?://", paper.get("url", ""))):
            errors.append("{} invalid paper URL".format(pid))
        metric = problem.get("metric", {})
        direction = metric.get("direction") if isinstance(metric, dict) else problem.get("direction", problem.get("metric_direction"))
        if direction not in DIRECTIONS:
            errors.append("{} invalid or missing metric direction".format(pid))
        dataset = problem.get("dataset")
        if not isinstance(dataset, (str, dict)) or not dataset:
            errors.append("{} invalid dataset".format(pid))
        budget = problem.get("budget")
        if not isinstance(budget, dict) or not budget:
            errors.append("{} budget must be nonempty object".format(pid))
        elif any(not isinstance(budget[k], (int, float)) or isinstance(budget[k], bool) or budget[k] <= 0 for k in ("wall_seconds", "parameters", "memory_mb") if k in budget):
            errors.append("{} budget limits must be positive numbers".format(pid))
        for key in ("starter", "starter_path", "reference", "reference_path", "editorial", "editorial_path", "statement", "statement_path", "tests", "test_path"):
            value = problem.get(key)
            if isinstance(value, str):
                if key == "statement" and not re.search(r"\.(?:mdx?|txt)$", value):
                    continue
                try:
                    if not safe_path(root, value).is_file():
                        errors.append("{} missing {} file {}".format(pid, key, value))
                except ValueError as exc:
                    errors.append(str(exc))
        published = problem.get("status") in ("published", "calibrated", "ready")
        if published:
            calibration = problem.get("calibration", {})
            if not calibration.get("calibrated", problem.get("calibrated", False)):
                errors.append("{} published without calibration".format(pid))
            if int(calibration.get("seed_count", len(calibration.get("seeds", [])))) < 5:
                errors.append("{} published calibration needs five seeds".format(pid))
            if not calibration.get("device", calibration.get("hardware")):
                errors.append("{} published calibration missing actual hardware".format(pid))
            target = problem.get("threshold", problem.get("thresholds", metric.get("threshold") if isinstance(metric, dict) else None))
            if isinstance(target, dict):
                target = target.get("pass", target.get("target", target.get("value")))
            if not isinstance(target, (int, float)) or not math.isfinite(target):
                errors.append("{} published threshold must be finite".format(pid))
            if "NotImplementedError" in reference(root, problem) or not reference(root, problem):
                errors.append("{} published reference is incomplete".format(pid))
        for value in problem.get("links", {}).values():
            if not isinstance(value, str) or not re.match(r"https?://", value):
                errors.append("{} invalid external link".format(pid))
        if notebooks and "division" in problem and "id" in problem:
            path = root / "notebooks" / problem["division"] / (pid + ".ipynb")
            if not path.is_file():
                errors.append("{} missing notebook".format(pid))
            else:
                nb = read_json(path)
                cells = nb.get("cells", [])
                if len(cells) != 11:
                    errors.append("{} notebook must have 11 ordered cells".format(pid))
                expected = ["title", "setup", "task", "refresher", "data", "student-solve", "train", "self-check", "grade", "hints", "reflections"]
                if [c.get("id") for c in cells] != expected:
                    errors.append("{} incorrect notebook cell order".format(pid))
                student = next(("".join(c.get("source", [])) for c in cells if c.get("id") == "student-solve"), "")
                if student != starter(root, problem):
                    errors.append("{} notebook student cell is not authored starter".format(pid))
                if any(c.get("outputs") or c.get("execution_count") is not None for c in cells if c.get("cell_type") == "code"):
                    errors.append("{} notebook contains execution output".format(pid))
                raw = path.read_text(encoding="utf-8")
                if links(problem, cfg)["github"] not in raw:
                    errors.append("{} notebook GitHub link mismatch".format(pid))
    for module in modules:
        for pid in module.get("problems", module.get("problem_ids", [])):
            if isinstance(pid, dict):
                pid = pid.get("id")
            if pid not in {p.get("id") for p in problems}:
                errors.append("{} unknown problem {}".format(module.get("id"), pid))
        for key in ("source", "path", "lesson", "content"):
            if key in module and isinstance(module[key], str) and not safe_path(root, module[key]).is_file():
                errors.append("{} missing module source {}".format(module.get("id"), module[key]))
    if notebooks:
        expected_paths = {root / "notebooks" / p["division"] / (p["id"] + ".ipynb") for p in problems if "id" in p and "division" in p}
        for path in (root / "notebooks").rglob("*.ipynb"):
            if path not in expected_paths:
                errors.append("Orphan notebook without problem metadata: {}".format(path.relative_to(root)))
    # Validate repository-local links without making external network requests.
    for path in (root / "content").rglob("*.mdx"):
        text = path.read_text(encoding="utf-8")
        for target in re.findall(r"\]\(([^)\s]+)(?:\s+[^)]*)?\)", text):
            if re.match(r"(?:https?://|mailto:|#|/)", target):
                continue
            relative = target.split("#", 1)[0].split("?", 1)[0]
            if relative and not (path.parent / relative).is_file():
                errors.append("Broken local link {} in {}".format(target, path.relative_to(root)))
    for contest in contests:
        for pid in contest.get("problems", []):
            if pid not in {p.get("id") for p in problems}:
                errors.append("{} unknown contest problem {}".format(contest.get("id"), pid))
    return errors


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--no-notebooks", action="store_true")
    args = parser.parse_args()
    failures = validate(args.root, not args.no_notebooks)
    for failure in failures:
        print("ERROR:", failure)
    print("Validation {} ({} errors).".format("FAIL" if failures else "PASS", len(failures)))
    sys.exit(bool(failures))
