#!/usr/bin/env python3
"""Generate starter-only notebooks. References never enter notebook sources."""
import argparse
import json
from common import ROOT, config, links, records, safe_path, source, starter, write_json


def cell(kind, text, name):
    value = {"cell_type": kind, "id": name, "metadata": {}, "source": text.splitlines(keepends=True)}
    if kind == "code":
        value.update(execution_count=None, outputs=[])
    return value


def notebook(problem, cfg, root=ROOT):
    pid = problem["id"]
    ref = cfg.get("runtime_ref")
    if not ref or ref in ("main", "master", "HEAD"):
        raise ValueError("site.config.json runtime_ref must pin a runtime-bearing commit or release, not a moving branch.")
    owner = cfg.get("org", cfg.get("owner", "ThomasKidane"))
    repo = cfg.get("repo", "portfolio2")
    install = 'try:\n    import dlguide\nexcept ImportError:\n    %pip -q install "dlguide[vision] @ git+https://github.com/{}/{}.git@{}#subdirectory=dl-guide/dlguide"\nfrom dlguide import Problem, Submission\nP = Problem({!r}, seed=0)\nsubmission = None\n'.format(owner, repo, ref, pid)
    task = source(root, problem, "statement", "statement_path", "description_path") or problem.get("description", "Read the linked problem and meet its metric within the declared budget.")
    refresher = problem.get("refresher", "Use train for fitting and val for choices. Keep held-out evaluation private by convention. Seed stochastic operations and compare a simple baseline first.")
    hints = problem.get("hints", ["Inspect shapes and target dtype.", "Overfit a small training batch before a full run.", "Check validation behavior without training on validation examples."])
    if isinstance(hints, str):
        hints = [hints]
    hint_text = "## Progressive hints\n\n" + "\n\n".join("<details><summary>Hint {}</summary>\n\n{}\n\n</details>".format(i + 1, h) for i, h in enumerate(hints))
    cells = [
        cell("markdown", "# {}\n\nProblem `{}` · {}\n\n[GitHub notebook]({}) · self-reported local progress; no hosted judge.\n".format(problem["title"], pid, problem["division"], links(problem, cfg)["github"]), "title"),
        cell("code", install, "setup"),
        cell("markdown", "## Task and constraints\n\n{}\n\nMetric: `{}`\n\nBudget: `{}`\n".format(task, problem.get("metric"), problem.get("budget", {})), "task"),
        cell("markdown", "## Refresher\n\n{}\n".format(refresher), "refresher"),
        cell("code", 'data = None\ntry:\n    data = P.data()\n    print({name: len(data[name]) for name in ("train", "val")})\n    print("Input and target shapes:", [tuple(t.shape) for t in data["train"].tensors])\nexcept Exception as exc:\n    P._failure = "Dataset unavailable: " + str(exc)\n    print(P._failure)\n', "data"),
        cell("code", starter(root, problem), "student-solve"),
        cell("code", 'try:\n    if data is None:\n        raise RuntimeError(P._failure or "Dataset unavailable")\n    with P.budget() as budget:\n        submission = solve(data)\n        budget.validate(submission.model)\nexcept NotImplementedError as exc:\n    P._failure = "Starter incomplete: " + str(exc)\n    submission = None\nexcept Exception as exc:\n    P._failure = type(exc).__name__ + ": " + str(exc)\n    submission = None\n', "train"),
        cell("code", 'if submission is not None:\n    try:\n        P.check(submission)\n    except Exception as exc:\n        P._failure = "Self-check failed: " + str(exc)\nelse:\n    P.check()\n', "self-check"),
        cell("code", "verdict = P.grade(submission)\n", "grade"),
        cell("markdown", hint_text, "hints"),
        cell("markdown", "## Reflections\n\n1. What baseline did you compare against?\n2. What failed, and what evidence changed your next experiment?\n3. How did validation guide choices without leaking held-out examples?\n4. What would you change under half the time or parameter budget?\n\nA local PASS is a learning signal, not a secure assessment. Only mark Solved when you understand your solution.\n", "reflections")]
    return {"cells": cells, "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}, "language_info": {"name": "python", "version": "3.9"}, "dlguide": {"problem_id": pid, "runtime_ref": ref}}, "nbformat": 4, "nbformat_minor": 5}


def build(root=ROOT):
    cfg = config(root)
    problems, _, _ = records(root)
    if not problems:
        raise ValueError("No problem metadata found under content/.")
    paths = []
    for problem in problems:
        path = safe_path(root, "notebooks/{}/{}.ipynb".format(problem["division"], problem["id"]))
        write_json(path, notebook(problem, cfg, root))
        paths.append(path)
    print("Built {} starter-only notebooks.".format(len(paths)))
    return paths


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=__import__("pathlib").Path, default=ROOT)
    args = parser.parse_args()
    build(args.root)
