"""Compute-budget speedrun capstone: combine an explicitly chosen model optimization and evaluation task into a reproducible fixed-compute speedrun; benchmark citation is methodological background not a canonical speedrun model paper.

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
    raise NotImplementedError("Implement Compute-budget speedrun capstone; return Submission(model=model)")
