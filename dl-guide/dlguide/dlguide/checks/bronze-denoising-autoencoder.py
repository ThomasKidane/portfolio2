"""Reconstruction checks use image targets, never MNIST class labels."""
def check(submission, data=None):
    import torch
    model = submission.model.eval()
    inputs = torch.zeros(4, *model.input_shape) if data is None else data['val'].tensors[0][:4].float()
    with torch.no_grad():
        recon = model(inputs)
    assert recon.shape == inputs.shape
    assert torch.isfinite(recon).all()
    assert recon.min() >= 0 and recon.max() <= 1
    assert sum(p.numel() for p in model.parameters()) <= 30000
    return True

def reference():
    import importlib.util
    from pathlib import Path
    spec = importlib.util.spec_from_file_location('denoising_reference', Path(__file__).with_name('solution.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.solve

def test_reconstruction_and_bottleneck():
    import torch
    from torch.utils.data import TensorDataset
    x = torch.rand(32, 1, 28, 28, generator=torch.Generator().manual_seed(31))
    labels = torch.arange(32) % 10
    data = {'train': TensorDataset(x, labels), 'val': TensorDataset(x[:8], labels[:8])}
    result = reference()(data)
    assert check(result, data)
    assert result.model.encoder.out_features == 16
    assert result.extras['loss_trace'][-1] < result.extras['loss_trace'][0]

def test_class_labels_do_not_affect_reconstruction_training():
    import torch
    from torch.utils.data import TensorDataset
    x = torch.zeros(16, 1, 28, 28)
    solve = reference()
    a = solve({'train': TensorDataset(x, torch.zeros(16, dtype=torch.long))})
    b = solve({'train': TensorDataset(x, torch.ones(16, dtype=torch.long))})
    for left, right in zip(a.model.parameters(), b.model.parameters()):
        torch.testing.assert_close(left, right, rtol=0, atol=0)

