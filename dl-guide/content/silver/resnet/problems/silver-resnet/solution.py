"""Small, bounded reference. All implementation lives inside solve."""
def solve(data):
    import torch
    from torch import nn
    from dlguide import Submission
    # Problem/budget/calibrator owns the RNG seed; do not reset it here.
    class ResidualBlock(nn.Module):
        def __init__(self, width):
            super().__init__()
            self.conv1 = nn.Conv2d(width, width, 3, padding=1, bias=False)
            self.bn1 = nn.BatchNorm2d(width)
            self.conv2 = nn.Conv2d(width, width, 3, padding=1, bias=False)
            self.bn2 = nn.BatchNorm2d(width)
        def forward(self, x):
            branch = torch.relu(self.bn1(self.conv1(x)))
            branch = self.bn2(self.conv2(branch))
            return torch.relu(x + branch)
    x, y = data["train"].tensors
    model = nn.Sequential(nn.Conv2d(x.shape[1], 16, 3, padding=1),
        nn.BatchNorm2d(16), nn.ReLU(), ResidualBlock(16), ResidualBlock(16),
        nn.AdaptiveAvgPool2d(1), nn.Flatten(), nn.Linear(16, int(y.max()) + 1))


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
