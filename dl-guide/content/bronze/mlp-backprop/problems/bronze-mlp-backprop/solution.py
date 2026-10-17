"""NumPy backpropagation with an independently checked analytic gradient."""
def solve(data):
    import numpy as np
    import torch
    from torch import nn
    from dlguide import Submission
    x, y = data['train'].tensors
    inputs = x.detach().cpu().numpy().reshape(len(x), -1).astype(np.float64)
    targets = y.detach().cpu().numpy().astype(np.int64)
    classes = int(targets.max()) + 1
    rng = np.random.default_rng(17)
    w1 = rng.normal(0, np.sqrt(2 / (inputs.shape[1] + 32)), (inputs.shape[1], 32))
    b1 = np.zeros(32)
    w2 = rng.normal(0, np.sqrt(2 / (32 + classes)), (32, classes))
    b2 = np.zeros(classes)
    def loss_grad(batch, labels, weights):
        a, b, c, d = weights
        hidden = np.tanh(batch @ a + b)
        logits = hidden @ c + d
        logits -= logits.max(axis=1, keepdims=True)
        normalizer = np.log(np.exp(logits).sum(axis=1, keepdims=True))
        loss = np.mean(normalizer[:, 0] - logits[np.arange(len(batch)), labels])
        probs = np.exp(logits - normalizer)
        probs[np.arange(len(batch)), labels] -= 1
        probs /= len(batch)
        dh = (probs @ c.T) * (1 - hidden ** 2)
        return loss, (batch.T @ dh, dh.sum(axis=0), hidden.T @ probs, probs.sum(axis=0))
    weights = [w1, b1, w2, b2]
    # Central differences test an element of every parameter tensor.
    sample, labels = inputs[:8], targets[:8]
    _, gradients = loss_grad(sample, labels, weights)
    errors = []
    for parameter, gradient in zip(weights, gradients):
        index = (0,) * parameter.ndim
        original = parameter[index]
        parameter[index] = original + 1e-5
        plus = loss_grad(sample, labels, weights)[0]
        parameter[index] = original - 1e-5
        minus = loss_grad(sample, labels, weights)[0]
        parameter[index] = original
        errors.append(abs((plus-minus) / 2e-5 - gradient[index]))
    losses = []
    for step in range(160):
        indices = rng.permutation(len(inputs))[:64]
        loss, gradients = loss_grad(inputs[indices], targets[indices], weights)
        losses.append(float(loss))
        for parameter, gradient in zip(weights, gradients):
            parameter -= 0.15 * gradient
    model = nn.Sequential(nn.Flatten(), nn.Linear(inputs.shape[1], 32), nn.Tanh(), nn.Linear(32, classes))
    with torch.no_grad():
        model[1].weight.copy_(torch.from_numpy(w1.T))
        model[1].bias.copy_(torch.from_numpy(b1))
        model[3].weight.copy_(torch.from_numpy(w2.T))
        model[3].bias.copy_(torch.from_numpy(b2))
    model.eval()
    return Submission(model=model, extras={'gradient_max_error': max(errors), 'loss_trace': losses,
                                          'training_steps': 160, 'calibrated': False})
