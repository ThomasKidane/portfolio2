"""Denoising diffusion probabilistic model: implement forward noise schedules and epsilon prediction on MNIST with a CIFAR extension.

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
    raise NotImplementedError("Implement Denoising diffusion probabilistic model; return Submission(model=model)")
