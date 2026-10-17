#!/usr/bin/env python3
"""Execute notebooks using reference code substituted ONLY in memory.

Draft stubs are explicitly skipped, not counted as passes. --require-complete
makes any skipped/incomplete pipeline a failure. Never writes executed notebooks.
"""
import argparse
from pathlib import Path
import sys
from common import ROOT, is_stub, read_json, records, reference


def smoke(root=ROOT, require_complete=False, timeout=900):
    try:
        import nbformat
        from nbclient import NotebookClient
    except ImportError as exc:
        raise RuntimeError("Install requirements-dev.txt to execute smoke notebooks.") from exc
    problems, _, _ = records(root)
    failed, passed, skipped = [], [], []
    for problem in problems:
        pid = problem["id"]
        code = reference(root, problem)
        if not code.strip() or "raise NotImplementedError" in code:
            print("SKIP {}: draft/reference pipeline unimplemented".format(pid))
            skipped.append(pid)
            continue
        path = root / "notebooks" / problem["division"] / (pid + ".ipynb")
        try:
            notebook = nbformat.read(str(path), as_version=4)
            target = next(c for c in notebook.cells if c.get("id") == "student-solve")
            target.source = code
            # Use the local built runtime; no installation or network in setup.
            setup = next(c for c in notebook.cells if c.get("id") == "setup")
            setup.source = "import sys, os\nsys.path.insert(0, {!r})\nos.environ['DLGUIDE_METADATA'] = {!r}\nfrom dlguide import Problem, Submission\nP = Problem({!r}, seed=0)\nsubmission = None\n".format(str(root / "dlguide"), str(root / "dlguide" / "dlguide" / "metadata"), pid)
            # Drafts may have a functioning reference but no calibrated threshold.
            # They execute fully, then explicitly report incomplete instead of PASS.
            grade = next(c for c in notebook.cells if c.get("id") == "grade")
            if problem.get("status") in ("draft", "stub", "planned"):
                grade.source += "\nassert submission is not None, P._failure\nassert not P._failure, P._failure\n"
            else:
                grade.source += "\nassert verdict.passed, verdict.message\n"
            NotebookClient(notebook, timeout=timeout, kernel_name="python3", resources={"metadata": {"path": str(root)}}).execute()
            if problem.get("status") in ("draft", "stub", "planned"):
                print("SKIP {}: reference executed, but draft is not calibrated/published".format(pid))
                skipped.append(pid)
            else:
                print("PASS {}: reference notebook executed in memory".format(pid))
                passed.append(pid)
        except Exception as exc:
            failed.append(pid)
            print("FAIL {}: {}: {}".format(pid, type(exc).__name__, exc))
    if not problems:
        print("FAIL: no generated problems to execute")
        failed.append("<empty>")
    print("Smoke summary: {} passed, {} skipped/incomplete, {} failed".format(len(passed), len(skipped), len(failed)))
    return not failed and (not require_complete or not skipped)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--require-complete", action="store_true")
    parser.add_argument("--timeout", type=int, default=900)
    args = parser.parse_args()
    sys.exit(0 if smoke(args.root, args.require_complete, args.timeout) else 1)
