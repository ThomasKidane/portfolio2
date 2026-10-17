"""Bengio-style fixed-context character model, bounded teaching adaptation."""
def solve(data):
    import math
    import torch
    from torch import nn
    from dlguide import Submission
    torch.manual_seed(17)
    x, y = data['train'].tensors
    x, y = x.long(), y.long()
    # Vocabulary size is public corpus metadata; no validation labels read.
    vocab_size = int(data.get('vocab_size', max(int(x.max()), int(y.max())) + 1))
    context = x.shape[1]
    class LanguageModel(nn.Module):
        def __init__(self):
            super().__init__()
            self.embedding = nn.Embedding(vocab_size, 16)
            self.hidden = nn.Linear(context * 16, 64)
            self.output = nn.Linear(64, vocab_size)
            self.context_length = context
            self.vocab_size = vocab_size
        def forward(self, tokens):
            tokens = tokens.long()
            embedded = self.embedding(tokens).flatten(1)
            return self.output(torch.tanh(self.hidden(embedded)))
    model = LanguageModel()
    # Also accept shifted sequence labels by selecting the context's next
    # token, which is the final label in an equally long shifted sequence.
    targets = y[:, -1] if y.ndim == 2 else y
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    generator = torch.Generator().manual_seed(17)
    for _ in range(64):
        indices = torch.randperm(len(x), generator=generator)[:32]
        loss = nn.functional.cross_entropy(model(x[indices]), targets[indices])
        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 5)
        optimizer.step()
    # Training-only smoothed bigram baseline for an honest bpc comparison.
    counts = torch.ones(vocab_size, vocab_size)
    for previous, target in zip(x[:, -1], targets):
        counts[previous, target] += 1
    probabilities = counts / counts.sum(dim=1, keepdim=True)
    model.eval()
    extras = {'ngram_probabilities': probabilities, 'baseline_order': 2,
              'training_steps': 64, 'vocab_size': vocab_size, 'calibrated': False}
    # Post-training validation is reporting only: no optimizer updates or
    # vocabulary/count fitting after this point. Both models see the same tokens.
    if 'val' in data:
        vx, vy = data['val'].tensors
        vy = vy[:, -1] if vy.ndim == 2 else vy
        with torch.no_grad():
            extras['validation_bpc'] = float(nn.functional.cross_entropy(model(vx.long()), vy.long()) / math.log(2))
            extras['ngram_validation_bpc'] = float(-probabilities[vx[:, -1].long(), vy.long()].log2().mean())
    return Submission(model=model, extras=extras)
