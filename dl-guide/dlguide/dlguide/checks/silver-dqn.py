"""Draft contract placeholder. No model-quality test exists yet."""
def check(submission, data=None):
    raise NotImplementedError("Draft: architecture-specific checks are not implemented")

def test_draft_is_explicit():
    import importlib.util
    from pathlib import Path
    spec = importlib.util.spec_from_file_location("draft_reference", Path(__file__).with_name("solution.py"))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    try:
        module.solve({})
    except NotImplementedError:
        return
    raise AssertionError("Draft reference must fail explicitly")
