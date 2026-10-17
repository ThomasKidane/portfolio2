"""Online multiclass perceptron; no autograd or validation-label fitting."""
def solve(data):
    import torch
    from torch import nn
    from dlguide import Submission
    torch.manual_seed(17)
    x, y = data['train'].tensors
    x = x.float().flatten(1)
    classes = int(y.max()) + 1
    class Perceptron(nn.Module):
        def __init__(self):
            super().__init__()
            self.linear = nn.Linear(x.shape[1], classes)
            nn.init.zeros_(self.linear.weight)
            nn.init.zeros_(self.linear.bias)
        def forward(self, inputs):
            return self.linear(inputs.float().flatten(1))
    model = Perceptron()
    with torch.no_grad():
        for epoch in range(8):
            for index in range(min(len(x), 128)):
                pred = int(model(x[index:index+1]).argmax())
                target = int(y[index])
                if pred != target:
                    model.linear.weight[target] += 0.05 * x[index]
                    model.linear.weight[pred] -= 0.05 * x[index]
                    model.linear.bias[target] += 0.05
                    model.linear.bias[pred] -= 0.05
    model.eval()
    return Submission(model=model, extras={'updates_cap': 1024, 'calibrated': False})
