# Paper URL verification

Checked at 2026-10-17T07:44:20.949798+00:00.

Method: HTTP GET with redirects, 20-second timeout, and a 256-byte response read, using Python urllib. An HTTP success establishes reachability, not peer-review status, licensing, paper correctness or reproduction. Titles and publication years in the curriculum are curated separately; preprint year may differ from venue publication year. Failures are recorded honestly and do not silently become verified links. No source code or educational prose was copied from these publications.

- **bronze-perceptron** — [The Perceptron: A Probabilistic Model for Information Storage and Organization in the Brain](https://doi.org/10.1037/h0042519): HTTP 200; resolved to https://sso.apa.org/apasso/idm/login. Login or cookie-error redirect observed; paper content was not verified.
- **bronze-mlp-backprop** — [Learning representations by back-propagating errors](https://doi.org/10.1038/323533a0): HTTP 200; resolved to https://www.nature.com/articles/323533a0?error=cookies_not_supported&code=40916465-91ca-4b50-9eb7-3910ef6a8d25. Login or cookie-error redirect observed; paper content was not verified.
- **bronze-sgd-momentum** — [Some methods of speeding up the convergence of iteration methods](https://doi.org/10.1016/0041-5553(64)90137-5): HTTP 200; resolved to https://linkinghub.elsevier.com/retrieve/pii/0041555364901375.
- **bronze-initialization** — [Understanding the difficulty of training deep feedforward neural networks](https://proceedings.mlr.press/v9/glorot10a.html): HTTP 200; resolved to https://proceedings.mlr.press/v9/glorot10a.html.
- **bronze-lenet5** — [Gradient-Based Learning Applied to Document Recognition](https://ieeexplore.ieee.org/document/726791): HTTP 202; resolved to https://ieeexplore.ieee.org/document/726791. Response accepted, but HTTP 202 does not establish that the paper content was served.
- **bronze-neural-language-model** — [A Neural Probabilistic Language Model](https://www.jmlr.org/papers/v3/bengio03a.html): HTTP 200; resolved to https://www.jmlr.org/papers/v3/bengio03a.html.
- **bronze-denoising-autoencoder** — [Extracting and Composing Robust Features with Denoising Autoencoders](https://doi.org/10.1145/1390156.1390294): **HTTP 403 failure**. Link retained as the canonical citation; reachability was not verified in this environment.
- **silver-alexnet** — [ImageNet Classification with Deep Convolutional Neural Networks](https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks): HTTP 200; resolved to https://papers.nips.cc/paper_files/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html.
- **silver-regularization** — [Dropout: A Simple Way to Prevent Neural Networks from Overfitting](https://jmlr.org/papers/v15/srivastava14a.html): HTTP 200; resolved to https://jmlr.org/papers/v15/srivastava14a.html.
- **silver-batchnorm** — [Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift](https://arxiv.org/abs/1502.03167): HTTP 200; resolved to https://arxiv.org/abs/1502.03167.
- **silver-vgg** — [Very Deep Convolutional Networks for Large-Scale Image Recognition](https://arxiv.org/abs/1409.1556): HTTP 200; resolved to https://arxiv.org/abs/1409.1556.
- **silver-resnet** — [Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385): HTTP 200; resolved to https://arxiv.org/abs/1512.03385.
- **silver-adam** — [Adam: A Method for Stochastic Optimization](https://arxiv.org/abs/1412.6980): HTTP 200; resolved to https://arxiv.org/abs/1412.6980.
- **silver-word2vec** — [Efficient Estimation of Word Representations in Vector Space](https://arxiv.org/abs/1301.3781): HTTP 200; resolved to https://arxiv.org/abs/1301.3781.
- **silver-lstm-gru** — [Long Short-Term Memory](https://doi.org/10.1162/neco.1997.9.8.1735): HTTP 200; resolved to https://direct.mit.edu/neco/article/9/8/1735/6109/Long-Short-Term-Memory.
- **silver-seq2seq-attention** — [Neural Machine Translation by Jointly Learning to Align and Translate](https://arxiv.org/abs/1409.0473): HTTP 200; resolved to https://arxiv.org/abs/1409.0473.
- **silver-vae** — [Auto-Encoding Variational Bayes](https://arxiv.org/abs/1312.6114): HTTP 200; resolved to https://arxiv.org/abs/1312.6114.
- **silver-dcgan** — [Unsupervised Representation Learning with Deep Convolutional Generative Adversarial Networks](https://arxiv.org/abs/1511.06434): HTTP 200; resolved to https://arxiv.org/abs/1511.06434.
- **silver-unet** — [U-Net: Convolutional Networks for Biomedical Image Segmentation](https://arxiv.org/abs/1505.04597): HTTP 200; resolved to https://arxiv.org/abs/1505.04597.
- **silver-dqn** — [Playing Atari with Deep Reinforcement Learning](https://arxiv.org/abs/1312.5602): HTTP 200; resolved to https://arxiv.org/abs/1312.5602.
- **silver-reinforce** — [Simple statistical gradient-following algorithms for connectionist reinforcement learning](https://doi.org/10.1007/BF00992696): HTTP 200; resolved to https://link.springer.com/article/10.1007/BF00992696?error=cookies_not_supported&code=1749d793-dc37-43f9-9c56-d51cae2cb456. Login or cookie-error redirect observed; paper content was not verified.
- **silver-transfer-learning** — [How transferable are features in deep neural networks?](https://arxiv.org/abs/1411.1792): HTTP 200; resolved to https://arxiv.org/abs/1411.1792.
- **gold-transformer** — [Attention Is All You Need](https://arxiv.org/abs/1706.03762): HTTP 200; resolved to https://arxiv.org/abs/1706.03762.
- **gold-preln-postln** — [On Layer Normalization in the Transformer Architecture](https://arxiv.org/abs/2002.04745): HTTP 200; resolved to https://arxiv.org/abs/2002.04745.
- **gold-gpt2** — [Language Models are Unsupervised Multitask Learners](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf): HTTP 200; resolved to https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf.
- **gold-bert** — [BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding](https://arxiv.org/abs/1810.04805): HTTP 200; resolved to https://arxiv.org/abs/1810.04805.
- **gold-vit** — [An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale](https://arxiv.org/abs/2010.11929): HTTP 200; resolved to https://arxiv.org/abs/2010.11929.
- **gold-simclr** — [A Simple Framework for Contrastive Learning of Visual Representations](https://arxiv.org/abs/2002.05709): HTTP 200; resolved to https://arxiv.org/abs/2002.05709.
- **gold-clip** — [Learning Transferable Visual Models From Natural Language Supervision](https://arxiv.org/abs/2103.00020): HTTP 200; resolved to https://arxiv.org/abs/2103.00020.
- **gold-ddpm** — [Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2006.11239): HTTP 200; resolved to https://arxiv.org/abs/2006.11239.
- **gold-gcn-gat** — [Semi-Supervised Classification with Graph Convolutional Networks](https://arxiv.org/abs/1609.02907): HTTP 200; resolved to https://arxiv.org/abs/1609.02907.
- **gold-mixture-of-experts** — [Switch Transformers: Scaling to Trillion Parameter Models with Simple and Efficient Sparsity](https://arxiv.org/abs/2101.03961): HTTP 200; resolved to https://arxiv.org/abs/2101.03961.
- **gold-scaling-laws** — [Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361): HTTP 200; resolved to https://arxiv.org/abs/2001.08361.
- **gold-efficient-convs** — [MobileNets: Efficient Convolutional Neural Networks for Mobile Vision Applications](https://arxiv.org/abs/1704.04861): HTTP 200; resolved to https://arxiv.org/abs/1704.04861.
- **gold-ppo** — [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347): HTTP 200; resolved to https://arxiv.org/abs/1707.06347.
- **gold-keyword-spotting** — [Speech Commands: A Dataset for Limited-Vocabulary Speech Recognition](https://arxiv.org/abs/1804.03209): HTTP 200; resolved to https://arxiv.org/abs/1804.03209.
- **platinum-lora** — [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685): HTTP 200; resolved to https://arxiv.org/abs/2106.09685.
- **platinum-flashattention** — [FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness](https://arxiv.org/abs/2205.14135): HTTP 200; resolved to https://arxiv.org/abs/2205.14135.
- **platinum-modern-transformer** — [Llama 2: Open Foundation and Fine-Tuned Chat Models](https://arxiv.org/abs/2307.09288): HTTP 200; resolved to https://arxiv.org/abs/2307.09288.
- **platinum-kv-cache** — [Fast Inference from Transformers via Speculative Decoding](https://arxiv.org/abs/2211.17192): HTTP 200; resolved to https://arxiv.org/abs/2211.17192.
- **platinum-chinchilla** — [Training Compute-Optimal Large Language Models](https://arxiv.org/abs/2203.15556): HTTP 200; resolved to https://arxiv.org/abs/2203.15556.
- **platinum-dpo** — [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290): HTTP 200; resolved to https://arxiv.org/abs/2305.18290.
- **platinum-grpo** — [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300): HTTP 200; resolved to https://arxiv.org/abs/2402.03300.
- **platinum-mamba** — [Mamba: Linear-Time Sequence Modeling with Selective State Spaces](https://arxiv.org/abs/2312.00752): HTTP 200; resolved to https://arxiv.org/abs/2312.00752.
- **platinum-flow-matching** — [Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747): HTTP 200; resolved to https://arxiv.org/abs/2210.02747.
- **platinum-classifier-free-guidance** — [Classifier-Free Diffusion Guidance](https://arxiv.org/abs/2207.12598): HTTP 200; resolved to https://arxiv.org/abs/2207.12598.
- **platinum-discrete-diffusion-lm** — [Structured Denoising Diffusion Models in Discrete State-Spaces](https://arxiv.org/abs/2107.03006): HTTP 200; resolved to https://arxiv.org/abs/2107.03006.
- **platinum-muon** — [Muon: An optimizer for hidden layers in neural networks](https://kellerjordan.github.io/posts/muon/): HTTP 200; resolved to https://kellerjordan.github.io/posts/muon/.
- **platinum-mup** — [Tensor Programs V: Tuning Large Neural Networks via Zero-Shot Hyperparameter Transfer](https://arxiv.org/abs/2203.03466): HTTP 200; resolved to https://arxiv.org/abs/2203.03466.
- **platinum-quantization** — [LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale](https://arxiv.org/abs/2208.07339): HTTP 200; resolved to https://arxiv.org/abs/2208.07339.
- **platinum-knowledge-distillation** — [Distilling the Knowledge in a Neural Network](https://arxiv.org/abs/1503.02531): HTTP 200; resolved to https://arxiv.org/abs/1503.02531.
- **platinum-sparse-autoencoders** — [Towards Monosemanticity: Decomposing Language Models With Dictionary Learning](https://transformer-circuits.pub/2023/monosemantic-features/index.html): HTTP 200; resolved to https://transformer-circuits.pub/2023/monosemantic-features/index.html.
- **platinum-long-context-rope** — [YaRN: Efficient Context Window Extension of Large Language Models](https://arxiv.org/abs/2309.00071): HTTP 200; resolved to https://arxiv.org/abs/2309.00071.
- **platinum-capstone-speedrun** — [MLPerf Training Benchmark](https://arxiv.org/abs/1910.01500): HTTP 200; resolved to https://arxiv.org/abs/1910.01500.
- **bronze-denoising-autoencoder-related-1** — [Extracting and Composing Robust Features with Denoising Autoencoders (author-hosted PDF)](https://www.cs.toronto.edu/~larocheh/publications/icml-2008-denoising-autoencoders.pdf): HTTP 200; resolved to https://www.cs.toronto.edu/~larocheh/publications/icml-2008-denoising-autoencoders.pdf.
- **silver-adam-related-1** — [Decoupled Weight Decay Regularization](https://arxiv.org/abs/1711.05101): HTTP 200; resolved to https://arxiv.org/abs/1711.05101.
- **silver-lstm-gru-related-1** — [Learning Phrase Representations using RNN Encoder-Decoder for Statistical Machine Translation](https://arxiv.org/abs/1406.1078): HTTP 200; resolved to https://arxiv.org/abs/1406.1078.
- **gold-gpt2-related-1** — [TinyStories: How Small Can Language Models Be and Still Speak Coherent English?](https://arxiv.org/abs/2305.07759): HTTP 200; resolved to https://arxiv.org/abs/2305.07759.
- **gold-gcn-gat-related-1** — [Graph Attention Networks](https://arxiv.org/abs/1710.10903): HTTP 200; resolved to https://arxiv.org/abs/1710.10903.
- **gold-efficient-convs-related-1** — [EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks](https://arxiv.org/abs/1905.11946): HTTP 200; resolved to https://arxiv.org/abs/1905.11946.
- **platinum-modern-transformer-related-1** — [RoFormer: Enhanced Transformer with Rotary Position Embedding](https://arxiv.org/abs/2104.09864): HTTP 200; resolved to https://arxiv.org/abs/2104.09864.
- **platinum-modern-transformer-related-2** — [Root Mean Square Layer Normalization](https://arxiv.org/abs/1910.07467): HTTP 200; resolved to https://arxiv.org/abs/1910.07467.
- **platinum-modern-transformer-related-3** — [GLU Variants Improve Transformer](https://arxiv.org/abs/2002.05202): HTTP 200; resolved to https://arxiv.org/abs/2002.05202.
- **platinum-modern-transformer-related-4** — [GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints](https://arxiv.org/abs/2305.13245): HTTP 200; resolved to https://arxiv.org/abs/2305.13245.
- **platinum-mamba-related-1** — [Efficiently Modeling Long Sequences with Structured State Spaces](https://arxiv.org/abs/2111.00396): HTTP 200; resolved to https://arxiv.org/abs/2111.00396.
- **platinum-flow-matching-related-1** — [Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow](https://arxiv.org/abs/2209.03003): HTTP 200; resolved to https://arxiv.org/abs/2209.03003.
- **platinum-flow-matching-related-2** — [Scalable Diffusion Models with Transformers](https://arxiv.org/abs/2212.09748): HTTP 200; resolved to https://arxiv.org/abs/2212.09748.
- **platinum-quantization-related-1** — [GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers](https://arxiv.org/abs/2210.17323): HTTP 200; resolved to https://arxiv.org/abs/2210.17323.

## Corrected citation and source types

- An initial candidate DAE link, `https://proceedings.mlr.press/v2/vincent08a.html`, returned HTTP 404 on 2026-10-17. It was incorrect for the 2008 ICML paper and was replaced by its ACM DOI `10.1145/1390156.1390294`; the current result above is independent of that failure.
- Muon links its original 2024 technical blog, not a falsely claimed peer-reviewed paper. The sparse-autoencoder source is a 2023 research report. The capstone is an original exercise with MLPerf as benchmark-methodology background, not an invented canonical speedrun model paper.
- SGD momentum cites Polyak 1964; the exercise itself has no claimed 1964 neural-network benchmark. GCN uses its 2017 venue year (2016 preprint); speculative decoding uses its 2023 venue year (2022 preprint). Related citations distinguish GRU, GAT, EfficientNet, S4, GPTQ, TinyStories, and modern-transformer components from their primary overview citation.

## Calibration is separate

All 54 generated model entries remain draft and uncalibrated. URL verification and CPU contract tests are not GPU calibration or original-paper benchmark reproduction.

## Advanced research references — checked 2026-10-17

Evidence appended after authoring the eight Advanced modules. References were discovered with current-year web searches and read through primary pages. An independent `python3 tools/seed_research.py --verify-urls` run at 2026-10-17T08:26:08Z performed redirected HTTP GETs (30-second timeout, up to 3 MB per response), normalized HTML/text, and checked each full paper title. All 14 returned HTTP 200 with a matching title; resolved URLs were unchanged. This records reachability and title identity, not independent validation of scientific conclusions. Selection is researched as of this date, not a claim of exhaustive or arbitrarily newest coverage. Instructional prose and projects are original.

- [Towards Best Practices of Activation Patching in Language Models: Metrics and Methods](https://arxiv.org/abs/2309.16042) — 2023; HTTP 200; title matched.
- [How to use and interpret activation patching](https://arxiv.org/abs/2404.15255) — 2024; HTTP 200; title matched.
- [Toy Models of Superposition](https://transformer-circuits.pub/2022/toy_model/index.html) — 2022; HTTP 200; title matched; primary research report.
- [Scaling and evaluating sparse autoencoders](https://arxiv.org/abs/2406.04093) — 2024; HTTP 200; title matched.
- [SAEs Are Good for Steering – If You Select the Right Features](https://arxiv.org/abs/2505.20063) — 2025; HTTP 200; title matched.
- [Circuit Tracing: Revealing Computational Graphs in Language Models](https://transformer-circuits.pub/2025/attribution-graphs/methods.html) — 2025; HTTP 200; title matched; primary methods report.
- [Towards Long-Horizon Interpretability: Efficient and Faithful Multi-Token Attribution for Reasoning LLMs](https://arxiv.org/abs/2602.01914) — 2026; HTTP 200; title matched; FlashTrace, a token-attribution method distinguished from internal feature circuit tracing.
- [Steering Llama 2 via Contrastive Activation Addition](https://arxiv.org/abs/2312.06681) — first preprint 2023, later revisions; HTTP 200; title matched.
- [s1: Simple test-time scaling](https://arxiv.org/abs/2501.19393) — 2025; HTTP 200; title matched.
- [DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning](https://arxiv.org/abs/2501.12948) — 2025; HTTP 200; title matched.
- [Reasoning Models Don't Always Say What They Think](https://arxiv.org/abs/2505.05410) — 2025; HTTP 200; title matched after punctuation normalization.
- [Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?](https://arxiv.org/abs/2504.13837) — 2025; HTTP 200; title matched. Its conclusions are presented as setting-dependent evidence, not an impossibility theorem.
- [Reinforcement Learning with Verifiable Rewards Implicitly Incentivizes Correct Reasoning in Base LLMs](https://proceedings.iclr.cc/paper_files/paper/2026/hash/517f9b9c227b9dd51dba4560f37165ed-Abstract-Conference.html) — ICLR 2026 venue year; HTTP 200; title matched. Included as a counterpoint with different reasoning-sensitive measurements, not silent consensus.
- [AntiLeakBench: Preventing Data Contamination by Automatically Constructing Benchmarks with Updated Real-World Knowledge](https://aclanthology.org/2025.acl-long.901/) — ACL 2025; HTTP 200; title matched.

All eight Advanced entries remain draft research readings with bounded manual projects, empty problem lists, and no generated notebooks, fake grades, or fabricated benchmark results. Each distinguishes established observations in cited settings from hypotheses to test locally.
