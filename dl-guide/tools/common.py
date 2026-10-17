"""Shared source discovery; all paths are relative to the dl-guide root."""
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def write_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def config(root=ROOT):
    path = root / "site.config.json"
    return read_json(path) if path.is_file() else {}


def records(root=ROOT):
    """Accept one catalog or individually authored problem/module JSON records."""
    content = root / "content"
    primary = content / "catalog.json"
    problems, modules, contests = [], [], []
    if primary.is_file():
        catalog = read_json(primary)
        return catalog.get("problems", []), catalog.get("modules", []), catalog.get("contests", [])
    for path in sorted(list(content.rglob("*.json")) + list(content.rglob("*.yaml")) + list(content.rglob("*.yml"))):
        try:
            obj = read_json(path)
        except json.JSONDecodeError:
            try:
                import yaml
            except ImportError as exc:
                raise RuntimeError("YAML build sources require PyYAML; install requirements-dev.txt.") from exc
            obj = yaml.safe_load(path.read_text(encoding="utf-8"))
        if isinstance(obj, list):
            if "problem" in path.name or "problems" in path.parts:
                problems.extend(obj)
            elif "module" in path.name or "modules" in path.parts:
                modules.extend(obj)
            elif "contest" in path.name or "contests" in path.parts:
                contests.extend(obj)
            continue
        if "problems" in obj:
            problems.extend(obj["problems"])
        if "modules" in obj:
            modules.extend(obj["modules"])
        if "contests" in obj:
            contests.extend(obj["contests"])
        if "id" in obj:
            record = dict(obj)
            record.setdefault("_source", str(path.relative_to(root)))
            if "problem" in path.parts or "problems" in path.parts or "dataset" in obj:
                for key, filename in (("starter", "starter.py"), ("reference", "solution.py"), ("editorial", "editorial.mdx"), ("tests", "tests.py")):
                    value = record.get(key, filename)
                    if isinstance(value, str):
                        if (path.parent / value).is_file() or key not in record:
                            record[key] = str((path.parent / value).relative_to(root))
                problems.append(record)
            elif "module" in path.parts or "modules" in path.parts:
                modules.append(record)
            elif "contest" in path.parts or "contests" in path.parts:
                contests.append(record)
    for path in sorted(content.rglob("module.mdx")):
        text = path.read_text(encoding="utf-8")
        if not text.startswith("---\n"):
            raise ValueError("Module missing frontmatter: {}".format(path))
        _, head, body = text.split("---", 2)
        try:
            import yaml
        except ImportError as exc:
            raise RuntimeError("Module frontmatter requires PyYAML; install requirements-dev.txt.") from exc
        module = yaml.safe_load(head)
        module["source_path"] = str(path.relative_to(root))
        module["_body"] = body.strip()
        if module.get("kind") == "contest":
            module.setdefault("problems", [p["id"] for p in problems if re.search(r"(?<![a-z0-9-])" + re.escape(p["id"]) + r"(?![a-z0-9-])", body)])
        else:
            module.setdefault("problems", [p["id"] for p in problems if p.get("division") == module.get("division") and p.get("module") == module.get("module")])
        modules.append(module)
    return problems, modules, contests


def safe_path(root, relative):
    path = (root / relative).resolve()
    if root.resolve() not in path.parents:
        raise ValueError("Path escapes guide root: {}".format(relative))
    return path


def source(root, record, *keys):
    for key in keys:
        value = record.get(key)
        if isinstance(value, str) and value:
            if key in ("statement", "description", "body") and ("\n" in value or len(value) > 180 or not re.search(r"\.(?:mdx?|txt)$", value)):
                return value
            path = safe_path(root, value)
            if path.is_file():
                return path.read_text(encoding="utf-8")
    return ""


def notebook_path(problem, cfg):
    # Config is repository-relative, while tool root is already dl-guide/.
    prefix = cfg.get("notebook_root", "dl-guide/notebooks").rstrip("/")
    return "{}/{}/{}.ipynb".format(prefix, problem["division"], problem["id"])


def links(problem, cfg):
    owner = cfg.get("org", cfg.get("owner", "ThomasKidane"))
    repo = cfg.get("repo", "portfolio2")
    branch = cfg.get("branch", "main")
    path = notebook_path(problem, cfg)
    github = "https://github.com/{}/{}/blob/{}/{}".format(owner, repo, branch, path)
    return {"github": github, "notebook": github, "download": "https://raw.githubusercontent.com/{}/{}/{}/{}".format(owner, repo, branch, path), "colab": "https://colab.research.google.com/github/{}/{}/blob/{}/{}".format(owner, repo, branch, path)}


def starter(root, problem):
    text = source(root, problem, "starter", "starter_path", "starter_code")
    if not text:
        text = 'from dlguide import Submission\n\ndef solve(data):\n    """Train on data["train"], develop on data["val"], return Submission."""\n    raise NotImplementedError("Implement your model and training loop.")\n'
    return text


def is_stub(problem, reference=""):
    return (problem.get("status") in ("draft", "stub", "planned") or problem.get("stub") is True
            or not reference.strip() or "raise NotImplementedError" in reference)


def reference(root, problem):
    return source(root, problem, "reference", "reference_path", "reference_solution")


def clean_record(record):
    return {k: v for k, v in record.items() if not k.startswith("_")}
