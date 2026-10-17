#!/usr/bin/env python3
"""Build static site catalog and installable runtime metadata, not outcomes."""
import argparse
import shutil
from pathlib import Path
from common import ROOT, clean_record, config, links, records, reference, safe_path, source, write_json


def build(root=ROOT):
    cfg = config(root)
    problems, modules, contests = records(root)
    if not problems:
        raise ValueError("No problems found under content/.")
    full_problems = []
    bundle = root / "dlguide" / "dlguide" / "metadata"
    bundle.mkdir(parents=True, exist_ok=True)
    expected = set()
    for problem in problems:
        record = clean_record(problem)
        record["links"] = links(problem, cfg)
        record["source"] = problem.get("_source", problem.get("source", ""))
        record["calibrated"] = problem.get("calibration", {}).get("calibrated", problem.get("calibration", {}).get("state") == "calibrated")
        record["targets"] = {"metric": problem.get("metric"), "status": "calibrated" if record["calibrated"] else "uncalibrated; no validated pass threshold"}
        if problem.get("reference"):
            record["reference_solution"] = "https://github.com/{}/{}/blob/{}/dl-guide/{}".format(cfg.get("org", "ThomasKidane"), cfg.get("repo", "portfolio2"), cfg.get("branch", "main"), problem["reference"])
        record["statement_source"] = source(root, problem, "statement", "statement_path", "description_path")
        record["editorial_source"] = source(root, problem, "editorial", "editorial_path")
        record["reference_source"] = reference(root, problem)
        full_problems.append(record)
        metadata = clean_record(problem)
        metadata["config"] = cfg
        checker = problem.get("tests", problem.get("test_path"))
        if isinstance(checker, str) and checker.endswith(".py"):
            src = safe_path(root, checker)
            target = root / "dlguide" / "dlguide" / "checks" / (problem["id"] + ".py")
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, target)
            metadata["check_module"] = target.name
        filename = problem["id"] + ".json"
        expected.add(filename)
        write_json(bundle / filename, metadata)
    for stale in bundle.glob("*.json"):
        if stale.name not in expected:
            stale.unlink()
    full_modules = []
    for module in modules:
        record = clean_record(module)
        record["module_source"] = module.get("_body") or source(root, module, "source", "source_path", "path", "lesson", "content", "body")
        record["source"] = module.get("source_path", module.get("source", module.get("path", "")))
        if module.get("kind") == "contest":
            record["contest"] = module.get("contest", {"duration": "120 minutes (provisional)", "scoring": "Self-reported learning evidence; no calibrated pass or ranking."})
        full_modules.append(record)
    generated_contests = contests or [m for m in full_modules if m.get("kind") == "contest"]
    catalog = {"problems": full_problems, "modules": full_modules, "contests": generated_contests, "config": cfg}
    write_json(root / "site" / "src" / "generated" / "catalog.json", catalog)
    print("Built catalog: {} problems, {} modules, {} contests; bundled runtime metadata.".format(len(problems), len(modules), len(generated_contests)))
    return catalog


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    build(parser.parse_args().root)
