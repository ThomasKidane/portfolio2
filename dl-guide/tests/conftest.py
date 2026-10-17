import json
from pathlib import Path
import sys

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "dlguide"))
sys.path.insert(0, str(ROOT / "tools"))


@pytest.fixture(autouse=True)
def no_network(monkeypatch):
    import urllib.request
    def denied(*args, **kwargs):
        raise AssertionError("Unit tests must not access the network")
    monkeypatch.setattr(urllib.request, "urlopen", denied)
    monkeypatch.delenv("DLGUIDE_DOWNLOAD", raising=False)


@pytest.fixture
def guide(tmp_path):
    root = tmp_path
    content = root / "content"
    content.mkdir()
    problem = {"id": "toy-linear", "title": "Toy linear task", "division": "bronze", "status": "draft",
               "dataset": {"name": "synthetic-classification", "train_size": 48, "val_size": 16, "test_size": 16},
               "metric": {"name": "accuracy", "direction": "maximize"},
               "budget": {"wall_seconds": 30, "parameters": 100}, "prerequisites": [],
               "threshold": 0.0, "starter": "content/starter.py", "reference": "content/reference.py",
               "editorial": "content/editorial.md"}
    (content / "starter.py").write_text('from dlguide import Submission\n\ndef solve(data):\n    raise NotImplementedError("Your turn")\n')
    (content / "reference.py").write_text('import torch\nfrom dlguide import Submission\n\ndef solve(data):\n    model = torch.nn.Linear(2, 2)\n    opt = torch.optim.SGD(model.parameters(), lr=0.1)\n    x, y = data["train"].tensors\n    for _ in range(2):\n        opt.zero_grad()\n        loss = torch.nn.functional.cross_entropy(model(x), y)\n        loss.backward()\n        opt.step()\n    return Submission(model)\n')
    (content / "editorial.md").write_text("Use a linear baseline; reference is separate from the starter.")
    (content / "catalog.json").write_text(json.dumps({"problems": [problem], "modules": [], "contests": []}))
    cfg = {"org": "ThomasKidane", "repo": "portfolio2", "branch": "main", "runtime_ref": "a" * 40,
           "notebook_root": "dl-guide/notebooks", "site_url": "/dl-guide/"}
    (root / "site.config.json").write_text(json.dumps(cfg))
    return root, problem
