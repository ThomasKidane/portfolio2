"""Denoising autoencoder: reconstruct clean MNIST from corrupted inputs under a bottleneck parameter budget."""
def solve(data):
    import torch
    import numpy as np
    from torch import nn
    from dlguide import Submission
    # Ignore digit labels. Mask training pixels with probability 0.3; predict clean images using a 16-unit bottleneck and sigmoid decoder. Return image-shaped reconstructions; evaluate MSE to clean images under fixed corruption.
    # Keep imports/classes/helpers inside solve. The notebook owns P.budget().
    # Fit only data['train']; return Submission(model=model, extras=diagnostics).
    raise NotImplementedError('Implement the mechanism and controlled ablation')
