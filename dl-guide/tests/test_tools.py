import json
import sys

import pytest

from build_notebooks import build as notebooks, notebook
from build_problem_tables import build as tables
from calibrate import atomic_update, calibrate
from common import config, links, read_json
from validate import validate


def test_build_catalog_and_bundled_metadata(guide):
    root, problem = guide
    catalog = tables(root)
    assert catalog["problems"][0]["reference_source"].startswith("import torch")
    assert "editorial_source" in catalog["problems"][0]
    meta = read_json(root / "dlguide/dlguide/metadata/toy-linear.json")
    assert meta["id"] == "toy-linear"
    assert "reference_source" not in meta
    assert links(problem, config(root))["github"] == "https://github.com/ThomasKidane/portfolio2/blob/main/dl-guide/notebooks/bronze/toy-linear.ipynb"


def test_notebook_has_only_starter_and_eleven_ordered_cells(guide):
    root, problem = guide
    paths = notebooks(root)
    nb = read_json(paths[0])
    assert len(nb["cells"]) == 11
    raw = paths[0].read_text()
    assert "torch.optim.SGD" not in raw
    assert "NotImplementedError" in raw
    assert "except NotImplementedError" in raw
    assert "budget.validate(submission.model)" in raw
    assert all(not c.get("outputs") for c in nb["cells"])
    assert validate(root) == []


def test_yaml_problem_and_mdx_module_discovery(guide):
    from common import records
    root, problem = guide
    (root / "content/catalog.json").unlink()
    folder = root / "content/bronze/model-lab/problems/toy-linear"
    folder.mkdir(parents=True)
    problem.pop("starter")
    problem.pop("reference")
    problem["editorial"] = "editorial.mdx"
    (folder / "problem.yaml").write_text(json.dumps(problem))
    (folder / "starter.py").write_text("def solve(data):\n    raise NotImplementedError\n")
    (folder / "solution.py").write_text("def solve(data):\n    raise NotImplementedError\n")
    (folder / "editorial.mdx").write_text("# Editorial")
    (folder / "tests.py").write_text("def check(submission):\n    return True\n")
    module = root / "content/bronze/model-lab/module.mdx"
    module.write_text("---\nid: bronze-model-lab\ntitle: Model Lab\ndivision: bronze\nmodule: model-lab\nkind: lesson\n---\n# Lesson\n")
    problems, modules, contests = records(root)
    assert problems[0]["starter"].endswith("toy-linear/starter.py")
    assert problems[0]["reference"].endswith("toy-linear/solution.py")
    assert modules[0]["_body"] == "# Lesson"
    catalog = tables(root)
    assert catalog["modules"][0]["source"].endswith("module.mdx")
    assert catalog["modules"][0]["module_source"] == "# Lesson"
    assert (root / "dlguide/dlguide/checks/toy-linear.py").is_file()


def test_advanced_reading_module_needs_no_problem_or_notebook(guide):
    root, problem = guide
    (root / "content/catalog.json").unlink()
    (root / "content/problems.json").write_text(json.dumps([problem]))
    folder = root / "content/advanced/causal-interventions"
    folder.mkdir(parents=True)
    (folder / "module.mdx").write_text(
        "---\nid: advanced-causal-interventions\ntitle: Causal Interventions\n"
        "division: advanced\nkind: research\norder: 1\nproblems: []\n"
        "prerequisites: []\n---\n# Causal Interventions\n\nResearch exploration.\n"
    )
    catalog = tables(root)
    research = catalog["modules"][0]
    assert research["division"] == "advanced"
    assert research["kind"] == "research"
    assert research["problems"] == []
    assert "# Causal Interventions" in research["module_source"]
    paths = notebooks(root)
    assert len(paths) == 1  # Only the existing problem gets a notebook.
    assert not (root / "notebooks/advanced").exists()
    assert validate(root) == []


def test_notebook_ref_must_be_pinned(guide):
    root, problem = guide
    cfg = config(root)
    cfg["runtime_ref"] = "main"
    with pytest.raises(ValueError, match="pin"):
        notebook(problem, cfg, root)


def test_validator_detects_cycle_and_bad_direction(guide):
    root, problem = guide
    problem["prerequisites"] = [problem["id"]]
    problem["metric"]["direction"] = "sideways"
    (root / "content/catalog.json").write_text(json.dumps({"problems": [problem]}))
    errors = validate(root, notebooks=False)
    assert any("cycle" in e for e in errors)
    assert any("direction" in e for e in errors)


def test_only_published_requires_calibration(guide):
    root, problem = guide
    assert not validate(root, notebooks=False)
    problem["status"] = "published"
    (root / "content/catalog.json").write_text(json.dumps({"problems": [problem]}))
    errors = validate(root, notebooks=False)
    assert any("calibration" in e for e in errors)


def test_atomic_threshold_update(guide):
    root, problem = guide
    atomic_update(root, problem, 0.6, {"calibrated": True, "seed_count": 5, "device": "CPU"})
    obj = read_json(root / "content/catalog.json")
    assert obj["problems"][0]["threshold"] == 0.6
    assert not list((root / "content").glob(".calibration-*"))


def test_calibration_requires_gpu_by_default(guide, monkeypatch):
    import torch
    monkeypatch.setattr(torch.cuda, "is_available", lambda: False)
    root, problem = guide
    with pytest.raises(RuntimeError, match="requires CUDA"):
        calibrate(problem, root)


def test_calibration_five_actual_runs_and_cpu_label(guide, monkeypatch):
    import calibrate as tool
    import torch
    monkeypatch.setattr(torch.cuda, "is_available", lambda: False)
    root, problem = guide
    tables(root)
    # Real reference solve performs two optimizer steps for every one of five seeds.
    target, provenance = calibrate(problem, root, allow_cpu=True)
    assert 0 <= target <= 1
    assert provenance["device"] == "CPU"
    assert provenance["seed_count"] == 5
    assert len(set(provenance["seeds"])) == 5
    assert provenance["allow_cpu"]


def test_calibration_rejects_fixed_seed_without_metadata_changes(guide, monkeypatch):
    import torch
    monkeypatch.setattr(torch.cuda, "is_available", lambda: False)
    root, problem = guide
    before = (root / "content/catalog.json").read_bytes()
    (root / problem["reference"]).write_text("import torch\ndef solve(data):\n    torch.manual_seed(17)\n")
    with pytest.raises(RuntimeError, match="erase the five"):
        calibrate(problem, root, allow_cpu=True)
    assert (root / "content/catalog.json").read_bytes() == before


def test_smoke_stub_explicit_skip_and_strict_failure(guide, capsys):
    from smoke import smoke
    root, problem = guide
    (root / problem["reference"]).write_text("def solve(data):\n    raise NotImplementedError\n")
    assert smoke(root)
    assert "SKIP" in capsys.readouterr().out
    assert not smoke(root, require_complete=True)


def test_student_notebook_executes_to_fail_without_exception(guide):
    import nbformat
    from nbclient import NotebookClient
    from common import ROOT
    root, problem = guide
    tables(root)
    path = notebooks(root)[0]
    nb = nbformat.read(str(path), as_version=4)
    nb.cells[1].source = "import sys\nsys.path.insert(0, {!r})\nfrom dlguide import Problem, Submission\nP = Problem('toy-linear', metadata_dir={!r})\nsubmission = None".format(str(ROOT / "dlguide"), str(root / "dlguide/dlguide/metadata"))
    NotebookClient(nb, timeout=90, kernel_name="python3").execute()
    text = "".join(output.get("text", "") for cell in nb.cells for output in cell.get("outputs", []))
    assert "FAIL" in text
    assert "Starter incomplete" in text
    assert not any(output.get("output_type") == "error" for cell in nb.cells for output in cell.get("outputs", []))


def test_smoke_rejects_unsupported_metric_instead_of_fake_success(guide):
    from smoke import smoke
    from common import ROOT
    import shutil
    root, problem = guide
    problem['metric']['name'] = 'unimplemented-pipeline-metric'
    (root / 'content/catalog.json').write_text(json.dumps({'problems': [problem]}))
    shutil.copytree(ROOT / 'dlguide/dlguide', root / 'dlguide/dlguide')
    tables(root)
    notebooks(root)
    assert not smoke(root, timeout=60)


def test_smoke_executes_reference_in_memory_only(guide):
    from smoke import smoke
    root, problem = guide
    # Local source package path is normally under root; fixture uses the real runtime.
    from common import ROOT
    import shutil
    shutil.copytree(ROOT / "dlguide/dlguide", root / "dlguide/dlguide")
    tables(root)
    path = notebooks(root)[0]
    original = path.read_bytes()
    assert smoke(root, timeout=90)
    assert path.read_bytes() == original
    assert not smoke(root, require_complete=True, timeout=90)
