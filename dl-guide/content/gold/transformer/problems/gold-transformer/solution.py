"""Scaled dot-product attention, not a full translation Transformer."""
def solve(data):
    import math
    import torch
    from torch import nn
    from dlguide import Submission

    class Attention(nn.Module):
        def forward(self, q, k, v, mask=None):
            # Leading dimensions broadcast; final dimensions are sequence,width.
            scores = q @ k.transpose(-2, -1) / math.sqrt(q.shape[-1])
            if mask is not None:
                if mask.dtype == torch.bool:
                    # Same convention as PyTorch SDPA: True means allowed.
                    scores = scores.masked_fill(~mask, float("-inf"))
                else:
                    scores = scores + mask
            weights = torch.softmax(scores, dim=-1)
            # An entirely masked row has zero output, matching SDPA.
            weights = torch.nan_to_num(weights, nan=0.0)
            return weights @ v

    return Submission(model=Attention(), extras={"calibrated": False})
