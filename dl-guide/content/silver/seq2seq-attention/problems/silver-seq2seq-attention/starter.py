"""Seq2Seq with attention: translate deterministic generated date strings with encoder-decoder additive attention; aspirational exact match 0.95.

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
    raise NotImplementedError("Implement Seq2Seq with attention; return Submission(model=model)")
