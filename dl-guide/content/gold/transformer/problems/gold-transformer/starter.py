"""Implement scaled dot-product attention, not a full translation model."""
def solve(data):
    import math
    import torch
    from torch import nn
    from dlguide import Submission
    class Attention(nn.Module):
        def forward(self, q, k, v, mask=None):
            # q: [..., L, D], k: [..., S, D], v: [..., S, Dv]
            # TODO: scale dot products, apply True=allowed or additive mask,
            # normalize over keys, zero fully masked rows, multiply by v.
            raise NotImplementedError('Implement attention without calling SDPA')
    return Submission(model=Attention())
