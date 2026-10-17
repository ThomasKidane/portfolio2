"""Long-context RoPE and YaRN: compare unscaled NTK-aware and YaRN rotary frequencies on long-context retrieval and short-context retention.

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
    raise NotImplementedError("Implement Long-context RoPE and YaRN; return Submission(model=model)")
