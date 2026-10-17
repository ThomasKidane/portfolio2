"""Explicit velocity update plus controlled ill-conditioned quadratic traces."""
def solve(data):
    import torch
    from torch import nn
    from dlguide import Submission
    torch.manual_seed(17)
    # f(w) = .5 * w^T diag(1,20) w; both controls have the same start/lr.
    def quadratic(beta):
        point = torch.tensor([2., 2.], dtype=torch.float64)
        velocity = torch.zeros_like(point)
        diagonal = torch.tensor([1., 20.], dtype=torch.float64)
        losses = []
        for _ in range(60):
            losses.append(float(0.5 * (diagonal * point.square()).sum()))
            velocity = beta * velocity + diagonal * point
            point -= 0.03 * velocity
        return losses
    x, y = data['train'].tensors
    model = nn.Sequential(nn.Flatten(), nn.Linear(x[0].numel(), 24), nn.Tanh(), nn.Linear(24, int(y.max()) + 1))
    velocities = [torch.zeros_like(parameter) for parameter in model.parameters()]
    losses = []
    for _ in range(40):
        model.zero_grad()
        loss = torch.nn.functional.cross_entropy(model(x[:128].float()), y[:128].long())
        losses.append(float(loss.detach()))
        loss.backward()
        with torch.no_grad():
            for parameter, velocity in zip(model.parameters(), velocities):
                velocity.mul_(0.9).add_(parameter.grad)
                parameter.add_(velocity, alpha=-0.03)
    model.eval()
    return Submission(model=model, extras={'quadratic_sgd': quadratic(0), 'quadratic_momentum': quadratic(0.8),
                                          'loss_trace': losses, 'training_steps': 40, 'calibrated': False})
