"""Character next-token contract; synthetic token fixtures are not a corpus score."""
def check(submission, data=None):
    import torch
    model = submission.model
    model.eval()
    tokens = torch.zeros(4, model.context_length, dtype=torch.long) if data is None else data['val'].tensors[0][:4]
    with torch.no_grad():
        logits = model(tokens)
    assert logits.shape == (len(tokens), model.vocab_size)
    assert torch.isfinite(logits).all()
    return True

def reference():
    import importlib.util
    from pathlib import Path
    spec = importlib.util.spec_from_file_location('language_reference', Path(__file__).with_name('solution.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.solve

def test_language_and_ngram_contract():
    import torch
    from torch.utils.data import TensorDataset
    tokens = torch.arange(128).reshape(32, 4) % 7
    targets = (tokens[:, -1] + 1) % 7
    ds = TensorDataset(tokens, targets)
    data = {'train': ds, 'val': ds, 'vocab_size': 7}
    submission = reference()(data)
    assert check(submission, data)
    baseline = submission.extras['ngram_probabilities']
    torch.testing.assert_close(baseline.sum(1), torch.ones(7))
    assert baseline.min() > 0
    assert submission.extras['validation_bpc'] >= 0
    assert submission.extras['ngram_validation_bpc'] >= 0
    with torch.no_grad():
        bpc = torch.nn.functional.cross_entropy(submission.model(tokens), targets) / torch.log(torch.tensor(2.))
    assert torch.isfinite(bpc)

def test_shifted_labels_and_validation_independence():
    import torch
    from torch.utils.data import TensorDataset
    x = torch.arange(128).reshape(32, 4) % 7
    y = (x + 1) % 7
    train = TensorDataset(x, y)
    solve = reference()
    a = solve({'train': train, 'val': TensorDataset(x, y), 'vocab_size': 7})
    b = solve({'train': train, 'val': TensorDataset(x, (y+2)%7), 'vocab_size': 7})
    for left, right in zip(a.model.parameters(), b.model.parameters()):
        torch.testing.assert_close(left, right, atol=0, rtol=0)

