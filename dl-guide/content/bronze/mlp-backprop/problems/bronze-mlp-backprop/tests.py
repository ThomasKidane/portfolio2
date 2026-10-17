"""Contract tests, not evidence of calibrated dataset accuracy.

Public function check(submission, data) is callable by tooling. The test_*
checks import only the local reference during explicit pytest execution.
"""
def check(submission, data=None):
    import torch
    model = submission.model
    model.eval()
    if data is None:
        # Runtime self-checks have no access to labels. This checks only the
        # public shape contract; evaluation uses the real held-out split.
        conv = next((m for m in model.modules() if isinstance(m, torch.nn.Conv2d)), None)
        linear = next((m for m in model.modules() if isinstance(m, torch.nn.Linear)), None)
        if conv is not None:
            x = torch.zeros(8, conv.in_channels, 28, 28)
        elif linear is not None:
            x = torch.zeros(8, linear.in_features)
        else:
            raise AssertionError('Expected a classification model with a linear or convolutional layer')
        y = torch.zeros(8, dtype=torch.long)
    else:
        x, y = data["val"].tensors
    with torch.no_grad():
        device = next(model.parameters()).device
        result = model(x[:8].float().to(device))
    assert result.ndim == 2 and result.shape[0] == min(8, len(x))
    assert result.shape[1] >= int(y.max()) + 1
    assert torch.isfinite(result).all(), "Nonfinite logits"
    assert sum(p.numel() for p in model.parameters()) <= 2000000
    return True

def test_reference_contract():
    import importlib.util
    from pathlib import Path
    import torch
    from torch.utils.data import TensorDataset
    spec = importlib.util.spec_from_file_location("local_reference", Path(__file__).with_name("solution.py"))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    generator = torch.Generator().manual_seed(61)
    x = torch.randn(32, 1, 28, 28, generator=generator)
    y = (x.mean(dim=(1, 2, 3)) > 0).long()
    data = {"train": TensorDataset(x, y), "val": TensorDataset(x[:8], y[:8])}
    assert check(module.solve(data), data)

def test_training_ignores_validation_labels():
    import importlib.util
    from pathlib import Path
    import torch
    from torch.utils.data import TensorDataset
    spec = importlib.util.spec_from_file_location("local_reference", Path(__file__).with_name("solution.py"))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    x = torch.randn(16, 1, 28, 28, generator=torch.Generator().manual_seed(62))
    y = torch.arange(16) % 2
    train = TensorDataset(x, y)
    torch.manual_seed(71)
    first = module.solve({"train": train, "val": TensorDataset(x, y)}).model
    torch.manual_seed(71)
    second = module.solve({"train": train, "val": TensorDataset(x, 1-y)}).model
    for left, right in zip(first.state_dict().values(), second.state_dict().values()):
        torch.testing.assert_close(left, right, rtol=0, atol=0)

def test_numpy_gradient_and_nonlinear_learning():
    import importlib.util
    from pathlib import Path
    import torch
    from torch.utils.data import TensorDataset
    spec = importlib.util.spec_from_file_location('numpy_reference', Path(__file__).with_name('solution.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    x = torch.tensor([[-1.,-1.],[-1.,1.],[1.,-1.],[1.,1.]]).repeat(16,1)
    y = torch.tensor([0,1,1,0]).repeat(16)
    result = module.solve({'train': TensorDataset(x,y)})
    assert result.extras['gradient_max_error'] < 1e-7
    assert (result.model(x).argmax(-1) == y).float().mean() >= 0.99
