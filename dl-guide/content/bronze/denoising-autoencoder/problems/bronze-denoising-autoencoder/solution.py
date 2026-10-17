"""Train-only corruption, clean targets, and a compact tied-shape autoencoder."""
def solve(data):
    import torch
    from torch import nn
    from dlguide import Submission
    torch.manual_seed(17)
    x = data['train'].tensors[0].float()
    shape, features = x.shape[1:], x[0].numel()
    class DenoisingAutoencoder(nn.Module):
        def __init__(self):
            super().__init__()
            self.encoder = nn.Linear(features, 16)
            self.decoder = nn.Linear(16, features)
            self.input_shape = tuple(shape)
        def forward(self, inputs):
            hidden = torch.tanh(self.encoder(inputs.flatten(1)))
            return torch.sigmoid(self.decoder(hidden)).reshape(-1, *self.input_shape)
    model = DenoisingAutoencoder()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    generator = torch.Generator().manual_seed(17)
    trace = []
    for _ in range(48):
        indices = torch.randperm(len(x), generator=generator)[:32]
        clean = x[indices]
        keep = torch.rand(clean.shape, generator=generator) >= 0.3
        corrupted = clean * keep
        loss = nn.functional.mse_loss(model(corrupted), clean)
        trace.append(float(loss.detach()))
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
    model.eval()
    return Submission(model=model, extras={'bottleneck': 16, 'corruption_probability': 0.3,
        'training_steps': 48, 'loss_trace': trace, 'calibrated': False})
