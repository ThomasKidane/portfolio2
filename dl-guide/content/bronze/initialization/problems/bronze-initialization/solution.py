"""Deep tanh classifier and controlled sigmoid/tanh activation/gradient probes."""
def solve(data):
    import math
    import torch
    from torch import nn
    from dlguide import Submission
    torch.manual_seed(17)
    x, y = data['train'].tensors
    features, classes = x[0].numel(), int(y.max()) + 1
    # The diagnostic compares the same seed and input for each condition.
    diagnostics = {}
    for activation in ('tanh', 'sigmoid'):
        for initialization in ('glorot', 'unit-normal'):
            torch.manual_seed(31)
            values = torch.randn(16, 16, requires_grad=True)
            activations, variances = [], []
            for _ in range(8):
                weight = torch.randn(16, 16)
                if initialization == 'glorot':
                    weight *= math.sqrt(2.0 / 32)
                values = values @ weight
                values = torch.tanh(values) if activation == 'tanh' else torch.sigmoid(values)
                values.retain_grad()
                activations.append(values)
                variances.append(float(values.detach().var()))
            values.square().mean().backward()
            diagnostics[activation + '-' + initialization] = {
                'activation_variance': variances,
                'gradient_norm': [float(item.grad.norm()) for item in activations]}
    torch.manual_seed(17)
    layers = [nn.Flatten(), nn.Linear(features, 32), nn.Tanh()]
    for _ in range(5):
        layers.extend([nn.Linear(32, 32), nn.Tanh()])
    layers.append(nn.Linear(32, classes))
    model = nn.Sequential(*layers)
    for layer in model.modules():
        if isinstance(layer, nn.Linear):
            nn.init.xavier_uniform_(layer.weight)
            nn.init.zeros_(layer.bias)
    optimizer = torch.optim.SGD(model.parameters(), lr=0.05)
    for _ in range(32):
        optimizer.zero_grad()
        loss = nn.functional.cross_entropy(model(x[:128].float()), y[:128].long())
        loss.backward()
        optimizer.step()
    model.eval()
    return Submission(model=model, extras={'diagnostics': diagnostics, 'training_steps': 32, 'calibrated': False})
