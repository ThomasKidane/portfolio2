"""Small, bounded reference. All implementation lives inside solve."""
def solve(data):
    import torch
    from torch import nn
    from dlguide import Submission
    # Problem/budget/calibrator owns the RNG seed; do not reset it here.
    # Modernized LeNet-5: dense C3 connectivity, average pools and logits.
    class LeNet5(nn.Module):
        def __init__(self, channels, classes):
            super().__init__()
            self.features = nn.Sequential(
                nn.Conv2d(channels, 6, 5, padding=2), nn.Tanh(), nn.AvgPool2d(2),
                nn.Conv2d(6, 16, 5), nn.Tanh(), nn.AvgPool2d(2),
                nn.AdaptiveAvgPool2d((4, 4)))
            self.head = nn.Sequential(nn.Flatten(), nn.Linear(256, 120),
                nn.Tanh(), nn.Linear(120, 84), nn.Tanh(), nn.Linear(84, classes))
        def forward(self, x):
            return self.head(self.features(x))
    x, y = data["train"].tensors
    model = LeNet5(x.shape[1], int(y.max()) + 1)


    # Deliberately bounded teaching run, not a reproduction of paper results.
    x, y = data["train"].tensors
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    x, y = x.float().to(device), y.long().to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    model.train()
    for step in range(24):
        indices = torch.randperm(len(x), device=device)[:32]
        logits = model(x[indices])
        loss = torch.nn.functional.cross_entropy(logits, y[indices])
        optimizer.zero_grad()
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 5.0)
        optimizer.step()
    model.eval()
    return Submission(model=model, extras={"training_steps": 24, "calibrated": False})
