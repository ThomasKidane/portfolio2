"""Perceptron: fit separable blobs with the online mistake-driven linear update."""
def solve(data):
    import torch
    import numpy as np
    from torch import nn
    from dlguide import Submission
    # Initialize zero weights and bias. For every mistaken class prediction, add lr*x to the true-class row and subtract it from the predicted row. Use no validation labels.
    # Keep imports/classes/helpers inside solve. The notebook owns P.budget().
    # Fit only data['train']; return Submission(model=model, extras=diagnostics).
    raise NotImplementedError('Implement the mechanism and controlled ablation')
