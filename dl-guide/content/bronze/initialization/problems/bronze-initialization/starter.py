"""Glorot initialization: track activation and gradient variance through deep sigmoid and tanh networks."""
def solve(data):
    import torch
    import numpy as np
    from torch import nn
    from dlguide import Submission
    # Use variance 2/(fan_in+fan_out), zero biases, and eight-layer activation/gradient probes for sigmoid and tanh. Record a unit-normal control before fitting a deep classifier.
    # Keep imports/classes/helpers inside solve. The notebook owns P.budget().
    # Fit only data['train']; return Submission(model=model, extras=diagnostics).
    raise NotImplementedError('Implement the mechanism and controlled ablation')
