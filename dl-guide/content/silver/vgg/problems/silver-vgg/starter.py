"""VGG 3x3 convolution golf: stack 3x3 convolution blocks and minimize parameters at fixed CIFAR-10 quality.

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
    raise NotImplementedError("Implement VGG 3x3 convolution golf; return Submission(model=model)")
