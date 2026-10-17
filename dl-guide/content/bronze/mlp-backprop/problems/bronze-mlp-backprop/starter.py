"""MLP and backpropagation: derive NumPy cross-entropy gradients for XOR and a three-arm spiral extension."""
def solve(data):
    import torch
    import numpy as np
    from torch import nn
    from dlguide import Submission
    # Use NumPy to compute tanh hidden activations, stable log-softmax cross-entropy, and gradients for W1,b1,W2,b2. Central-difference-check each tensor. Copy learned arrays into a torch MLP for Submission.
    # Keep imports/classes/helpers inside solve. The notebook owns P.budget().
    # Fit only data['train']; return Submission(model=model, extras=diagnostics).
    raise NotImplementedError('Implement the mechanism and controlled ablation')
