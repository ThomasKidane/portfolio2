"""Value, mask, gradient, and non-square attention equivalence checks."""
def check(submission, data=None):
    import torch
    from torch.nn.functional import scaled_dot_product_attention
    model = submission.model
    generator = torch.Generator().manual_seed(23)
    for batch, heads, queries, keys, width, value_width in [(2, 3, 5, 7, 8, 4), (1, 1, 1, 3, 4, 6)]:
        q = torch.randn(batch, heads, queries, width, generator=generator, dtype=torch.float64)
        k = torch.randn(batch, heads, keys, width, generator=generator, dtype=torch.float64)
        v = torch.randn(batch, heads, keys, value_width, generator=generator, dtype=torch.float64)
        causal = torch.arange(keys)[None, :] <= torch.arange(queries)[:, None]
        additive = torch.zeros(queries, keys, dtype=torch.float64).masked_fill(~causal, float('-inf'))
        empty = torch.zeros(queries, keys, dtype=torch.bool)
        for mask in (None, causal, additive, empty):
            actual = model(q, k, v, mask=mask)
            expected = scaled_dot_product_attention(q, k, v, attn_mask=mask, dropout_p=0.0)
            torch.testing.assert_close(actual, expected, atol=1e-7, rtol=1e-6)
    q = torch.randn(1, 2, 3, 4, generator=generator, dtype=torch.float64, requires_grad=True)
    k = torch.randn(1, 2, 5, 4, generator=generator, dtype=torch.float64, requires_grad=True)
    v = torch.randn(1, 2, 5, 6, generator=generator, dtype=torch.float64, requires_grad=True)
    actual = torch.autograd.grad(model(q, k, v).square().sum(), (q, k, v))
    expected = torch.autograd.grad(scaled_dot_product_attention(q, k, v).square().sum(), (q, k, v))
    for left, right in zip(actual, expected):
        torch.testing.assert_close(left, right, atol=1e-7, rtol=1e-6)
    return True

def test_reference_attention():
    import importlib.util
    from pathlib import Path
    spec = importlib.util.spec_from_file_location('local_reference', Path(__file__).with_name('solution.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    assert check(module.solve({}))

