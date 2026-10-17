"""Neural probabilistic language model: learn fixed-context embeddings and predict the next TinyShakespeare character; compare bits per character with a smoothed n-gram."""
def solve(data):
    import torch
    import numpy as np
    from torch import nn
    from dlguide import Submission
    # Read integer [N,context] inputs; shifted labels use y[:,-1]. Use public vocab_size if supplied. Embed, flatten fixed context, tanh hidden, vocabulary logits. Fit cross-entropy; report loss/log(2) and a training-only smoothed bigram baseline.
    # Keep imports/classes/helpers inside solve. The notebook owns P.budget().
    # Fit only data['train']; return Submission(model=model, extras=diagnostics).
    raise NotImplementedError('Implement the mechanism and controlled ablation')
