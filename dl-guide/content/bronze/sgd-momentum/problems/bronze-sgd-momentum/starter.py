"""SGD with momentum: implement velocity updates on an ill-conditioned quadratic and a tiny MLP."""
def solve(data):
    import torch
    import numpy as np
    from torch import nn
    from dlguide import Submission
    # Implement v=beta*v+grad then w=w-lr*v without torch.optim.SGD. Compare beta=0 and beta>0 on the same diag(1,20) quadratic and on the MLP.
    # Keep imports/classes/helpers inside solve. The notebook owns P.budget().
    # Fit only data['train']; return Submission(model=model, extras=diagnostics).
    raise NotImplementedError('Implement the mechanism and controlled ablation')
