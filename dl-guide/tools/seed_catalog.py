#!/usr/bin/env python3
"""Independently authored curriculum source and deterministic content seeder.

Run from any directory with Python 3.9+. No third-party dependency is needed to
seed: JSON is used as a YAML 1.2-compatible serialization. This only writes
content owned by this seeder. It never generates site data or notebooks.
"""
from pathlib import Path
import argparse
import json
import textwrap

ROOT = Path(__file__).resolve().parents[1]

# Entries: slug, display name, publication year, canonical paper title, URL,
#           learning focus, concrete ablation.
CATALOG = {
    'bronze': [
        ('lenet5', 'LeNet-5', 1998, 'Gradient-Based Learning Applied to Document Recognition',
         'https://ieeexplore.ieee.org/document/726791',
         'compose learned local filters, tanh nonlinearities and spatial averaging into a digit classifier',
         'Replace average pooling with max pooling while preserving the training schedule'),
    ],
    'silver': [
        ('resnet', 'ResNet', 2015, 'Deep Residual Learning for Image Recognition',
         'https://arxiv.org/abs/1512.03385',
         'learn a residual correction around an identity shortcut rather than an unconstrained replacement',
         'Remove identity shortcuts while preserving both branch convolutions'),
    ],
    'gold': [
        ('transformer', 'Transformer', 2017, 'Attention Is All You Need',
         'https://arxiv.org/abs/1706.03762',
         'derive numerically stable scaled dot-product attention and explicit mask semantics',
         'Remove the inverse-square-root key-width scale and compare scores and gradient norms'),
    ],
    'platinum': [],
}

# Each row is independently curated: slug | title | year | paper title | URL |
# task mechanism | controlled ablation. Years are first-publication/preprint years.
CATALOG_ROWS = {
'bronze': '''
perceptron|Perceptron|1958|The Perceptron: A Probabilistic Model for Information Storage and Organization in the Brain|https://doi.org/10.1037/h0042519|fit separable blobs with the online mistake-driven linear update|Compare raw and averaged iterates with identical example order
mlp-backprop|MLP and backpropagation|1986|Learning representations by back-propagating errors|https://doi.org/10.1038/323533a0|derive NumPy cross-entropy gradients for XOR and a three-arm spiral extension|Remove the hidden nonlinearity; compare finite-difference gradient errors
sgd-momentum|SGD with momentum|1964|Some methods of speeding up the convergence of iteration methods|https://doi.org/10.1016/0041-5553(64)90137-5|implement velocity updates on an ill-conditioned quadratic and a tiny MLP|Set momentum to zero at the same learning rate and compare objective traces
initialization|Glorot initialization|2010|Understanding the difficulty of training deep feedforward neural networks|https://proceedings.mlr.press/v9/glorot10a.html|track activation and gradient variance through deep sigmoid and tanh networks|Compare Glorot with unscaled normal weights at the same depth and seed
neural-language-model|Neural probabilistic language model|2003|A Neural Probabilistic Language Model|https://www.jmlr.org/papers/v3/bengio03a.html|learn fixed-context embeddings and predict the next TinyShakespeare character; compare bits per character with a smoothed n-gram|Remove learned embeddings or change context length while keeping the corpus split fixed
denoising-autoencoder|Denoising autoencoder|2008|Extracting and Composing Robust Features with Denoising Autoencoders|https://doi.org/10.1145/1390156.1390294|reconstruct clean MNIST from corrupted inputs under a bottleneck parameter budget|Train without corruption; compare reconstruction at equal bottleneck width
''',
'silver': '''
alexnet|AlexNet|2012|ImageNet Classification with Deep Convolutional Neural Networks|https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks|adapt convolution ReLU pooling and dropout to CIFAR-10; aspirational accuracy 0.85 within 300 seconds|Remove dropout while preserving the training schedule
regularization|Dropout and weight decay|2014|Dropout: A Simple Way to Prevent Neural Networks from Overfitting|https://jmlr.org/papers/v15/srivastava14a.html|compare dropout and decoupled decay on a fixed 5000-example CIFAR-10 training subset|Run no-regularization dropout-only decay-only and combined controls
batchnorm|Batch normalization|2015|Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift|https://arxiv.org/abs/1502.03167|normalize channel activations in a plain convolutional network and measure time to a fixed validation quality|Remove normalization and retune only the documented learning-rate grid
vgg|VGG 3x3 convolution golf|2014|Very Deep Convolutional Networks for Large-Scale Image Recognition|https://arxiv.org/abs/1409.1556|stack 3x3 convolution blocks and minimize parameters at fixed CIFAR-10 quality|Replace two 3x3 convolutions with one 5x5 layer at matched output width
adam|Adam and AdamW from scratch|2014|Adam: A Method for Stochastic Optimization|https://arxiv.org/abs/1412.6980|implement biased moments bias correction epsilon placement and decoupled AdamW decay; match torch updates|Compare coupled L2 penalty with decoupled decay using the same gradients
word2vec|Word2Vec|2013|Efficient Estimation of Word Representations in Vector Space|https://arxiv.org/abs/1301.3781|learn text8 skip-gram embeddings and evaluate held-out word analogies without training on evaluation pairs|Compare negative sampling rates under an equal token budget
lstm-gru|LSTM and GRU|1997|Long Short-Term Memory|https://doi.org/10.1162/neco.1997.9.8.1735|implement recurrent gates and compare LSTM and GRU TinyShakespeare bits per character|Replace gated recurrence with a tanh Elman cell at matched parameter count
seq2seq-attention|Seq2Seq with attention|2014|Neural Machine Translation by Jointly Learning to Align and Translate|https://arxiv.org/abs/1409.0473|translate deterministic generated date strings with encoder-decoder additive attention; aspirational exact match 0.95|Remove attention while keeping encoder decoder and date splits fixed
vae|Variational autoencoder|2013|Auto-Encoding Variational Bayes|https://arxiv.org/abs/1312.6114|implement diagonal-Gaussian reparameterization and MNIST negative ELBO with explicit reconstruction and KL terms|Set the KL weight to zero and inspect posterior collapse and sample quality
dcgan|DCGAN|2015|Unsupervised Representation Learning with Deep Convolutional Generative Adversarial Networks|https://arxiv.org/abs/1511.06434|train MNIST convolutional generator and discriminator; audit classifier confidence and class diversity|Remove generator batch normalization at fixed training updates
unet|U-Net|2015|U-Net: Convolutional Networks for Biomedical Image Segmentation|https://arxiv.org/abs/1505.04597|segment generated geometric shapes with aligned encoder-decoder skip features and report intersection over union|Remove skip concatenations at matched decoder capacity
dqn|Deep Q-network|2013|Playing Atari with Deep Reinforcement Learning|https://arxiv.org/abs/1312.5602|adapt replay and target-network temporal-difference learning to CartPole and evaluate independent episodes|Remove replay or the delayed target network separately
reinforce|REINFORCE with a baseline|1992|Simple statistical gradient-following algorithms for connectionist reinforcement learning|https://doi.org/10.1007/BF00992696|estimate CartPole policy gradients with reward-to-go and a learned value baseline|Remove the baseline and compare gradient variance across seeds
transfer-learning|Transfer learning with ResNet-18|2014|How transferable are features in deep neural networks?|https://arxiv.org/abs/1411.1792|fit a small licensed image subset with frozen and fine-tuned pretrained ResNet-18; document weight provenance|Compare scratch frozen-backbone and full-finetuning runs with the same split
''',
'gold': '''
preln-postln|Pre-LN versus Post-LN stability|2020|On Layer Normalization in the Transformer Architecture|https://arxiv.org/abs/2002.04745|compare normalization placement and warmup using matched-depth language models and gradient traces|Move LayerNorm after the residual while preserving all other settings
gpt2|GPT-2-style TinyStories model|2019|Language Models are Unsupervised Multitask Learners|https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf|train a causal decoder on a documented TinyStories subset within a provisional ten-minute run|Remove learned position embeddings with the token budget unchanged
bert|BERT masked-language pretraining|2018|BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding|https://arxiv.org/abs/1810.04805|implement masked-token pretraining and then fine-tune an SST-2 classifier without split leakage|Compare pretrained and randomly initialized encoders at equal finetuning budget
vit|Vision Transformer|2020|An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale|https://arxiv.org/abs/2010.11929|patchify CIFAR-10 and train a transformer classifier; aspirational accuracy 0.85 within 600 seconds|Compare class-token and mean-pooled heads with identical patch encodings
simclr|SimCLR|2020|A Simple Framework for Contrastive Learning of Visual Representations|https://arxiv.org/abs/2002.05709|implement normalized temperature-scaled contrastive loss and a frozen CIFAR linear probe|Remove color augmentation while preserving batch size and probe schedule
clip|CLIP paired-retrieval capstone|2021|Learning Transferable Visual Models From Natural Language Supervision|https://arxiv.org/abs/2103.00020|align licensed image-caption pairs using symmetric contrastive loss and report retrieval recall; explicit Gold capstone exception|Compare one-directional and symmetric contrastive losses
ddpm|Denoising diffusion probabilistic model|2020|Denoising Diffusion Probabilistic Models|https://arxiv.org/abs/2006.11239|implement forward noise schedules and epsilon prediction on MNIST with a CIFAR extension|Compare linear and cosine schedules at equal denoiser evaluations
gcn-gat|GCN and graph attention|2017|Semi-Supervised Classification with Graph Convolutional Networks|https://arxiv.org/abs/1609.02907|implement normalized graph convolution and attention on Cora; aspirational node accuracy 0.81 on a declared split|Replace attention with degree normalization at matched hidden width
mixture-of-experts|Switch mixture of experts|2021|Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity|https://arxiv.org/abs/2101.03961|implement top-1 routing capacity handling and load-balancing loss; compare iso-FLOP dense baselines|Remove balancing loss and measure expert-load collapse
scaling-laws|Neural scaling laws|2020|Scaling Laws for Neural Language Models|https://arxiv.org/abs/2001.08361|fit held-out loss versus parameters data and compute; aim for loss prediction within five percent on unseen runs|Fit without the irreducible-loss term and compare extrapolation error
efficient-convs|MobileNet and EfficientNet|2017|MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications|https://arxiv.org/abs/1704.04861|compare depthwise separable convolutions and compound scaling on CIFAR-100 with explicit FLOP accounting|Replace depthwise separable blocks by dense convolutions at matched output shapes
ppo|Proximal policy optimization|2017|Proximal Policy Optimization Algorithms|https://arxiv.org/abs/1707.06347|implement clipped CartPole policy updates with advantage estimation and independent evaluation episodes|Remove the probability-ratio clip and inspect KL drift
keyword-spotting|Log-mel keyword spotting|2018|Speech Commands: A Dataset for Limited-Vocabulary Speech Recognition|https://arxiv.org/abs/1804.03209|classify Speech Commands with a log-mel CNN using speaker-disjoint published splits|Replace log-mel features with linear-magnitude spectra at equal frame resolution
''',
'platinum': '''
lora|Low-rank adaptation|2021|LoRA: Low-Rank Adaptation of Large Language Models|https://arxiv.org/abs/2106.09685|fine-tune low-rank residual adapters with at most one percent trainable parameters and frozen base weights|Compare ranks at fixed trainable-parameter budget
flashattention|Tiled exact attention|2022|FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness|https://arxiv.org/abs/2205.14135|implement tiled online-softmax attention in PyTorch with optional Triton; verify outputs and gradients before timing|Compare materialized attention with tiled attention at increasing sequence lengths
modern-transformer|Modern transformer components|2023|Llama 2: Open Foundation and Fine-Tuned Chat Models|https://arxiv.org/abs/2307.09288|combine RoPE RMSNorm SwiGLU and grouped-query attention with shape and parameter audits|Replace one component at a time using matched token and parameter budgets
kv-cache|KV cache and speculative decoding|2023|Fast Inference from Transformers via Speculative Decoding|https://arxiv.org/abs/2211.17192|implement cached autoregressive decoding and rejection-corrected speculative sampling; audit exactness and tokens per second|Compare uncached cached and speculative paths on identical prompts
chinchilla|Compute-optimal language modeling|2022|Training Compute-Optimal Large Language Models|https://arxiv.org/abs/2203.15556|allocate tokens and parameters across fixed-compute runs and fit a compute-optimal frontier|Compare equal-parameter with equal-compute allocations
dpo|Direct preference optimization|2023|Direct Preference Optimization: Your Language Model is Secretly a Reward Model|https://arxiv.org/abs/2305.18290|implement reference-relative chosen-rejected log-probability margins on licensed preferences|Remove reference-model correction and inspect held-out preference accuracy
grpo|Group-relative policy optimization|2024|DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models|https://arxiv.org/abs/2402.03300|train on generated verifiable arithmetic using group-normalized rewards without a value network|Compare group-relative and unnormalized rewards with the same sampled completions
mamba|State-space sequence models|2023|Mamba: Linear-Time Sequence Modeling with Selective State Spaces|https://arxiv.org/abs/2312.00752|compare S4-style recurrence and input-dependent selective state spaces on variable-length copying|Remove input-dependent selection while matching state dimension
flow-matching|Flow matching and rectified flow DiT|2022|Flow Matching for Generative Modeling|https://arxiv.org/abs/2210.02747|fit conditional velocity fields with a small diffusion-transformer backbone and integrate samples|Compare straight-line and variance-preserving probability paths at equal function evaluations
classifier-free-guidance|Classifier-free guidance|2022|Classifier-Free Diffusion Guidance|https://arxiv.org/abs/2207.12598|train condition-dropout denoisers and combine conditional and unconditional predictions at sampling|Sweep guidance strength including zero and one using identical noise seeds
discrete-diffusion-lm|Absorbing discrete diffusion language model|2021|Structured Denoising Diffusion Models in Discrete State-Spaces|https://arxiv.org/abs/2107.03006|implement absorbing-mask corruption and reverse token prediction on text8 or TinyShakespeare|Compare uniform and absorbing transition kernels at equal denoiser calls
muon|Muon versus AdamW|2024|Muon: An optimizer for hidden layers in neural networks|https://kellerjordan.github.io/posts/muon/|orthogonalize matrix momentum with Newton-Schulz iterations and compare with AdamW under a fixed token budget|Disable orthogonalization while retaining momentum and step schedule
mup|Maximal-update parameterization|2022|Tensor Programs V: Tuning Large Neural Networks via Zero-Shot Hyperparameter Transfer|https://arxiv.org/abs/2203.03466|transfer learning rates from narrow to wide models with width-dependent maximal-update scaling|Compare standard parameterization and maximal-update scaling across widths
quantization|INT8 and four-bit quantization|2022|LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale|https://arxiv.org/abs/2208.07339|implement calibrated integer quantization and a documented four-bit extension; audit scale zero-point error and memory|Compare per-tensor per-channel and grouped scales on fixed calibration examples
knowledge-distillation|Knowledge-distillation golf|2015|Distilling the Knowledge in a Neural Network|https://arxiv.org/abs/1503.02531|compress a frozen teacher using temperature-scaled KL and a small student parameter cap|Compare hard labels alone with soft-target distillation at equal student compute
sparse-autoencoders|Sparse autoencoders|2023|Towards Monosemanticity: Decomposing Language Models With Dictionary Learning|https://transformer-circuits.pub/2023/monosemantic-features/index.html|fit a sparse dictionary to frozen activations and report reconstruction versus L0 with dead-feature counts|Sweep sparsity penalty at fixed dictionary width and activation sample count
long-context-rope|Long-context RoPE and YaRN|2023|YaRN: Efficient Context Window Extension of Large Language Models|https://arxiv.org/abs/2309.00071|compare unscaled NTK-aware and YaRN rotary frequencies on long-context retrieval and short-context retention|Evaluate position interpolation without the YaRN correction on the same lengths
capstone-speedrun|Compute-budget speedrun capstone|2019|MLPerf Training Benchmark|https://arxiv.org/abs/1910.01500|combine an explicitly chosen model optimization and evaluation task into a reproducible fixed-compute speedrun; benchmark citation is methodological background not a canonical speedrun model paper|Disable each optimization separately and report quality throughput and memory deltas
'''
}
for _division, _rows in CATALOG_ROWS.items():
    _original = CATALOG[_division]
    _parsed = []
    for _line in _rows.strip().splitlines():
        _slug, _title, _year, _paper, _url, _focus, _ablation = _line.split('|')
        _parsed.append((_slug, _title, int(_year), _paper, _url, _focus, _ablation))
    if _division == 'bronze':
        _parsed.insert(4, _original[0])
    elif _division == 'silver':
        _parsed.insert(4, _original[0])
    elif _division == 'gold':
        _parsed.insert(0, _original[0])
    CATALOG[_division] = _parsed
assert {division: len(entries) for division, entries in CATALOG.items()} == {'bronze': 7, 'silver': 15, 'gold': 14, 'platinum': 18}


def clean(source):
    return textwrap.dedent(source).lstrip()


TRAINING = '''
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
'''


def classifier_solution(architecture):
    return clean('''
        """Small, bounded reference. All implementation lives inside solve."""
        def solve(data):
            import torch
            from torch import nn
            from dlguide import Submission
            # Problem/budget/calibrator owns the RNG seed; do not reset it here.
    ''') + textwrap.indent(clean(architecture), '    ') + '\n' + TRAINING


SOLUTIONS = {
    "lenet5": classifier_solution('''
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
    '''),
    "resnet": classifier_solution('''
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
    '''),
    "transformer": clean('''
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
    '''),
}


# Bronze primitives use deliberately small supervised teaching adaptations.
SOLUTIONS.update({
    'perceptron': clean('''
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
    '''),
    'adaline': clean('''
        """Widrow-Hoff squared-error update on one-hot targets."""
        def solve(data):
            import torch
            from torch import nn
            from dlguide import Submission
            torch.manual_seed(17)
            x, y = data['train'].tensors
            features, classes = x[0].numel(), int(y.max()) + 1
            model = nn.Sequential(nn.Flatten(), nn.Linear(features, classes))
            optimizer = torch.optim.SGD(model.parameters(), lr=0.02)
            x = x.float()
            targets = torch.nn.functional.one_hot(y.long(), classes).float()
            for step in range(24):
                loss = (model(x[:128]) - targets[:128]).square().mean()
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
            model.eval()
            return Submission(model=model, extras={'training_steps': 24, 'calibrated': False})
    '''),
    'mlp': classifier_solution('''
        x, y = data['train'].tensors
        model = nn.Sequential(nn.Flatten(), nn.Linear(x[0].numel(), 32),
                              nn.Tanh(), nn.Linear(32, int(y.max()) + 1))
    '''),
    'backprop': classifier_solution('''
        x, y = data['train'].tensors
        model = nn.Sequential(nn.Flatten(), nn.Linear(x[0].numel(), 32),
                              nn.Tanh(), nn.Linear(32, int(y.max()) + 1))
    '''),
    'logistic-regression': classifier_solution('''
        x, y = data['train'].tensors
        model = nn.Sequential(nn.Flatten(), nn.Linear(x[0].numel(), int(y.max()) + 1))
    '''),
    'elman-rnn': classifier_solution('''
        x, y = data['train'].tensors
        class Elman(nn.Module):
            def __init__(self):
                super().__init__()
                self.input = nn.Linear(1, 16)
                self.recurrent = nn.Linear(16, 16, bias=False)
                self.head = nn.Linear(16, int(y.max()) + 1)
            def forward(self, inputs):
                # Use a bounded 16-step sequence of patch means, not 784 steps.
                sequence = torch.nn.functional.adaptive_avg_pool1d(inputs.flatten(1).unsqueeze(1), 16).transpose(1, 2)
                hidden = inputs.new_zeros(inputs.shape[0], 16)
                for item in sequence.unbind(1):
                    hidden = torch.tanh(self.input(item) + self.recurrent(hidden))
                return self.head(hidden)
        model = Elman()
    '''),
    'hopfield': classifier_solution('''
        x, y = data['train'].tensors
        class HopfieldFeatures(nn.Module):
            def __init__(self):
                super().__init__()
                patterns = torch.where(x[:32].flatten(1) > 0, 1.0, -1.0)
                # Hebbian symmetric energy with zero self-coupling.
                weights = patterns.T @ patterns / patterns.shape[1]
                weights.fill_diagonal_(0)
                self.register_buffer('weights', weights)
                self.head = nn.Linear(x[0].numel(), int(y.max()) + 1)
            def forward(self, inputs):
                state = torch.where(inputs.flatten(1) > 0, 1.0, -1.0)
                # Synchronous bounded recall features; no convergence claim.
                for _ in range(3):
                    state = torch.where(state @ self.weights >= 0, 1.0, -1.0)
                return self.head(state)
        model = HopfieldFeatures()
    '''),
    'alexnet': classifier_solution('''
        x, y = data['train'].tensors
        model = nn.Sequential(nn.Conv2d(x.shape[1], 16, 5, padding=2), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(16, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(32, 32, 3, padding=1), nn.ReLU(), nn.AdaptiveAvgPool2d(2),
            nn.Flatten(), nn.Dropout(0.2), nn.Linear(128, int(y.max()) + 1))
    '''),
})


SOLUTIONS['mlp-backprop'] = clean('''
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
''')

SOLUTIONS['sgd-momentum'] = clean('''
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
''')

SOLUTIONS['initialization'] = clean('''
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
''')

SOLUTIONS['neural-language-model'] = clean('''
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
''')

SOLUTIONS['denoising-autoencoder'] = clean('''
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
''')


def starter_for(title, focus):
    if title in ('Neural probabilistic language model', 'Denoising autoencoder', 'MLP and backpropagation',
                 'SGD with momentum', 'Glorot initialization', 'Perceptron'):
        steps = {
            'Perceptron': 'Initialize zero weights and bias. For every mistaken class prediction, add lr*x to the true-class row and subtract it from the predicted row. Use no validation labels.',
            'MLP and backpropagation': 'Use NumPy to compute tanh hidden activations, stable log-softmax cross-entropy, and gradients for W1,b1,W2,b2. Central-difference-check each tensor. Copy learned arrays into a torch MLP for Submission.',
            'SGD with momentum': 'Implement v=beta*v+grad then w=w-lr*v without torch.optim.SGD. Compare beta=0 and beta>0 on the same diag(1,20) quadratic and on the MLP.',
            'Glorot initialization': 'Use variance 2/(fan_in+fan_out), zero biases, and eight-layer activation/gradient probes for sigmoid and tanh. Record a unit-normal control before fitting a deep classifier.',
            'Neural probabilistic language model': 'Read integer [N,context] inputs; shifted labels use y[:,-1]. Use public vocab_size if supplied. Embed, flatten fixed context, tanh hidden, vocabulary logits. Fit cross-entropy; report loss/log(2) and a training-only smoothed bigram baseline.',
            'Denoising autoencoder': 'Ignore digit labels. Mask training pixels with probability 0.3; predict clean images using a 16-unit bottleneck and sigmoid decoder. Return image-shaped reconstructions; evaluate MSE to clean images under fixed corruption.'
        }[title]
        return clean(f'''
            """{title}: {focus}."""
            def solve(data):
                import torch
                import numpy as np
                from torch import nn
                from dlguide import Submission
                # {steps}
                # Keep imports/classes/helpers inside solve. The notebook owns P.budget().
                # Fit only data['train']; return Submission(model=model, extras=diagnostics).
                raise NotImplementedError('Implement the mechanism and controlled ablation')
        ''')
    if title == 'Transformer':
        return clean('''
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
        ''')
    return clean(f'''
        """{title}: {focus}.

        Implement only solve(data). Imports must remain inside solve so the
        notebook's editable solution cell is self-contained. Never inspect val
        labels while fitting. P supplies data and enforces its declared budget.
        """
        def solve(data):
            import torch
            from torch import nn
            from dlguide import Submission
            # data["train"] and data["val"] are torch TensorDataset objects.
            # Fit a small model using training tensors only, then return it.
            raise NotImplementedError("Implement {title}; return Submission(model=model)")
    ''')


CLASSIFIER_TESTS = clean('''
    """Contract tests, not evidence of calibrated dataset accuracy.

    Public function check(submission, data) is callable by tooling. The test_*
    checks import only the local reference during explicit pytest execution.
    """
    def check(submission, data=None):
        import torch
        model = submission.model
        model.eval()
        if data is None:
            # Runtime self-checks have no access to labels. This checks only the
            # public shape contract; evaluation uses the real held-out split.
            conv = next((m for m in model.modules() if isinstance(m, torch.nn.Conv2d)), None)
            linear = next((m for m in model.modules() if isinstance(m, torch.nn.Linear)), None)
            if conv is not None:
                x = torch.zeros(8, conv.in_channels, 28, 28)
            elif linear is not None:
                x = torch.zeros(8, linear.in_features)
            else:
                raise AssertionError('Expected a classification model with a linear or convolutional layer')
            y = torch.zeros(8, dtype=torch.long)
        else:
            x, y = data["val"].tensors
        with torch.no_grad():
            device = next(model.parameters()).device
            result = model(x[:8].float().to(device))
        assert result.ndim == 2 and result.shape[0] == min(8, len(x))
        assert result.shape[1] >= int(y.max()) + 1
        assert torch.isfinite(result).all(), "Nonfinite logits"
        assert sum(p.numel() for p in model.parameters()) <= 2000000
        return True

    def test_reference_contract():
        import importlib.util
        from pathlib import Path
        import torch
        from torch.utils.data import TensorDataset
        spec = importlib.util.spec_from_file_location("local_reference", Path(__file__).with_name("solution.py"))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        generator = torch.Generator().manual_seed(61)
        x = torch.randn(32, 1, 28, 28, generator=generator)
        y = (x.mean(dim=(1, 2, 3)) > 0).long()
        data = {"train": TensorDataset(x, y), "val": TensorDataset(x[:8], y[:8])}
        assert check(module.solve(data), data)

    def test_training_ignores_validation_labels():
        import importlib.util
        from pathlib import Path
        import torch
        from torch.utils.data import TensorDataset
        spec = importlib.util.spec_from_file_location("local_reference", Path(__file__).with_name("solution.py"))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        x = torch.randn(16, 1, 28, 28, generator=torch.Generator().manual_seed(62))
        y = torch.arange(16) % 2
        train = TensorDataset(x, y)
        torch.manual_seed(71)
        first = module.solve({"train": train, "val": TensorDataset(x, y)}).model
        torch.manual_seed(71)
        second = module.solve({"train": train, "val": TensorDataset(x, 1-y)}).model
        for left, right in zip(first.state_dict().values(), second.state_dict().values()):
            torch.testing.assert_close(left, right, rtol=0, atol=0)
''')

ATTENTION_TESTS = clean('''
    """Value, mask, gradient, and non-square attention equivalence checks."""
    def check(submission, data=None):
        import torch
        from torch.nn.functional import scaled_dot_product_attention
        model = submission.model
        generator = torch.Generator().manual_seed(23)
        for batch, heads, queries, keys, width, value_width in [(2, 3, 5, 7, 8, 4), (1, 1, 1, 3, 4, 6)]:
            q = torch.randn(batch, heads, queries, width, generator=generator, dtype=torch.float64)
            k = torch.randn(batch, heads, keys, width, generator=generator, dtype=torch.float64)
            v = torch.randn(batch, heads, keys, value_width, generator=generator, dtype=torch.float64)
            causal = torch.arange(keys)[None, :] <= torch.arange(queries)[:, None]
            additive = torch.zeros(queries, keys, dtype=torch.float64).masked_fill(~causal, float('-inf'))
            empty = torch.zeros(queries, keys, dtype=torch.bool)
            for mask in (None, causal, additive, empty):
                actual = model(q, k, v, mask=mask)
                expected = scaled_dot_product_attention(q, k, v, attn_mask=mask, dropout_p=0.0)
                torch.testing.assert_close(actual, expected, atol=1e-7, rtol=1e-6)
        q = torch.randn(1, 2, 3, 4, generator=generator, dtype=torch.float64, requires_grad=True)
        k = torch.randn(1, 2, 5, 4, generator=generator, dtype=torch.float64, requires_grad=True)
        v = torch.randn(1, 2, 5, 6, generator=generator, dtype=torch.float64, requires_grad=True)
        actual = torch.autograd.grad(model(q, k, v).square().sum(), (q, k, v))
        expected = torch.autograd.grad(scaled_dot_product_attention(q, k, v).square().sum(), (q, k, v))
        for left, right in zip(actual, expected):
            torch.testing.assert_close(left, right, atol=1e-7, rtol=1e-6)
        return True

    def test_reference_attention():
        import importlib.util
        from pathlib import Path
        spec = importlib.util.spec_from_file_location('local_reference', Path(__file__).with_name('solution.py'))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        assert check(module.solve({}))
''')


CALLER_SEED_TESTS = clean('''
    def test_reference_inherits_seed_and_selects_device():
        import importlib.util
        from pathlib import Path
        import torch
        from torch.utils.data import TensorDataset
        spec = importlib.util.spec_from_file_location('seed_reference', Path(__file__).with_name('solution.py'))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        x = torch.randn(16, 1, 28, 28, generator=torch.Generator().manual_seed(18))
        data = {'train': TensorDataset(x, torch.arange(16)%2)}
        torch.manual_seed(101)
        a = module.solve(data).model
        torch.manual_seed(202)
        b = module.solve(data).model
        assert any(not torch.equal(left, right) for left, right in zip(a.parameters(), b.parameters()))
        assert next(a.parameters()).device.type == ('cuda' if torch.cuda.is_available() else 'cpu')
''')

LANGUAGE_TESTS = clean('''
    """Character next-token contract; synthetic token fixtures are not a corpus score."""
    def check(submission, data=None):
        import torch
        model = submission.model
        model.eval()
        tokens = torch.zeros(4, model.context_length, dtype=torch.long) if data is None else data['val'].tensors[0][:4]
        with torch.no_grad():
            logits = model(tokens)
        assert logits.shape == (len(tokens), model.vocab_size)
        assert torch.isfinite(logits).all()
        return True

    def reference():
        import importlib.util
        from pathlib import Path
        spec = importlib.util.spec_from_file_location('language_reference', Path(__file__).with_name('solution.py'))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module.solve

    def test_language_and_ngram_contract():
        import torch
        from torch.utils.data import TensorDataset
        tokens = torch.arange(128).reshape(32, 4) % 7
        targets = (tokens[:, -1] + 1) % 7
        ds = TensorDataset(tokens, targets)
        data = {'train': ds, 'val': ds, 'vocab_size': 7}
        submission = reference()(data)
        assert check(submission, data)
        baseline = submission.extras['ngram_probabilities']
        torch.testing.assert_close(baseline.sum(1), torch.ones(7))
        assert baseline.min() > 0
        assert submission.extras['validation_bpc'] >= 0
        assert submission.extras['ngram_validation_bpc'] >= 0
        with torch.no_grad():
            bpc = torch.nn.functional.cross_entropy(submission.model(tokens), targets) / torch.log(torch.tensor(2.))
        assert torch.isfinite(bpc)

    def test_shifted_labels_and_validation_independence():
        import torch
        from torch.utils.data import TensorDataset
        x = torch.arange(128).reshape(32, 4) % 7
        y = (x + 1) % 7
        train = TensorDataset(x, y)
        solve = reference()
        a = solve({'train': train, 'val': TensorDataset(x, y), 'vocab_size': 7})
        b = solve({'train': train, 'val': TensorDataset(x, (y+2)%7), 'vocab_size': 7})
        for left, right in zip(a.model.parameters(), b.model.parameters()):
            torch.testing.assert_close(left, right, atol=0, rtol=0)
''')

AUTOENCODER_TESTS = clean('''
    """Reconstruction checks use image targets, never MNIST class labels."""
    def check(submission, data=None):
        import torch
        model = submission.model.eval()
        inputs = torch.zeros(4, *model.input_shape) if data is None else data['val'].tensors[0][:4].float()
        with torch.no_grad():
            recon = model(inputs)
        assert recon.shape == inputs.shape
        assert torch.isfinite(recon).all()
        assert recon.min() >= 0 and recon.max() <= 1
        assert sum(p.numel() for p in model.parameters()) <= 30000
        return True

    def reference():
        import importlib.util
        from pathlib import Path
        spec = importlib.util.spec_from_file_location('denoising_reference', Path(__file__).with_name('solution.py'))
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module.solve

    def test_reconstruction_and_bottleneck():
        import torch
        from torch.utils.data import TensorDataset
        x = torch.rand(32, 1, 28, 28, generator=torch.Generator().manual_seed(31))
        labels = torch.arange(32) % 10
        data = {'train': TensorDataset(x, labels), 'val': TensorDataset(x[:8], labels[:8])}
        result = reference()(data)
        assert check(result, data)
        assert result.model.encoder.out_features == 16
        assert result.extras['loss_trace'][-1] < result.extras['loss_trace'][0]

    def test_class_labels_do_not_affect_reconstruction_training():
        import torch
        from torch.utils.data import TensorDataset
        x = torch.zeros(16, 1, 28, 28)
        solve = reference()
        a = solve({'train': TensorDataset(x, torch.zeros(16, dtype=torch.long))})
        b = solve({'train': TensorDataset(x, torch.ones(16, dtype=torch.long))})
        for left, right in zip(a.model.parameters(), b.model.parameters()):
            torch.testing.assert_close(left, right, rtol=0, atol=0)
''')

MECHANISM_TESTS = {
    'mlp-backprop': clean('''
        def test_numpy_gradient_and_nonlinear_learning():
            import importlib.util
            from pathlib import Path
            import torch
            from torch.utils.data import TensorDataset
            spec = importlib.util.spec_from_file_location('numpy_reference', Path(__file__).with_name('solution.py'))
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            x = torch.tensor([[-1.,-1.],[-1.,1.],[1.,-1.],[1.,1.]]).repeat(16,1)
            y = torch.tensor([0,1,1,0]).repeat(16)
            result = module.solve({'train': TensorDataset(x,y)})
            assert result.extras['gradient_max_error'] < 1e-7
            assert (result.model(x).argmax(-1) == y).float().mean() >= 0.99
    '''),
    'sgd-momentum': clean('''
        def test_quadratic_control_and_momentum_progress():
            import importlib.util
            from pathlib import Path
            import torch
            from torch.utils.data import TensorDataset
            spec = importlib.util.spec_from_file_location('momentum_reference', Path(__file__).with_name('solution.py'))
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            x, y = torch.randn(32, 2), torch.arange(32)%2
            result = module.solve({'train': TensorDataset(x,y)})
            plain, momentum = result.extras['quadratic_sgd'], result.extras['quadratic_momentum']
            assert plain[0] == momentum[0] == 42.0
            assert momentum[-1] < plain[-1]
            assert momentum[-1] < momentum[0]
    '''),
    'initialization': clean('''
        def test_initialization_diagnostics_are_finite_and_layerwise():
            import importlib.util
            from pathlib import Path
            import torch
            from torch.utils.data import TensorDataset
            spec = importlib.util.spec_from_file_location('initialization_reference', Path(__file__).with_name('solution.py'))
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            result = module.solve({'train': TensorDataset(torch.zeros(16,2),torch.arange(16)%2)})
            diagnostics = result.extras['diagnostics']
            assert len(diagnostics) == 4
            for values in diagnostics.values():
                assert len(values['activation_variance']) == len(values['gradient_norm']) == 8
                assert torch.isfinite(torch.tensor(values['activation_variance'] + values['gradient_norm'])).all()
            assert diagnostics['tanh-glorot'] != diagnostics['tanh-unit-normal']
    '''),
    'lenet5': clean('''
        def test_lenet_feature_contract():
            import importlib.util
            from pathlib import Path
            import torch
            from torch import nn
            from torch.utils.data import TensorDataset
            spec = importlib.util.spec_from_file_location('lenet_reference', Path(__file__).with_name('solution.py'))
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            x, y = torch.zeros(16, 1, 28, 28), torch.arange(16) % 2
            model = module.solve({'train': TensorDataset(x, y)}).model
            convs = [layer for layer in model.modules() if isinstance(layer, nn.Conv2d)]
            assert [(layer.in_channels, layer.out_channels, layer.kernel_size) for layer in convs] == [(1, 6, (5, 5)), (6, 16, (5, 5))]
            assert sum(isinstance(layer, nn.AvgPool2d) for layer in model.modules()) == 2
            assert sum(isinstance(layer, nn.Tanh) for layer in model.modules()) == 4
            assert model.features(x[:2].to(next(model.parameters()).device)).shape == (2, 16, 4, 4)
    '''),
    'resnet': clean('''
        def test_zero_residual_branch_is_identity_relu():
            import importlib.util
            from pathlib import Path
            import torch
            from torch.utils.data import TensorDataset
            spec = importlib.util.spec_from_file_location('resnet_reference', Path(__file__).with_name('solution.py'))
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            x, y = torch.zeros(16, 1, 28, 28), torch.arange(16) % 2
            model = module.solve({'train': TensorDataset(x, y)}).model
            blocks = [layer for layer in model.modules() if layer.__class__.__name__ == 'ResidualBlock']
            assert len(blocks) == 2
            block = blocks[0].eval()
            with torch.no_grad():
                block.conv1.weight.zero_()
                block.conv2.weight.zero_()
                block.bn2.running_mean.zero_()
                block.bn2.bias.zero_()
            inputs = torch.randn(2, 16, 7, 9, device=next(block.parameters()).device)
            torch.testing.assert_close(block(inputs), inputs.relu())
    '''),
    'perceptron': clean('''
        def test_perceptron_learns_separable_points():
            import importlib.util
            from pathlib import Path
            import torch
            from torch.utils.data import TensorDataset
            spec = importlib.util.spec_from_file_location('perceptron_reference', Path(__file__).with_name('solution.py'))
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            x = torch.tensor([[-2., -1.], [-1., -2.], [1., 2.], [2., 1.]])
            y = torch.tensor([0, 0, 1, 1])
            model = module.solve({'train': TensorDataset(x, y)}).model
            assert torch.equal(model(x).argmax(-1), y)
    '''),
}


# dataset | metric | direction | requested target (never a calibrated threshold)
# | provisional seconds | model contract | objective/check focus.
TASK_ROWS = '''
perceptron|blobs|accuracy|maximize||60|[N,D] -> [N,C] logits|Online mistake updates; no autograd required
mlp-backprop|xor|accuracy|maximize||60|[N,2] -> [N,C] logits|NumPy analytic gradients agree with central differences; three-arm spirals are an optional generated extension
sgd-momentum|synthetic-classification|accuracy|maximize||60|[N,D] -> [N,C] logits|Explicit v=beta*v+grad and w-=lr*v; record quadratic objective for beta zero and nonzero
initialization|synthetic-classification|accuracy|maximize||60|[N,D] -> [N,C] logits|Record layerwise activation variance and gradient norms for sigmoid/tanh and Glorot/unit-normal controls
lenet5|mnist|accuracy|maximize||60|[N,1,28,28] -> [N,10] logits|5x5 convolution average pooling tanh and bounded MNIST training
neural-language-model|tinyshakespeare|bpc|minimize||60|[N,context] token IDs -> [N,vocab] next-character logits|Character-level natural-log cross-entropy divided by log(2); compare a training-only smoothed n-gram
denoising-autoencoder|mnist|mse|minimize||60|[N,1,28,28] -> [N,1,28,28] reconstruction|Train on corrupted clean pairs; metric against clean pixels; fixed 16-unit bottleneck
alexnet|cifar10|accuracy|maximize|0.85|300|[N,3,32,32] -> [N,10] logits|CIFAR adaptation not ImageNet reproduction
regularization|cifar10|accuracy|maximize||300|[N,3,32,32] -> [N,10] logits|Exactly 5000 training images; fixed validation set; compare dropout and decay
batchnorm|cifar10|time_to_quality|minimize||300|[N,3,32,32] -> [N,10] logits|Train/eval statistics separation; quality target requires calibration
vgg|cifar10|accuracy|maximize||300|[N,3,32,32] -> [N,10] logits|Parameter golf at a declared quality target using 3x3 stacks
resnet|mnist|accuracy|maximize||60|[N,1,28,28] -> [N,10] logits|Tiny two-block teaching network; zero branch recovers identity followed by ReLU
adam|optimizer-fixture|update_max_error|minimize||60|Optimizer adapter over parameter tensors; wrap state in a torch module|Match torch Adam and AdamW step by step including bias correction epsilon and weight decay
word2vec|text8|analogy_accuracy|maximize||300|Token IDs -> embedding vectors|Analogy set must not overlap model selection; negative-sampling unigram distribution is training-only
lstm-gru|tinyshakespeare|bpc|minimize||300|[N,T] tokens -> [N,T,V] logits|Reset/detach recurrent state at declared boundaries; GRU paper is a separate citation
seq2seq-attention|generated-dates|exact_match|maximize|0.95|300|Date-token sequences -> decoded date-token sequences|Split unique underlying dates before formatting; exact full-string match
vae|mnist|negative_elbo|minimize||300|Image -> reconstruction logits posterior mean and log variance|State Bernoulli reconstruction likelihood and summed KL convention
dcgan|mnist|generation_quality|maximize||300|Noise -> images; discriminator returns real/fake logits|Report frozen-classifier confidence and per-class diversity separately; no single proxy PASS
unet|generated-shapes|iou|maximize||300|[N,C,H,W] -> [N,K,H,W] mask logits|Nearest-neighbor target resize; exact spatial skip alignment
dqn|cartpole|episode_return|maximize||300|Observation -> action Q values|Replay target excludes true terminal bootstrap; distinguish truncation
reinforce|cartpole|episode_return|maximize||300|Observation -> action logits plus baseline|Detach advantage from policy gradient; no evaluation-episode training
transfer-learning|small-image-subset|accuracy|maximize||300|Image -> class logits|Record ResNet-18 checkpoint license hash preprocessing and frozen parameters
transformer|attention-equivalence|attention_max_error|minimize||60|forward(q,k,v,mask=None) -> attention output|Compare SDPA values and gradients including non-square and fully masked cases
preln-postln|tinyshakespeare|bpc|minimize||600|[N,T] tokens -> [N,T,V] logits|Track gradient norms divergence and warmup with identical token order
gpt2|tinystories|bpc|minimize||600|[N,T] token IDs -> [N,T,V] logits|Provisional ten-minute training run; tokenizer and split must be declared
bert|sst2-and-pretrain-corpus|accuracy|maximize||600|Masked tokens -> vocabulary logits; finetuned text -> binary logits|Mask labels only; downstream SST-2 test labels excluded from selection
vit|cifar10|accuracy|maximize|0.85|600|[N,3,32,32] -> [N,10] logits|Patch size and position interpolation specified
simclr|cifar10|linear_probe_accuracy|maximize||600|Image -> normalized representation|Freeze encoder during probe; no label leakage into contrastive training
clip|licensed-image-caption-pairs|retrieval_recall_at_1|maximize||600|Image and text -> normalized paired embeddings|Gold capstone exception; evaluate both retrieval directions on held-out pairs
ddpm|mnist|denoising_mse|minimize||600|Noisy image timestep -> predicted noise|Schedule buffers and reverse variance correct; CIFAR extension requires separate calibration
gcn-gat|cora|node_accuracy|maximize|0.81|600|Node features and graph -> node logits|Declare transductive graph use and fixed public label masks
mixture-of-experts|tinyshakespeare|bpc|minimize||600|[N,T] tokens -> [N,T,V] logits plus routing statistics|Capacity overflow deterministic; report active FLOPs and expert balance
scaling-laws|measured-training-runs|relative_loss_prediction_error|minimize|0.05|600|Run descriptors -> predicted held-out loss|Fit only training runs; hold out larger compute scales
efficient-convs|cifar100|accuracy|maximize||600|[N,3,32,32] -> [N,100] logits|Report multiply-add convention and measured latency separately from FLOPs
ppo|cartpole|episode_return|maximize||600|Observation -> action distribution and state value|Clipped surrogate sign with negative advantage; independent rollout/evaluation seeds
keyword-spotting|speech-commands|accuracy|maximize||600|Waveform or log-mel frames -> command logits|Published speaker-disjoint splits; train-only normalization and silence handling
lora|licensed-adaptation-corpus|task_quality|maximize||600|Base-model input -> task logits; <=1 percent trainable parameters|Freeze base weights; low-rank delta merge agrees with unmerged output
flashattention|attention-equivalence|attention_max_error|minimize||600|forward(q,k,v,mask=None) -> attention output|Online log-sum-exp block correction; test gradients before speed measurements
modern-transformer|tinyshakespeare|bpc|minimize||600|[N,T] tokens -> [N,T,V] logits|RoPE even pairs RMSNorm epsilon SwiGLU width and GQA head sharing
kv-cache|decode-fixture|distribution_max_error|minimize||600|Prompt and cache -> next-token distribution plus new cache|Position offsets correct; speculative rejection correction preserves target distribution
chinchilla|measured-training-runs|heldout_loss|minimize||600|Compute allocation -> fitted loss frontier|Compare allocations at equal measured training FLOPs
dpo|licensed-preference-pairs|preference_accuracy|maximize||600|Prompt completion -> summed completion log probability|Prompt tokens masked; frozen reference never updated
grpo|generated-arithmetic|verified_accuracy|maximize||600|Arithmetic prompt -> sampled answer and policy log probabilities|Exact answer verifier and train/eval operand split; handle zero group reward variance
mamba|generated-copying|sequence_accuracy|maximize||600|[N,T] symbols -> [N,T,V] logits|Compare recurrence and parallel scan numerically; test longer unseen sequences
flow-matching|mnist|velocity_mse|minimize||600|Interpolated image time condition -> velocity field|Time endpoint conventions and ODE solver direction; DiT is a separate architectural reference
classifier-free-guidance|mnist|conditional_generation_quality|maximize||600|Noisy image time optional class -> noise prediction|Conditional dropout and unconditional branch use identical architecture
discrete-diffusion-lm|tinyshakespeare|token_nll|minimize||600|Corrupted tokens time -> clean-token logits|Absorbing transition rows sum to one; distinguish mask and padding
muon|tinyshakespeare|bpc|minimize||600|[N,T] tokens -> [N,T,V] logits with matrix optimizer|Handle rectangular matrices and nonmatrix parameters explicitly; Newton-Schulz finite outputs
mup|synthetic-classification|width_transfer_gap|minimize||600|[N,D] -> class logits across widths|Document width-dependent input hidden and output parameterization
quantization|quantization-fixture|relative_output_error|minimize||600|Quantized linear input -> dequantized output|Saturation rounding zero points and per-group scale storage included in memory
knowledge-distillation|cifar10|accuracy|maximize||600|Image -> student logits|Frozen teacher temperature-squared KL scaling; quality versus student parameter count
sparse-autoencoders|frozen-activation-fixture|reconstruction_mse|minimize||600|Frozen activations -> reconstruction and sparse codes|Report L0 reconstruction error dead features and decoder normalization
long-context-rope|generated-long-retrieval|retrieval_accuracy|maximize||600|Long token sequence -> answer logits|Test both extrapolation and original context retention; log exact rotary frequencies
capstone-speedrun|declared-capstone-task|task_quality|maximize||600|Documented task-specific torch module and reproducible timing harness|One task one split and fixed compute; report ablations speed memory and quality honestly
'''
TASKS = {}
for _row in TASK_ROWS.strip().splitlines():
    _parts = _row.split('|')
    TASKS[_parts[0]] = dict(zip(('dataset', 'metric', 'direction', 'goal', 'seconds', 'output', 'check'), _parts[1:]))

SECONDARY_PAPERS = {
    'denoising-autoencoder': [('Extracting and Composing Robust Features with Denoising Autoencoders (author-hosted PDF)', 2008, 'https://www.cs.toronto.edu/~larocheh/publications/icml-2008-denoising-autoencoders.pdf')],
    'adam': [('Decoupled Weight Decay Regularization', 2017, 'https://arxiv.org/abs/1711.05101')],
    'lstm-gru': [('Learning Phrase Representations using RNN Encoder-Decoder for Statistical Machine Translation', 2014, 'https://arxiv.org/abs/1406.1078')],
    'gcn-gat': [('Graph Attention Networks', 2017, 'https://arxiv.org/abs/1710.10903')],
    'efficient-convs': [('EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks', 2019, 'https://arxiv.org/abs/1905.11946')],
    'mamba': [('Efficiently Modeling Long Sequences with Structured State Spaces', 2021, 'https://arxiv.org/abs/2111.00396')],
    'flow-matching': [('Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow', 2022, 'https://arxiv.org/abs/2209.03003'), ('Scalable Diffusion Models with Transformers', 2022, 'https://arxiv.org/abs/2212.09748')],
    'quantization': [('GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers', 2022, 'https://arxiv.org/abs/2210.17323')],
    'gpt2': [('TinyStories: How Small Can Language Models Be and Still Speak Coherent English?', 2023, 'https://arxiv.org/abs/2305.07759')],
    'modern-transformer': [('RoFormer: Enhanced Transformer with Rotary Position Embedding', 2021, 'https://arxiv.org/abs/2104.09864'), ('Root Mean Square Layer Normalization', 2019, 'https://arxiv.org/abs/1910.07467'), ('GLU Variants Improve Transformer', 2020, 'https://arxiv.org/abs/2002.05202'), ('GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints', 2023, 'https://arxiv.org/abs/2305.13245')]
}


AUTHORS = dict(zip(
    [entry[0] for division in CATALOG.values() for entry in division],
    ['Rosenblatt', 'Rumelhart et al.', 'Polyak', 'Glorot and Bengio', 'LeCun et al.', 'Bengio et al.', 'Vincent et al.',
     'Krizhevsky et al.', 'Srivastava et al.', 'Ioffe and Szegedy', 'Simonyan and Zisserman', 'He et al.', 'Kingma and Ba',
     'Mikolov et al.', 'Hochreiter and Schmidhuber', 'Bahdanau et al.', 'Kingma and Welling', 'Radford et al.',
     'Ronneberger et al.', 'Mnih et al.', 'Williams', 'Yosinski et al.',
     'Vaswani et al.', 'Xiong et al.', 'Radford et al.', 'Devlin et al.', 'Dosovitskiy et al.', 'Chen et al.',
     'Radford et al.', 'Ho et al.', 'Kipf and Welling', 'Fedus et al.', 'Kaplan et al.', 'Howard et al.', 'Schulman et al.', 'Warden',
     'Hu et al.', 'Dao et al.', 'Touvron et al.', 'Leviathan et al.', 'Hoffmann et al.', 'Rafailov et al.', 'Shao et al.',
     'Gu and Dao', 'Lipman et al.', 'Ho and Salimans', 'Austin et al.', 'Jordan', 'Yang et al.', 'Dettmers et al.',
     'Hinton et al.', 'Bricken et al.', 'Peng et al.', 'Mattson et al.']))
RELATED_AUTHORS = {
    '1711.05101': 'Loshchilov and Hutter', '1406.1078': 'Cho et al.', '1710.10903': 'Veličković et al.',
    '1905.11946': 'Tan and Le', '2111.00396': 'Gu et al.', '2209.03003': 'Liu et al.',
    '2212.09748': 'Peebles and Xie', '2210.17323': 'Frantar et al.', '2305.07759': 'Eldan and Li',
    '2104.09864': 'Su et al.', '1910.07467': 'Zhang and Sennrich', '2002.05202': 'Shazeer',
    '2305.13245': 'Ainslie et al.', 'icml-2008-denoising-autoencoders.pdf': 'Vincent et al.'}


def mdx_safe(text):
    # No authored JSX is required: escape all interpolated text, including <=1%.
    return text.replace('<', '&lt;')


def metadata(division, index, entry, previous):
    slug, title, year, paper_title, url, focus, ablation = entry
    problem_id = f'{division}-{slug}'
    implemented = slug in SOLUTIONS and (division == 'bronze' or slug in ('resnet', 'transformer'))
    attention = slug == 'transformer'
    image = slug in ('lenet5', 'resnet')
    dataset = ({'name': 'attention-equivalence', 'seed': 1729,
                'description': 'Deterministic generated Q/K/V; no downloaded corpus or translation benchmark.'}
               if attention else
               {'name': 'mnist' if image else 'synthetic-classification', 'seed': 1729,
                'train_size': 512, 'val_size': 128, 'test_size': 128,
                'features': 4, 'classes': 2,
                'description': 'Genuine torchvision MNIST; disjoint train/validation and official test subsets.' if image else
                    'Generated linear classification teaching fixture; not the original paper benchmark.'})
    task = TASKS[slug]
    dataset = {'name': task['dataset'], 'seed': 1729,
               'train_size': 512, 'val_size': 128, 'test_size': 128,
               'description': task['check'],
               'split_policy': 'Disjoint train/validation/test examples; fit preprocessing using training data only.',
               'loader_status': 'runtime-supported' if implemented else 'requires-task-specific-implementation'}
    if slug in ('perceptron', 'mlp-backprop', 'sgd-momentum', 'initialization'):
        dataset.update(features=2 if slug in ('perceptron', 'mlp-backprop') else 4, classes=2)
    if slug == 'regularization':
        dataset['train_size'] = 5000
    if slug == 'neural-language-model':
        dataset.update(context_length=8, sequence_length=8, target_mode='next-token', tokenizer='character',
                       split_policy='Contiguous corpus train/validation/test spans; construct windows within spans only.',
                       vocab_policy='Public corpus character vocabulary; expose vocab_size without validation-label fitting.')
    if slug == 'denoising-autoencoder':
        dataset.update(target='clean-image', corruption_probability=0.3,
                       evaluation='Apply fixed seeded corruption; compare reconstruction with clean input, not digit labels.')
    metric = ({'name': 'attention_max_error', 'direction': 'minimize', 'threshold': None,
               'atol': 1e-7, 'rtol': 1e-6, 'reference': 'torch.nn.functional.scaled_dot_product_attention'}
              if attention else {'name': task['metric'], 'direction': task['direction'], 'threshold': None})
    metric.update(calibrated=False, pass_target=float(task['goal']) if task['goal'] else None,
                  par_target=None, stretch_target=None,
                  targets={'pass': float(task['goal']) if task['goal'] else None, 'par': None, 'stretch': None},
                  target_status='provisional draft targets only; threshold remains null until calibration')
    if task['goal']:
        metric['requested_goal'] = float(task['goal'])
        metric['goal_status'] = 'aspirational user-specified goal; not a calibrated pass threshold'
    if slug == 'neural-language-model':
        metric.update(units='bits per character', conversion='mean token cross_entropy / log(2)', target_mode='last-next-token')
    if slug == 'denoising-autoencoder':
        metric.update(target='clean-input', corruption_probability=0.3, corruption_seed=1729)

    interface = {'entrypoint': 'solve(data)', 'returns': 'dlguide.Submission',
                 'data': 'dict with train and val torch.utils.data.TensorDataset entries',
                 'model': task['output'],
                 'objective': task['check'],
                 'predict_fn': 'Optional callable(model, inputs); normally omitted.',
                 'self_contained': True}
    statement = (f'Implement {title}: {focus}. Read the linked paper and isolate the named mechanism. '
                 'Write a self-contained solve(data), fit using training tensors only, and return Submission(model=model). '
                 'Keep validation labels out of fitting and preprocessing. '
                 + ('This task isolates scaled dot-product attention, not the complete translation system. Boolean masks use True for allowed keys; additive masks are added before softmax; entirely masked rows must return zero.' if attention else
                    'This is an educational reduced-scale adaptation, not a claim to reproduce original paper results.'))
    statement += (f' Use {task["dataset"]}; required output: {task["output"]}. '
                  f'Evaluate {task["metric"]} ({task["direction"]}). {task["check"]}. '
                  f'Required ablation: {ablation}.')
    if not implemented:
        statement += ' Curriculum draft: reference, task-specific objective/evaluation adaptation and thresholds remain unimplemented; a named dataset may have a loader but this does not make this model executable. The provided solution raises NotImplementedError.'
    return {
        'id': problem_id, 'title': title, 'division': division, 'module': slug,
        'year': year, 'paper': {'title': paper_title, 'url': url, 'year': year,
                               'authors': AUTHORS.get(slug, 'pending verification'),
                               'related': [{'title': p[0], 'year': p[1], 'url': p[2],
                                            'authors': next((author for key, author in RELATED_AUTHORS.items() if key in p[2]), 'pending verification')}
                                           for p in SECONDARY_PAPERS.get(slug, [])],
                               'year_note': 'Original/preprint year except GCN (2017 venue, 2016 preprint) and speculative decoding (2023 venue, 2022 preprint).',
                               'source_type': {'muon': 'technical-blog', 'sparse-autoencoders': 'research-report',
                                               'capstone-speedrun': 'benchmark-methodology-background', 'gpt2': 'technical-report'}.get(slug, 'research-paper')},
        'prerequisites': [previous] if previous else ({'silver': ['bronze-lenet5'], 'gold': ['silver-resnet'],
                                                     'platinum': ['gold-transformer']}.get(division, [])),
        'difficulty': ('Very Easy' if slug == 'perceptron' else 'Insane' if slug == 'capstone-speedrun' else
                       {'bronze': 'Easy', 'silver': 'Normal', 'gold': 'Hard', 'platinum': 'Very Hard'}[division]),
        'tags': [division, 'paper-implementation', 'attention' if attention else 'neural-networks'],
        'kind': ('ablate' if slug in ('sgd-momentum', 'initialization', 'regularization', 'preln-postln', 'muon') else
                 'golf' if slug in ('denoising-autoencoder', 'vgg', 'knowledge-distillation', 'lora') else
                 'debug' if slug in ('adam', 'kv-cache') else
                 'speedrun' if slug in ('flashattention', 'capstone-speedrun', 'batchnorm') else
                 'scale' if slug in ('scaling-laws', 'chinchilla', 'mup', 'long-context-rope') else 'implement'),
        'previous_model': previous, 'statement': statement,
        'dataset': dataset,
        'budget': {'wall_seconds': int(task['seconds']),
                   'parameters': 30000 if slug == 'denoising-autoencoder' else 2000000 if implemented else 10000000,
                   'max_trainable_fraction': 0.01 if slug == 'lora' else None,
                   'memory_mb': 1024, 'require_gpu': False,
                   'training_steps': {'perceptron': 1024, 'mlp-backprop': 160, 'sgd-momentum': 40, 'initialization': 32,
                                      'neural-language-model': 64, 'denoising-autoencoder': 48,
                                      'transformer': 0}.get(slug, 24 if implemented else None),
                   'calibrated': False, 'note': 'Provisional safety caps, not empirically calibrated GPU budgets.'},
        'metric': metric, 'interface': interface,
        'checks': ['Return a Submission containing a torch module.',
                   'Do not read validation labels during fitting.',
                   'No NaN or infinite outputs; obey parameter cap.',
                   'Compare masked/unmasked outputs and gradients with PyTorch SDPA.' if attention else
                   task['check']],
        'ablation': {'change': ablation, 'control': 'Same split, seed, training steps and optimizer.',
                     'report': 'Report metric and parameter/time deltas honestly; do not infer superiority from one seed.'},
        'hints': [focus, 'Write down every intermediate tensor shape before implementing the block.',
                  'Start with the smallest deterministic fixture and compare with a trusted primitive.'],
        'editorial': 'editorial.mdx',
        'estimated_minutes': {'bronze': 60, 'silver': 100, 'gold': 150, 'platinum': 210}[division],
        'status': 'draft', 'implementation': 'reference' if implemented else 'stub',
        'calibration': {'state': 'uncalibrated', 'hardware': None, 'seeds': [], 'runs': [],
                        'note': 'No GPU calibration performed; no passing threshold advertised.'}
    }


def editorial_for(meta, entry):
    _, title, _, _, _, focus, ablation = entry
    implementation = meta['implementation'] == 'reference'
    specifics = {
        'perceptron': 'For a mistaken predicted class p and true class t, add learning_rate*x to W[t] and subtract it from W[p]; update biases with the same signs. Correct examples cause no update. The reference makes eight deterministic passes over at most 128 training examples (at most 1024 updates). A separable training fixture validates the update, not generalization on overlapping blobs.',
        'mlp-backprop': 'For H=tanh(XW1+b1), Z=HW2+b2, subtract the rowwise maximum before log-sum-exp. Cross-entropy gives dZ=(softmax(Z)-one_hot(y))/N, dW2=H.T@dZ and dH=(dZ@W2.T)*(1-H**2). Then dW1=X.T@dH; bias gradients sum over examples. The NumPy reference central-difference-checks one element of each parameter tensor with epsilon 1e-5, trains 160 minibatches, and exports weights into a torch module. XOR needs a nonlinear hidden layer. Three-arm spirals require a separate generated split, not an assertion that the XOR score transfers.',
        'sgd-momentum': 'Velocity follows v=beta*v+gradient and weights follow w-=learning_rate*v. Do not multiply the new gradient by (1-beta) unless you consistently use that alternative convention. The quadratic control has diagonal curvature (1,20), learning rate 0.03 and 60 steps from (2,2), comparing beta 0 and 0.8. The MLP uses beta 0.9 for 40 full minibatch updates. Record oscillations as well as final objective; momentum is not guaranteed to improve every problem.',
        'initialization': 'Glorot weights have variance 2/(fan_in+fan_out); a uniform implementation uses bounds plus/minus sqrt(6/(fan_in+fan_out)). Zero biases. Probe eight equally wide layers under the same random seed and input using tanh and sigmoid, recording every activation variance and retained gradient norm. Sigmoid has a nonzero mean and can still attenuate gradients even with Glorot initialization. The reference trains a six-hidden-layer tanh classifier for 32 SGD steps and includes separate controlled diagnostics, not a convergence claim.',
        'neural-language-model': 'Concatenate learned embeddings of a fixed context, apply a tanh hidden layer, and project to next-character logits. The 2003 paper models words; this tractable character-level TinyShakespeare adaptation intentionally reports bits per character, not the original word perplexity. For shifted sequence labels use only the final next-token target; do not train the final-token predictor against every intermediate label. Cross-entropy is measured in nats, so divide its token mean by log(2). Build smoothed bigram counts only from training context-final-character and next-character pairs. The 64-step reference returns baseline probabilities in extras; evaluate both on identical held-out characters. Vocabulary size is public metadata and may be passed in data; validation labels are read only after fitting to report model and bigram bpc, never to update weights or counts.',
        'denoising-autoencoder': 'Encode flattened MNIST into a 16-unit tanh bottleneck, decode to sigmoid pixel values and reshape to the input image. Corrupt only the input with a seeded 30 percent masking process and train MSE against clean pixels for 48 updates. Ignore MNIST digit class labels. The compact 784-to-16-to-784 network has 25888 parameters; compare clean-target reconstruction under the same evaluation corruption for all ablations. Runtime evaluation must target clean images, not compare output pixels with digit labels.',
        'lenet5': 'Use 5x5 convolutions with 6 then 16 channels, average pooling and tanh; flatten a 4x4 pooled map into 120 and 84 hidden units. The reference uses fully connected C3 channels and a linear-logit classifier rather than the original partial-connectivity and RBF output. These deviations are deliberate and must not be presented as an exact historical reproduction.',
        'resnet': 'A branch applies conv–batchnorm–ReLU–conv–batchnorm, then adds the input before ReLU. The stem and both blocks preserve spatial size and width 16, so the identity shortcut is valid without projection. Global average pooling makes the final classifier independent of spatial dimensions. This is a tiny two-block residual network, not ResNet-18/50.',
        'transformer': 'Compute scores = Q K^T / sqrt(d_k), mask scores, softmax over keys, and multiply by V. Do not softmax over queries or scale by sequence length. Support different query/key lengths and value widths. Boolean True allows a key (unlike some other PyTorch mask APIs); additive masks typically contain zero and negative infinity. A fully blocked row needs zero output instead of NaN. No positional encoding, projections, multi-head wrapper, feed-forward block or translation training is claimed by this isolated attention lab.'
    }.get(entry[0], focus)
    return f'''---
id: {meta['id']}-editorial
title: "{title}: editorial"
status: draft
---

# {title}: derivation and implementation notes

## The mechanism

{focus}. {specifics}

Read [{meta['paper']['title']}]({meta['paper']['url']}) for the original setting. This lesson and code are independently authored, not copied from that paper's implementation or another guide.

## A reproducible approach

1. State the model's input/output shapes and the loss before coding.
2. Set a seed, use only the supplied training split, and keep preprocessing statistics training-only.
3. Validate the local contract before comparing held-out metrics. A contract check is not an accuracy grade.
4. Run the ablation with identical splits and compute budget; save your observations outside the shared site.

## Reference and scope

{'A bounded executable reference is provided. Imports and model classes live inside solve(data) so a learner can copy the function into the editable notebook cell without hidden helpers. The reference returns dlguide.Submission; the notebook owns P.budget() and grading.' if implementation else 'This is an explicit implementation stub. Architecture adaptation, dataset loader and reference training are not implemented. solution.py raises NotImplementedError rather than returning an unrelated baseline. Do not treat the starter or these notes as a finished reproduction.'}

{'Reference training is deliberately bounded. Inspect the mechanism-specific schedule described above and in solution.py; CPU smoke tests establish executability, not convergence or benchmark quality. LeNet and ResNet use 24 Adam minibatches with learning rate 0.01 and clipping at 5.' if implementation and entry[0] != 'transformer' else 'Attention tests compare values and gradients to scaled_dot_product_attention in float64, including non-square sequences and completely masked rows.' if entry[0] == 'transformer' else 'Before promotion, implement an architecture-specific objective and genuine licensed data pipeline, validate shape and numerical checks, and run reproducible calibration.'}

## Task-specific evaluation

Dataset: **{meta['dataset']['name']}**. Model contract: **{meta['interface']['model']}**. Metric: **{meta['metric']['name']}**, direction **{meta['metric']['direction']}**. {TASKS[entry[0]]['check']}.

{('Requested goal: ' + TASKS[entry[0]]['goal'] + '. This is aspirational, not a verified or calibrated passing threshold.') if TASKS[entry[0]]['goal'] else 'No calibrated passing threshold is available.'}

{chr(10).join('- [' + paper['title'] + '](' + paper['url'] + ') (' + str(paper['year']) + '), related component reference.' for paper in meta['paper'].get('related', []))}

## Required ablation

{ablation}. Keep the seed, split, training steps and optimizer fixed. Report both quality and compute cost; one run is not statistical evidence.

## Failure modes

- Fitting on validation labels or allowing split overlap invalidates evaluation.
- Matching output shape alone does not establish that the intended mechanism was implemented.
- A small teaching model is not the original full-scale experiment.

## Calibration status

**Draft / uncalibrated.** No GPU run, calibrated pass threshold, original-paper score or hardware-normalized budget is claimed. CPU smoke tests exercise implementation contracts only. A reference solution can be executable while the problem remains draft.
'''


# Compact mechanism equations are pedagogical summaries, not copied paper prose.
EQUATIONS = dict(line.split('|', 1) for line in '''
perceptron|w_true := w_true + eta*x; w_pred := w_pred - eta*x on mistakes only.
mlp-backprop|H=tanh(XW1+b1); dZ=(softmax(HW2+b2)-Y)/N; dW1=X^T((dZ W2^T)*(1-H^2)).
sgd-momentum|v_t=beta*v_(t-1)+grad L(w_t); w_(t+1)=w_t-eta*v_t.
initialization|Var(W)=2/(fan_in+fan_out); uniform bound=sqrt(6/(fan_in+fan_out)).
lenet5|h_next=tanh(conv(h,W)+b); pooled(i,j)=mean of the local 2x2 region.
neural-language-model|p(c_next|context)=softmax(W_out*tanh(W_h*concat(emb(context))+b_h)+b_out); bpc=CE/log(2).
denoising-autoencoder|x_corrupt=m*x; z=tanh(W_enc*x_corrupt+b); L=mean((sigmoid(W_dec*z+c)-x)^2).
alexnet|h_next=ReLU(conv(h,W)+b); dropout(h)=Bernoulli(keep)*h/keep during training.
regularization|L_total=L_data+lambda*norm(w)^2; decoupled decay instead applies w:=(1-eta*lambda)*w separately.
batchnorm|y=gamma*(x-mean_batch)/sqrt(var_batch+epsilon)+beta; inference uses running statistics.
vgg|Two stride-one 3x3 layers have a 5x5 receptive field, with a nonlinear intermediate representation.
resnet|h_next=ReLU(h+F(h)); d(h+F(h))/dh=I+J_F.
adam|m=beta1*m+(1-beta1)*g; v=beta2*v+(1-beta2)*g^2; w-=eta*m_hat/(sqrt(v_hat)+epsilon).
word2vec|L=-log sigmoid(u_pos dot v_center)-sum log sigmoid(-u_neg dot v_center).
lstm-gru|c_t=f_t*c_prev+i_t*tanh(candidate); h_t=o_t*tanh(c_t). GRU instead mixes old and candidate states through update gates.
seq2seq-attention|alpha_t=softmax(score(s_prev,h_i)); context_t=sum_i alpha_ti*h_i.
vae|negative_ELBO=E_q[-log p(x|z)]+KL(q(z|x)||p(z)); z=mu+sigma*epsilon.
dcgan|min_G max_D E log D(x)+E log(1-D(G(z))); stable training often uses non-saturating -log D(G(z)).
unet|decoder_level=conv(concat(upsample(decoder_next),encoder_skip)); IoU=intersection/union.
dqn|target=r+gamma*(1-terminal)*max_a Q_target(s_next,a); L=(Q(s,a)-target)^2.
reinforce|grad J=E[sum_t grad log pi(a_t|s_t)*(return_t-baseline(s_t))].
transfer-learning|h=f_pretrained(x); logits=W_head*h+b; frozen training updates only head parameters.
transformer|Attention(Q,K,V)=softmax(QK^T/sqrt(d_k)+mask)V.
preln-postln|PreLN: x_next=x+F(LN(x)); PostLN: x_next=LN(x+F(x)).
gpt2|L=-sum_t log p(token_t|tokens_before_t); causal masks prohibit access to future tokens.
bert|L_MLM=-sum_masked log p(original_token|corrupted_bidirectional_context).
vit|z_0=concat(class_token,flattened_patches*W_patch)+position_embeddings.
simclr|L_i=-log exp(sim(z_i,z_pos)/tau)/sum_j exp(sim(z_i,z_j)/tau), excluding self.
clip|L=(CE(image_text_logits,paired_indices)+CE(image_text_logits^T,paired_indices))/2.
ddpm|x_t=sqrt(alpha_bar_t)*x_0+sqrt(1-alpha_bar_t)*epsilon; L=mean((epsilon_model-epsilon)^2).
gcn-gat|GCN: H_next=sigma(D_hat^-1/2 A_hat D_hat^-1/2 H W). GAT replaces fixed weights by normalized learned edge scores.
mixture-of-experts|y=sum_e gate_e(x)*expert_e(x), with top-1 routing and explicit capacity; record auxiliary load balancing.
scaling-laws|L(N,D)=L_infinity+A/N^alpha+B/D^beta; held-out relative error=abs(pred-actual)/actual.
efficient-convs|Dense cost=H*W*k^2*C_in*C_out; depthwise-plus-pointwise cost=H*W*(k^2*C_in+C_in*C_out).
ppo|L_clip=E[min(ratio*A,clip(ratio,1-epsilon,1+epsilon)*A)].
keyword-spotting|mel_features=log(epsilon+mel_filterbank*abs(STFT(waveform))^2).
lora|W_effective=W_frozen+(alpha/r)*B*A; trainable_fraction=adapter_parameters/total_parameters.
flashattention|m_new=max(m_old,max(scores)); l_new=exp(m_old-m_new)*l_old+sum exp(scores-m_new); rescale the output accumulator likewise.
modern-transformer|RMSNorm(x)=x/sqrt(mean(x^2)+epsilon)*gain; SwiGLU(x)=swish(xW_gate)*(xW_value).
kv-cache|K_cache=concat(K_past,K_new); speculative accept probability=min(1,p_target(token)/p_draft(token)).
chinchilla|Compute approximately proportional to N*D; minimize fitted L(N,D) subject to the same measured compute cap.
dpo|L=-log sigmoid(beta*((log pi_chosen-log ref_chosen)-(log pi_rejected-log ref_rejected))).
grpo|A_i=(reward_i-mean_group)/(std_group+epsilon); apply a clipped policy-ratio objective with documented reference regularization.
mamba|state_t=A_t*state_prev+B_t*x_t; y_t=C_t*state_t; selective coefficients depend on inputs.
flow-matching|x_t=(1-t)*noise+t*data; L=E[norm(v_theta(x_t,t)-(data-noise))^2] for the straight-line path.
classifier-free-guidance|epsilon_guided=epsilon_uncond+s*(epsilon_cond-epsilon_uncond).
discrete-diffusion-lm|q(x_t|x_prev)=Categorical(x_prev*Q_t); absorbing masks remain masked until denoising.
muon|momentum=beta*momentum+gradient; update approximately orthogonalizes matrix momentum by Newton-Schulz iterations.
mup|Choose width-dependent initialization, learning-rate multipliers and output scaling so feature updates remain order-one as width grows.
quantization|q=clip(round(x/scale)+zero_point,qmin,qmax); x_hat=scale*(q-zero_point).
knowledge-distillation|L=(1-lambda)*CE(student,y)+lambda*T^2*KL(softmax(teacher/T)||softmax(student/T)).
sparse-autoencoders|z=ReLU(W_enc*(x-b_dec)+b_enc); L=norm(W_dec*z+b_dec-x)^2+lambda*norm(z,1).
long-context-rope|Rotate each feature pair by position*frequency; compare original, NTK-scaled and YaRN-adjusted frequency schedules.
capstone-speedrun|Throughput=completed_units/elapsed_seconds; report quality at the same measured compute and memory constraints.
'''.strip().splitlines())


def individual_module(meta, entry):
    slug, title, year, paper_title, url, focus, ablation = entry
    return f'''---
id: {meta['id']}-module
title: {json.dumps(title)}
division: {meta['division']}
module: {slug}
kind: lesson
status: draft
prerequisites: {json.dumps(meta['prerequisites'])}
---

# {title}

## Historical question and bottleneck

[{paper_title}]({url}) ({meta['paper']['authors']}, {year}) is the primary reference. The original question motivating this module is how to {focus}. The practical bottleneck for this exercise is explicit: {TASKS[slug]['check']}. This is a reduced teaching adaptation, not a claim that the paper used our dataset or compute budget.

## Mechanism and equations

`{EQUATIONS[slug]}`

Derive each tensor's dimensions before implementing the equation. State the normalization axis, numerical stabilizer and train/evaluation behavior. Distinguish a mathematical mechanism from the full original training system.

## Implementation notes

Input/task: **{meta['dataset']['name']}**. Output: **{meta['interface']['model']}**. Optimize or report **{meta['metric']['name']}** in the **{meta['metric']['direction']}** direction. {TASKS[slug]['check']}.

{'An executable bounded reference and mechanism tests are available; work in the starter before opening the editorial.' if meta['implementation'] == 'reference' else 'This is a draft skeleton: reference training and task-specific tests are not implemented. The explicit stub must not be mistaken for a finished model.'}

## Controlled experiment

{ablation}. Keep split, seed, optimizer schedule and training budget fixed unless that factor is the experimental variable. Report raw quality, wall time and parameter count, not an unsupported superiority claim.

## Pitfalls and checks

- {TASKS[slug]['check']}.
- Never fit statistics on validation labels or mix held-out examples into training.
- Check shape and finite outputs before interpreting quality; an unrelated baseline cannot satisfy the intended mechanism.
- Draft targets and safety limits have not been GPU-calibrated. No pass threshold is advertised.

## Exercise and editorial

- [Implement {meta['id']}](problems/{meta['id']}/problem.yaml)
- [Mechanism-specific editorial](problems/{meta['id']}/editorial.mdx)

## Citations

- [{paper_title}]({url}) — {meta['paper']['authors']}, {year}.
{chr(10).join('- [' + paper['title'] + '](' + paper['url'] + ') — ' + paper['authors'] + ', ' + str(paper['year']) + '.' for paper in meta['paper'].get('related', []))}

All prose and code are independently authored. **Draft / uncalibrated**; no full-scale paper reproduction or GPU benchmark is claimed.
'''


def build_files():
    files = {}
    for division, entries in CATALOG.items():
        previous = None
        metas = []
        for index, entry in enumerate(entries):
            meta = metadata(division, index, entry, previous)
            metas.append(meta)
            folder = f"content/{division}/{entry[0]}/problems/{meta['id']}"
            files[f'content/{division}/{entry[0]}/module.mdx'] = individual_module(meta, entry)
            files[folder + '/problem.yaml'] = json.dumps(meta, indent=2, ensure_ascii=False) + '\n'
            files[folder + '/starter.py'] = starter_for(meta['title'], entry[5])
            files[folder + '/solution.py'] = (SOLUTIONS[entry[0]] if meta['implementation'] == 'reference' else
                '"""Explicit draft: no implemented reference or benchmark claim."""\ndef solve(data):\n    raise NotImplementedError("Draft curriculum: reference implementation unavailable")\n')
            _reference_tests = {'transformer': ATTENTION_TESTS, 'neural-language-model': LANGUAGE_TESTS,
                                'denoising-autoencoder': AUTOENCODER_TESTS}.get(entry[0], CLASSIFIER_TESTS)
            files[folder + '/tests.py'] = _reference_tests if meta['implementation'] == 'reference' else clean('''
                """Draft contract placeholder. No model-quality test exists yet."""
                def check(submission, data=None):
                    raise NotImplementedError("Draft: architecture-specific checks are not implemented")

                def test_draft_is_explicit():
                    import importlib.util
                    from pathlib import Path
                    spec = importlib.util.spec_from_file_location("draft_reference", Path(__file__).with_name("solution.py"))
                    module = importlib.util.module_from_spec(spec)
                    spec.loader.exec_module(module)
                    try:
                        module.solve({})
                    except NotImplementedError:
                        return
                    raise AssertionError("Draft reference must fail explicitly")
            ''')
            if meta['implementation'] == 'reference':
                files[folder + '/tests.py'] += '\n' + MECHANISM_TESTS.get(entry[0], '')
                if entry[0] in ('lenet5', 'resnet'):
                    files[folder + '/tests.py'] += '\n' + CALLER_SEED_TESTS
            files[folder + '/editorial.mdx'] = editorial_for(meta, entry)
            previous = meta['id']
        files[f'content/{division}/contest/module.mdx'] = contest_module(division, metas)
    return {path: mdx_safe(body) if path.endswith('.mdx') else body for path, body in files.items()}


def contest_module(division, metas):
    selection = metas[:3]
    tasks = '\n'.join(f"- {m['title']}: {m['id']} — implement its mechanism and explain one failure case." for m in selection)
    return f'''---
id: {division}-contest
title: "{division.title()} synthesis contest"
division: {division}
module: contest
kind: contest
status: draft
prerequisites: {json.dumps([m['id'] + '-module' for m in selection])}
---

# {division.title()} synthesis contest

This is a local practice format, not a ranked or calibrated event. Work without opening solution.py; papers and your own notes are allowed. Use a fixed seed and declare your hardware before beginning. Provisional timebox: 120 minutes, not a measured training budget.

## Tasks

{tasks}

## Scoring and evidence

There is no leaderboard or fabricated target score. For each task produce a shape-correct implementation, a finite numerical result, a training/validation split audit and the requested ablation. Report wall time, parameter count, device, seed and any unsupported component. Never substitute an unrelated classifier for a missing architecture. Stub tasks are paper-design exercises until their loaders and references exist.

## Review

Explain which assumptions broke under the smallest batch, a different sequence/image size and the control ablation. Read the editorial only after writing your own error analysis. No contest pass is advertised until model-specific thresholds have been calibrated on declared hardware over multiple seeds.
'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Check generated content without overwriting it')
    parser.add_argument('--verify-papers', action='store_true', help='HTTP GET canonical paper links and write the verification report')
    args = parser.parse_args()
    if not CATALOG:
        raise SystemExit('Catalog has not yet been populated.')
    files = build_files()
    mismatches = []
    for relative, content in files.items():
        path = ROOT / relative
        if args.check:
            if not path.exists() or path.read_text() != content:
                mismatches.append(relative)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content)
    if args.check:
        expected_index = {relative for relative in files if relative.endswith(('problem.yaml', 'module.mdx'))}
        actual_index = {str(path.relative_to(ROOT)) for pattern in ('problem.yaml', 'module.mdx')
                        for path in (ROOT / 'content').rglob(pattern)}
        mismatches.extend(sorted(actual_index - expected_index))
    if mismatches:
        raise SystemExit('Out-of-date or stale generated content: ' + ', '.join(mismatches))
    print(f'{"Checked" if args.check else "Wrote"} {len(files)} curriculum files')
    if args.verify_papers:
        verify_papers()


def verify_papers():
    from concurrent.futures import ThreadPoolExecutor
    from datetime import datetime, timezone
    import urllib.request
    import urllib.error
    entries = [(division, entry) for division, models in CATALOG.items() for entry in models]
    primary_count = len(entries)
    for division, models in CATALOG.items():
        for entry in models:
            for index, paper in enumerate(SECONDARY_PAPERS.get(entry[0], [])):
                entries.append((division, (entry[0] + '-related-' + str(index + 1), paper[0], paper[1], paper[0], paper[2], '', '')))
    def request(item):
        division, entry = item
        url = entry[4]
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'DLGuidePaperVerification/1.0 (educational curriculum link check)'})
            with urllib.request.urlopen(req, timeout=20) as response:
                response.read(256)
                note = ' Response accepted, but HTTP 202 does not establish that the paper content was served.' if response.status == 202 else ''
                if any(marker in response.url.lower() for marker in ('/login', 'sso.', 'cookies_not_supported')):
                    note += ' Login or cookie-error redirect observed; paper content was not verified.'
                return f'- **{division}-{entry[0]}** — [{entry[3]}]({url}): HTTP {response.status}; resolved to {response.url}.{note}'
        except urllib.error.HTTPError as error:
            return f'- **{division}-{entry[0]}** — [{entry[3]}]({url}): **HTTP {error.code} failure**. Link retained as the canonical citation; reachability was not verified in this environment.'
        except Exception as error:
            return f'- **{division}-{entry[0]}** — [{entry[3]}]({url}): **unverified** — {type(error).__name__}: {error}.'
    with ThreadPoolExecutor(max_workers=6) as executor:
        results = list(executor.map(request, entries))
    report = '# Paper URL verification\n\n'
    report += 'Checked at ' + datetime.now(timezone.utc).isoformat() + '.\n\n'
    report += 'Method: HTTP GET with redirects, 20-second timeout, and a 256-byte response read, using Python urllib. '
    report += 'An HTTP success establishes reachability, not peer-review status, licensing, paper correctness or reproduction. '
    report += 'Titles and publication years in the curriculum are curated separately; preprint year may differ from venue publication year. '
    report += 'Failures are recorded honestly and do not silently become verified links. No source code or educational prose was copied from these publications.\n\n'
    report += '\n'.join(results) + '\n\n'
    report += '## Corrected citation and source types\n\n'
    report += '- An initial candidate DAE link, `https://proceedings.mlr.press/v2/vincent08a.html`, returned HTTP 404 on 2026-10-17. It was incorrect for the 2008 ICML paper and was replaced by its ACM DOI `10.1145/1390156.1390294`; the current result above is independent of that failure.\n'
    report += '- Muon links its original 2024 technical blog, not a falsely claimed peer-reviewed paper. The sparse-autoencoder source is a 2023 research report. The capstone is an original exercise with MLPerf as benchmark-methodology background, not an invented canonical speedrun model paper.\n'
    report += '- SGD momentum cites Polyak 1964; the exercise itself has no claimed 1964 neural-network benchmark. GCN uses its 2017 venue year (2016 preprint); speculative decoding uses its 2023 venue year (2022 preprint). Related citations distinguish GRU, GAT, EfficientNet, S4, GPTQ, TinyStories, and modern-transformer components from their primary overview citation.\n\n'
    report += f'## Calibration is separate\n\nAll {primary_count} generated model entries remain draft and uncalibrated. URL verification and CPU contract tests are not GPU calibration or original-paper benchmark reproduction.\n'
    path = ROOT / 'docs' / 'PAPER_VERIFICATION.md'
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(report)
    print('Wrote docs/PAPER_VERIFICATION.md')


if __name__ == '__main__':
    main()
