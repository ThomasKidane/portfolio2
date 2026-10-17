"""KV cache and speculative decoding: implement cached autoregressive decoding and rejection-corrected speculative sampling; audit exactness and tokens per second.

Implement only solve(data). Imports must remain inside solve so the
notebook's editable solution cell is self-contained. Never inspect val
labels while fitting. P supplies data and enforces its declared budget.
"""
def solve(data):
    import torch
    from torch import nn
    from dlguide import Submission
    # data["train"] and data["val"] are torch TensorDataset objects.
    # Fit a small model using training tensors only, then return it.
    raise NotImplementedError("Implement KV cache and speculative decoding; return Submission(model=model)")
