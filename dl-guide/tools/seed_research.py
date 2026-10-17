#!/usr/bin/env python3
"""Seed only original Advanced reading/project modules; never seed graded problems.

Run `python3 tools/seed_research.py` independently of seed_catalog.py.
Use --check for deterministic source checks; --verify-urls for live HTTP/title
checks (network required). No site/config, catalog, notebooks, or runtime writes.
Reference selection was researched on 2026-10-17, not claimed exhaustive/latest.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
import html
import json
from pathlib import Path
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
RESEARCHED = "2026-10-17"

# Titles were checked against primary pages, not inferred from URL identifiers.
PAPERS = {
    "patching": (2023, "Towards Best Practices of Activation Patching in Language Models: Metrics and Methods", "https://arxiv.org/abs/2309.16042"),
    "patching-guide": (2024, "How to use and interpret activation patching", "https://arxiv.org/abs/2404.15255"),
    "superposition": (2022, "Toy Models of Superposition", "https://transformer-circuits.pub/2022/toy_model/index.html"),
    "sae-eval": (2024, "Scaling and evaluating sparse autoencoders", "https://arxiv.org/abs/2406.04093"),
    "sae-steering": (2025, "SAEs Are Good for Steering – If You Select the Right Features", "https://arxiv.org/abs/2505.20063"),
    "tracing": (2025, "Circuit Tracing: Revealing Computational Graphs in Language Models", "https://transformer-circuits.pub/2025/attribution-graphs/methods.html"),
    "flashtrace": (2026, "Towards Long-Horizon Interpretability: Efficient and Faithful Multi-Token Attribution for Reasoning LLMs", "https://arxiv.org/abs/2602.01914"),
    "caa": (2023, "Steering Llama 2 via Contrastive Activation Addition", "https://arxiv.org/abs/2312.06681"),
    "s1": (2025, "s1: Simple test-time scaling", "https://arxiv.org/abs/2501.19393"),
    "r1": (2025, "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning", "https://arxiv.org/abs/2501.12948"),
    "faithfulness": (2025, "Reasoning Models Don't Always Say What They Think", "https://arxiv.org/abs/2505.05410"),
    "rl-limit": (2025, "Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?", "https://arxiv.org/abs/2504.13837"),
    "rl-counterpoint": (2026, "Reinforcement Learning with Verifiable Rewards Implicitly Incentivizes Correct Reasoning in Base LLMs", "https://proceedings.iclr.cc/paper_files/paper/2026/hash/517f9b9c227b9dd51dba4560f37165ed-Abstract-Conference.html"),
    "antileak": (2025, "AntiLeakBench: Preventing Data Contamination by Automatically Constructing Benchmarks with Updated Real-World Knowledge", "https://aclanthology.org/2025.acl-long.901/"),
}

MODULES = [
    dict(slug="causal-circuits", title="Circuits, activation patching, and causal interventions", year=2023,
         prerequisites=["gold-transformer-module"], refs=["patching", "patching-guide"],
         description="Localize behavior with matched counterfactuals, exact patches, and falsifiable circuit claims.", body=r"""
## Research question and objectives

A component can correlate with an answer without being used to produce it.
This reading asks what evidence a controlled activation replacement actually supplies.
By the end, distinguish localization, necessity, sufficiency, and a complete circuit explanation.
Design matched clean/counterfactual prompts and defend the output statistic before looking at a heatmap.
Use the [Transformer lesson](../../gold/transformer/module.mdx) to review residual streams and causal masks.

## Notation and estimand

Let $f$ be a frozen autoregressive model and $h_{\ell,t}(x)$ its residual activation at layer $\ell$, position $t$.
Let $a$ and $b$ be single-token candidate answers, with logits $z_a$ and $z_b$.
The clean prompt $x$ favors $a$; a counterfactual $x'$ changes the relevant fact while preserving the template.
Define the score $m(x)=z_a(x)-z_b(x)$ at the answer position, using the same candidates for every run.
A restoration experiment replaces one activation in the counterfactual run with its clean counterpart:

$$
x'_{\mathrm{patch}}:\quad h_{\ell,t}(x')\leftarrow h_{\ell,t}(x),\qquad
\Delta_{\ell,t}=m(x'_{\mathrm{patch}})-m(x').
$$

The arrow describes an intervention on a forward computation, not an edit to model weights.
It also does not assert that a token has a unique semantic representation at that site.
A useful descriptive normalization divides $\Delta$ by $m(x)-m(x')$ only when that denominator is well separated from zero.
Always retain raw scores: normalization can explode or reverse the visual interpretation when the clean effect is tiny.

## Read the evidence, not just the picture

The 2023 best-practices paper studies how corruption choice and score choice change localization results.
Its recommendations are empirical guidance in studied settings, not a theorem guaranteeing faithful discovery.
The 2024 guide separates component localization from testing interactions between components.
Read their discussions of logit differences, counterfactual replacement, and misleading interpretations first.
A bright patching cell says an injected value affects this measured contrast under this background computation.
It does not establish a human-level concept, exclusivity of the pathway, or sufficiency on other tasks.

## Intervention protocol

1. Write 12 development prompt pairs with matched syntax; inspect tokenization and answer-token IDs.
2. Freeze a second set of 12 pairs with new names or entities before selecting sites.
3. Run clean and counterfactual baselines in evaluation mode with gradients disabled.
4. Cache activations from the clean run and patch the counterfactual residual stream at one site per run.
5. Verify that the hook writes only the declared layer, position, and batch element.
6. Compare coarse residual patches first; investigate individual head or MLP outputs only afterward.
7. Reverse the intervention by replacing a clean activation with its counterfactual counterpart.
8. Evaluate selected sites on the frozen pairs without changing the score or corruption procedure.

The forward restoration and reverse damage experiments answer related but different questions.
Restoration need not equal damage because downstream nonlinearities and backup paths differ across backgrounds.
For a multi-token answer, predeclare a sequence log-probability contrast rather than silently reading one token.
Do not align positions merely by character index when the tokenizer produces different sequence lengths.

## Controls and failure modes

- Identity patch: copy a site's activation from the same input; logits should agree within numerical tolerance.
- Unrelated donor: patch a matched-format prompt with an irrelevant changed fact.
- Wrong-position control: test a nearby position selected before examining its effect.
- Corruption control: compare two semantic counterfactual constructions; Gaussian noise is not automatically realistic.
- Implementation control: disable every hook and confirm the original logits return.
- Multiplicity control: report the entire scanned grid and the selection rule, not only the brightest cell.

Zero ablation can create an activation the model would never naturally encounter.
Counterfactual donors reduce that risk but can still carry multiple changed variables.
A failed lesion does not prove irrelevance: another component may compensate.
A successful lesion can break general computation rather than specifically remove the hypothesized mechanism.

## Bounded manual CPU/Colab exploration

Use a locally available GPT-2-small-size checkpoint, or a smaller transformer whose hooks you can audit.
Record its exact revision, tokenizer revision, license, dtype, and library versions before downloading weights.
Keep prompts below 48 tokens; scan at most six layers and four positions on the development pairs.
CPU users may reduce to four development pairs and two sites, explicitly recording the reduced scope.
An optional Colab GPU changes runtime, not the evidential meaning of the experiment.
Estimate memory from the cache and stop if it exceeds 1 GB; cache only the activations you need.
No training, broad benchmark run, or claimed paper-level reproduction is required.
If the model does not solve the clean task, report that failure rather than engineering a flattering heatmap.

## Established findings and open hypotheses

**Established in the cited experiments:** patching outcomes depend on metric, corruption, and intervention granularity.
**Open hypothesis for your run:** the selected site mediates the entity contrast across held-out templates.
Testing that hypothesis requires new templates and targeted interaction tests, not a more compelling feature name.
A circuit claim should name its task distribution and the fraction of behavior it fails to explain.

## Research deliverable

Write a one-page claim–evidence–alternative-explanation note, with raw per-pair scores and a hook audit.
Include one negative control that worked and one result that weakened your preferred explanation.
Report uncertainty across prompt pairs; repeated deterministic forwards of one prompt are not independent evidence.
There is no pass score or calibrated performance target for this exploration.
Continue to [feature attribution and superposition](../feature-attribution/module.mdx) to change the intervention basis.
"""),
    dict(slug="feature-attribution", title="Sparse features, superposition, and attribution beyond reconstruction", year=2024,
         prerequisites=["platinum-sparse-autoencoders-module", "advanced-causal-circuits-module"], refs=["superposition", "sae-eval", "sae-steering"],
         description="Audit sparse feature explanations with residual-preserving interventions and dictionary stability checks.", body=r"""
## Research question and objectives

The [Platinum SAE lesson](../../platinum/sparse-autoencoders/module.mdx) introduces dictionary fitting and sparsity tradeoffs.
Here the dictionary is a measurement instrument, not the final scientific explanation.
Ask whether an interpretable latent has a reproducible causal role rather than merely a plausible list of top examples.
Separate superposition in the model, dictionary non-identifiability, and feature attribution in your own argument.
Learn to preserve reconstruction error when intervening so that a latent edit is not confused with replacing the entire representation.

## Notation and a change of basis

Let $h\in\mathbb{R}^d$ be a frozen activation, $z=E(h)\in\mathbb{R}^m$ a sparse code, and $D\in\mathbb{R}^{d\times m}$ a decoder.
The decoder columns $d_j$ need not be orthogonal; an overcomplete dictionary can have $m>d$.
Write the reconstruction as $\hat h=b+Dz$ and the residual as $e=h-\hat h$.
To alter just latent $j$, keep that residual rather than silently discarding it:

$$
h^{(j\to c)}=b+D z^{(j\to c)}+e
=h+(c-z_j)d_j.
$$

This identity makes the intervention explicit even when reconstruction is imperfect.
It does not imply that the new activation is in distribution or that the encoder would return the edited code.
A first-order attribution estimate for output score $m(h)$ is

$$
A_j=(c-z_j)\,d_j^\top\nabla_h m(h).
$$

Compare $A_j$ with the exact forward change; large edits can invalidate the local linear approximation.
Keep decoder normalization fixed because rescaling $d_j$ changes the numerical meaning of a unit code edit.

## Reading route and conceptual distinction

Toy Models of Superposition constructs simplified settings where more sparse features than dimensions can be represented.
Those constructions establish a mechanism in toy models, not a universal decomposition of every language model activation.
Scaling and evaluating sparse autoencoders extends evaluation beyond reconstruction loss and sparsity alone.
Read the downstream-effect and feature-quality discussions before accepting a favorable reconstruction frontier as interpretability evidence.
The 2025 steering paper distinguishes features that detect input patterns from those whose interventions drive outputs.
A strongly activating feature therefore need not be the best control variable for its apparent semantic label.

## Intervention protocol

1. Freeze a small model and choose one layer using development data only.
2. Use a compatible published dictionary with a recorded checkpoint, or fit a tiny dictionary on a separate activation pool.
3. Split examples by template family rather than randomly splitting nearly identical sentences.
4. Select at most three latents from development examples; write predicted positive and negative cases in advance.
5. Compute no-edit, full-reconstruction, and residual-preserving no-edit forwards.
6. Set each selected latent to zero, to a matched donor value, and to a modest positive increment.
7. Measure exact changes in the predeclared answer contrast and off-target next-token loss.
8. Compare those changes with the gradient estimate and evaluate the predicted sign on held-out templates.

Record the sparse-code values, decoder norms, residual norm, and actual activation displacement for every edit.
Full-reconstruction replacement tests the dictionary as a whole; it is not a selective feature ablation.
If residual-preserving no-edit does not reproduce the baseline, stop and debug the hook or numerical precision.
Do not call a feature universally monosemantic based on ten highly selected activations.

## Controls and identifiability

- Match a random decoder-direction intervention by activation-space norm, not by latent coefficient.
- Compare active and inactive latents to detect changes caused simply by a large injected vector.
- Repeat on two dictionary seeds or widths if fitting locally; match features by decoder similarity and examples, not index.
- Inspect whether the named behavior is spread across multiple latents or absorbed into a broader feature.
- Check reconstruction-only loss recovery separately from behavioral specificity.
- Keep discovery examples, label-writing examples, and final test examples distinguishable in the report.

Feature splitting means two dictionaries may encode a behavior at different levels of granularity.
Feature absorption can make a narrow concept appear inside another latent's activation pattern.
Neither low mean squared error nor a clean feature label settles those ambiguities.
A reliable causal effect on one output contrast is stronger evidence than an attractive label, but still local evidence.

## Bounded manual CPU/Colab exploration

A CPU-only alternative uses 2,000 synthetic activations from 12 sparse factors embedded in six dimensions.
Generate independent sparse Bernoulli factors with fixed decoder directions and reserve 500 new samples for evaluation.
Fit two 24-latent dictionaries for no more than 500 minibatch steps each; record the chosen optimizer and seed.
Compare recovered directions with the known generating directions under permutation and sign conventions.
Then intervene on a linear downstream readout and observe when reconstruction quality fails to predict attribution accuracy.
This synthetic option tests a measurement issue, not whether a real language model has the same factor structure.
An optional Colab extension uses a published small-model SAE and 20 short prompts, without training a frontier-scale dictionary.
Do not advertise either route as reproducing the cited large-model scaling experiment.

## Established findings and open hypotheses

**Established in cited settings:** sparse reconstructions can expose useful structure, while feature quality needs more than reconstruction metrics.
**Open hypothesis:** your selected latent is a stable causal handle across dictionaries and template families.
A sign disagreement between gradient attribution and exact editing may indicate nonlinearity, hook errors, or a poor feature basis.
Investigate those alternatives before claiming a new semantic discovery.

## Research deliverable

Submit a feature audit with predicted counterexamples, exact versus approximate effects, and dictionary provenance.
Include a case where the feature label overpredicted the causal effect, or explain why your sample was inconclusive.
State which residual and off-target controls were retained and which you could not afford.
There is no graded feature-quality threshold or notebook badge attached to this reading.
Next, connect local feature effects in [circuit tracing](../circuit-tracing/module.mdx).
"""),
    dict(slug="circuit-tracing", title="Circuit tracing and attribution graphs", year=2025,
         prerequisites=["advanced-feature-attribution-module"], refs=["tracing", "flashtrace"],
         description="Distinguish replacement-model attribution graphs from validated causal mechanisms and token attribution.", body=r"""
## Research question and objectives

An attribution graph is useful only if its edges mean something precise about a model's computation.
The 2025 Circuit Tracing paper builds graphs using a replacement model with cross-layer transcoders.
Your objective is to separate an explanatory approximation, a graph visualization, and evidence from intervention in the original model.
Learn to track what is held fixed, what is approximated, and what is omitted from each graph.
Do not confuse a sparse feature graph with a chain of natural-language reasoning steps.

## Notation and edge semantics

Let $a_i$ be the activation of feature node $i$, and let $u_j$ be a downstream preactivation or chosen scalar score.
For a local differentiable computation, a diagnostic edge quantity is

$$
E_{i\to j}=a_i\frac{\partial u_j}{\partial a_i}.
$$

This simplified local attribution is a teaching definition, not a complete reimplementation of the paper's graph construction.
Its magnitude depends on the operating point and feature parameterization.
It is not a probability and does not by itself measure the effect of deleting a whole causal pathway.
For an edit $a_i\leftarrow a_i+\delta$, compare predicted and measured downstream responses:

$$
\widehat{\Delta u_j}=\delta\frac{\partial u_j}{\partial a_i},\qquad
\epsilon_j=\Delta u_j-\widehat{\Delta u_j}.
$$

Report $\epsilon_j$ as a function of edit size instead of accepting a graph because its labels tell a coherent story.
In an autoregressive transformer, position and layer are both part of a node's identity.
A graph for one next-token decision does not automatically explain the full generated answer.

## Reading route: established method and newer frontier

Read the 2025 methods paper's replacement-model construction, graph pruning, and perturbation validation sections.
The learned replacement approximates parts of the model; approximation errors remain scientifically relevant nodes or residual terms.
The original method also has limitations around fixed attention patterns and other omitted nonlinear computation.
Check which limitations apply to the exact implementation/version you inspect rather than assuming every graph tool is equivalent.
The 2026 FlashTrace paper addresses multi-token attribution over extended reasoning and propagation back to inputs.
That input/token-attribution problem is complementary to, not identical with, sparse internal-feature circuit tracing.
Its reported efficiency and faithfulness results are method-specific evidence, not proof that all long reasoning traces are explained.

## Intervention protocol

1. Choose one short prompt and one next-token contrast, then freeze a small family of paraphrases.
2. Record the original model, replacement model, dictionary revisions, and graph-building configuration.
3. Compare original and replacement logits before interpreting any node labels.
4. Save an unpruned graph or sufficient statistics before tuning a visualization threshold.
5. Select one positive edge and one near-zero edge on development examples.
6. Predict downstream changes from local derivatives for three small edit sizes.
7. Perform the corresponding intervention in the original computation where a compatible feature edit is defined.
8. Recheck held-out paraphrases and report which prediction signs and magnitudes survive.

If a tool exposes only a replacement model, label every causal test as a replacement-model test.
Do not imply that a graph screenshot alone validates the original model mechanism.
When testing a proposed path, distinguish editing its source from selectively removing its edge contribution.
An upstream edit can alter many downstream nodes, including paths omitted by pruning.

## Controls and limits

- Compare a same-node no-op edit against the untouched model before interpreting any graph discrepancy.
- Match perturbation norms across important and low-attribution nodes.
- Sweep pruning thresholds and measure omitted attribution mass rather than hiding unstable edges.
- Include reconstruction-error contributions and identify any unmodeled residual computation.
- Keep the attention pattern fixed only when the method requires it, and label the resulting conditional explanation.
- Check both predicted downstream-node effects and the eventual answer-score effect.

A sparse graph can look persuasive because a human supplies missing semantic connections.
A node's natural-language name is an interpretation of its activation examples, not an observed variable from the original training task.
A graph can be locally predictive while failing under a large counterfactual or a new prompt family.
Those failures define the boundary of the explanation; they are not optional negative examples to discard.

## Bounded manual CPU/Colab exploration

Start on CPU with a two-layer ReLU network of width 16 and eight synthetic sparse input factors.
Write its exact computational graph, then linearize the downstream effect at ten fixed examples.
Compare the derivative-predicted and actual changes from three perturbation magnitudes at two hidden nodes.
Show how pruning low local contributions can fail when an edit changes a ReLU gate.
This requires only small matrix operations and can be completed without a language-model download.
For an optional Colab extension, inspect one published small-model attribution graph and its available validation artifacts.
Cap the extension at one prompt family and three interventions if compatible open weights and tools are available.
Do not promise that a free Colab session can construct a frontier-model cross-layer transcoder.

## Established findings and open hypotheses

**Established in cited experiments:** replacement-model graphs can support testable, partially faithful explanations of selected behaviors.
**Open hypothesis:** the pruned subgraph you select remains predictive under a new intervention and new prompt template.
Long-horizon attribution and completeness of feature-level explanations remain active research questions.
Avoid turning partial mechanistic evidence into a claim of reading the model's private thoughts.

## Research deliverable

Provide a graph with explicit node and edge semantics, an approximation-error audit, and predicted-versus-measured intervention results.
Name at least two computations the graph does not explain and one observation that could falsify your preferred path.
Distinguish your toy-network validation from any paper's large-model case study.
Continue to [representation steering](../representation-steering/module.mdx) to evaluate controls rather than explanations alone.
"""),
    dict(slug="representation-steering", title="Representation steering and causal controls", year=2023,
         prerequisites=["advanced-causal-circuits-module", "advanced-feature-attribution-module"], refs=["caa", "sae-steering"],
         description="Construct held-out contrastive steering tests with dose response, off-target controls, and distribution limits.", body=r"""
## Research question and objectives

A direction that predicts a property is not automatically a direction that selectively controls that property.
Representation steering tests a stronger intervention claim by modifying hidden states during a forward pass.
Learn to separate a useful engineering control from an interpretation of a naturally occurring mechanism.
Design a dose-response experiment that can reveal collateral degradation, not merely a few successful generations.
Use benign topics such as formal versus informal style; this project does not require bypassing safety safeguards.

## Notation and contrastive direction

Let $h_\ell(x_i^+)$ and $h_\ell(x_i^-)$ be matched activations from positive and negative style examples.
For $n$ training pairs, form a mean contrast at a declared token position:

$$
v_\ell=\frac{1}{n}\sum_{i=1}^{n}\left(h_\ell(x_i^+)-h_\ell(x_i^-)\right),\qquad
h'_{\ell,t}=h_{\ell,t}+\alpha v_\ell.
$$

The application positions $t$, layer $\ell$, and coefficient $\alpha$ are all part of the intervention specification.
Record whether $v_\ell$ is normalized; coefficients cannot be compared across layers without a scale convention.
Paired examples should differ in the intended behavior without systematically changing topic, length, or answer correctness.
Otherwise the mean contrast may encode those confounds instead of style.

## Readings and evidential status

Steering Llama 2 via Contrastive Activation Addition first appeared as a 2023 preprint, with later revisions.
It studies averaged contrast directions and behavior changes under activation addition.
Its observed effects establish controllability in its tested conditions, not a universal linear axis for a human concept.
The 2025 SAE steering paper shows why selecting a feature by input activation need not select a strong output control.
Read that distinction before treating a descriptive feature name as a reliable intervention handle.
An SAE-based edit and a contrastive mean direction are different bases and require matched displacement controls.

## Intervention protocol

1. Write 20 paired short examples of formal/informal wording across five benign topics.
2. Split by topic: three for direction estimation, one for coefficient selection, and one frozen for testing.
3. Freeze the model and cache one declared position at each of at most three candidate layers.
4. Estimate $v_\ell$ using only training examples; choose a layer using the development topic.
5. Evaluate $\alpha=0$ and a symmetric set of small positive and negative coefficients.
6. Keep decoding settings, random seeds, maximum output tokens, and stopping rules identical.
7. Score style with a prewritten rubric and separately score factual preservation and grammatical coherence.
8. Evaluate the frozen topic once with all planned coefficients and keep unsuccessful generations.

When using stochastic decoding, pair seeds across intervention conditions and report prompt-level aggregates.
A style classifier trained on the same contrast examples can reward artifacts; include a small blind human check.
For manual annotation, hide intervention labels and define how ties and ambiguous cases are handled.
Avoid selecting only generations that contain an obvious stylistic keyword.

## Causal controls

- A zero-vector hook must reproduce the untouched model.
- A norm-matched random direction estimates the disruption caused by adding arbitrary energy.
- A label-shuffled contrast estimates how much the extraction procedure works without the intended association.
- A sign reversal tests directional behavior, but lack of symmetry is not automatically an implementation bug.
- A prompt-only style instruction is a practical baseline with a different mechanism.
- A held-out factual task measures whether steering damages unrelated behavior.

Record the residual-stream norm and relative intervention size at every chosen layer.
A coefficient that forces a style word while destroying answer content is not a successful selective control.
Changing LayerNorm statistics can create broad effects even if the direction has an appealing semantic description.
Repeat direction extraction across training subsets to expose instability hidden by a single averaged vector.

## Bounded manual CPU/Colab exploration

Use a small local causal LM with auditable forward hooks and at most 40 generated tokens per prompt.
CPU users can test eight prompt pairs, two layers, and three coefficient values; keep the reduced design explicit.
A Colab GPU can extend to the full 20-pair design without finetuning the model.
Stop after 120 generations or 20 minutes of execution, whichever comes first, and record incomplete conditions.
Measure actual elapsed time and token counts rather than claiming a universal speed or effect size.
If model access is unavailable, use a small trained synthetic classifier and disclose the weaker behavioral scope.
Do not imply that the synthetic fallback demonstrates language-style control.
No safety-sensitive prompt collection or hidden service access is necessary.

## Established findings and open hypotheses

**Established in cited settings:** activation additions can change behavior, and input-detection scores alone can be insufficient for choosing controls.
**Open hypothesis:** your extracted direction controls style while preserving task content on a new topic family.
A useful intervention need not correspond to a unique feature that the unmodified model naturally uses.
A successful benign control also does not imply that safety controls will generalize under adaptive attack.

## Research deliverable

Produce a coefficient-response plot or short annotated result list with target and off-target outcomes kept separate.
Describe extraction examples, hook placement, norm conventions, blind rubric, and failure cases precisely enough to repeat.
State whether evidence supports controllability, interpretation, both, or neither.
There is no benchmark threshold, graded reward, or generated notebook for this module.
Connect this distinction to [reasoning and inference-time compute](../reasoning-compute/module.mdx).
"""),
    dict(slug="reasoning-compute", title="Reasoning and inference-time compute", year=2025,
         prerequisites=["gold-transformer-module", "platinum-kv-cache-module"], refs=["s1", "r1", "faithfulness"],
         description="Compare sequential reasoning and independent sampling under explicit budgets without equating traces with mechanisms.", body=r"""
## Research question and objectives

More generated tokens can mean additional search, redundant explanation, or an answer drifting away from a correct solution.
This module asks when extra inference computation helps and what a fair comparison must hold constant.
Distinguish sequential reasoning, independent sampling, verifier selection, and majority voting.
Learn why a correct final answer and a faithful account of its causes are different evaluation targets.
The [KV-cache lesson](../../platinum/kv-cache/module.mdx) explains why token count is not identical to wall-clock cost.

## Notation and resource accounting

Let a policy generate candidate $y$ for question $x$, with verifiable correctness $V(x,y)\in\{0,1\}$.
A run uses $k$ candidates of lengths $T_i$ and may spend additional compute on verification.
A transparent token-based budget proxy is

$$
B_{\mathrm{tokens}}=\sum_{i=1}^{k} T_i+T_{\mathrm{verifier}}.
$$

Report prompt tokens and cached versus uncached execution separately; this proxy is not an exact FLOP estimate.
Define observed solve rate on a fixed question set independently of how much text the model produces.
With independent candidate success probability $p$, oracle selection would succeed with probability

$$
P(\text{at least one correct in }k)=1-(1-p)^k.
$$

This is an idealized independence calculation, not a guaranteed performance law for correlated model samples.
A deployed system also needs a selector; oracle correctness cannot be used as though it were a free inference-time tool.

## Reading route

The 2025 s1 paper studies supervised reasoning data and budget forcing, including interventions that prolong or stop generation.
Its findings depend on a particular trained model and data recipe; appending a word to an arbitrary model is not a faithful reproduction.
DeepSeek-R1 studies reinforcement learning and a multi-stage pipeline, with a distinct R1-Zero setting.
Do not collapse those systems into one pure-RL method or claim this exercise recreates their training.
Reasoning Models Don't Always Say What They Think tests whether models acknowledge experimentally supplied hints in their reasoning.
Its unfaithfulness findings concern tested models and hint conditions, not a proof that every reasoning trace is useless.

## Intervention protocol

1. Generate 24 fresh bounded arithmetic questions with exact rational or integer answers; freeze the generator seed.
2. Use eight questions for prompt development and 16 for the final comparison, with disjoint operand combinations.
3. Compare a short-answer condition, a reasoning-prompt condition, and four independent short-answer samples.
4. Set a shared total generation budget per question and record early stopping and truncated responses.
5. Parse answers with a strict documented rule and score malformed outputs separately.
6. Report oracle coverage and a feasible selector, such as majority agreement, as separate quantities.
7. Log every candidate length, latency, and answer, including incorrect long responses.
8. Inspect results by predeclared difficulty groups rather than concluding that longer outputs cause better answers.

Length is endogenous: harder questions may cause both longer generation and more mistakes.
A causal claim about extra compute needs a budget intervention, not a correlation between length and correctness.
If your model supports no explicit thinking delimiter, do not imitate the s1 mechanism by editing undocumented internal tokens.
Use ordinary documented generation caps and label the experiment as a budget comparison, not budget-forcing reproduction.

## Faithfulness extension and controls

For eight additional benign questions, supply a correct hint, an incorrect hint, or an irrelevant hint in matched templates.
Randomize assignment and compare both final answers and whether the response acknowledges using the hint.
Measure answer changes separately from verbal acknowledgement; neither alone reveals the entire internal mechanism.
Use generated questions so the experiment does not require publishing private chain-of-thought or sensitive data.
A model can fail to acknowledge a hint even when its final answer changes, but this alone does not prove deliberate deception.
Compare token budgets, temperature, and stopping rules consistently across hint conditions.
Keep hint trials separate from the primary performance comparison to avoid silently changing the task distribution.

## Bounded manual CPU/Colab exploration

Use a small documented local model; on CPU cap outputs at 64 tokens and sample four final questions first as a feasibility check.
For a Colab reasoning-model extension, use a compatible small distilled checkpoint only if its license and memory requirements fit.
A distilled checkpoint is not the original R1 training experiment, and its behavior need not match the full model.
Stop at 10,000 generated tokens or 20 minutes, record the incomplete design, and avoid paid services by default.
An exact arithmetic verifier can run on CPU without model training or an external judge.
Do not execute generated code; arithmetic answer parsing is sufficient for this exploration.
If the tiny model is at chance, report the limitation instead of interpreting a noisy scaling curve.

## Established findings and open hypotheses

**Established in cited experiments:** extra test-time compute can improve performance for selected systems, while trace faithfulness can remain incomplete.
**Open hypothesis:** allocating a fixed budget across samples outperforms one long generation for your chosen question distribution.
No finite toy run establishes a universal reasoning-scaling law or a model's human-like deliberative process.
The relevant output is a qualified comparison, not a claim that verbosity is reasoning.

## Research deliverable

Report accuracy, oracle coverage, selector performance, invalid-answer rate, generated tokens, and wall time separately.
Include a matched example where additional tokens hurt or fail to help; if none appears, state the sample size rather than inventing one.
Document which comparison was truly budget-matched and which was only approximately matched.
Continue to [verifiable rewards and RL limitations](../verifiable-rewards/module.mdx).
"""),
    dict(slug="verifiable-rewards", title="Verifiable rewards and the limits of RL reasoning claims", year=2025,
         prerequisites=["platinum-grpo-module", "advanced-reasoning-compute-module"], refs=["r1", "rl-limit", "rl-counterpoint"],
         description="Audit verifier validity, sampling efficiency, and competing claims about RL-induced reasoning capacity.", body=r"""
## Research question and objectives

A reward that is easy to compute is not necessarily a complete test of task success.
Reinforcement learning with verifiable rewards optimizes a measurable outcome; research must examine what that outcome omits.
Distinguish verifier correctness, policy optimization, answer correctness, reasoning validity, and generalization.
Read opposing empirical claims about reasoning capacity without turning either into a universal theorem.
The [GRPO lesson](../../platinum/grpo/module.mdx) supplies the optimization background; this module audits its interpretation.

## Notation and the verifier boundary

Let $y\sim\pi_\theta(\cdot\mid x)$ be a sampled completion and let $V(x,y)$ be a deterministic checker.
A simplified outcome-reward objective, omitting implementation-specific clipping and estimators, is

$$
J(\theta)=\mathbb{E}_{x,y}[V(x,y)]-\beta\,\mathbb{E}_x\!\left[D_{\mathrm{KL}}(\pi_\theta\Vert\pi_{\mathrm{ref}})\right].
$$

This objective encourages verifier acceptance, not automatically every property a researcher calls reasoning.
A final numeric match may reward lucky guesses or invalid derivations that reach the expected answer.
A code test suite may accept a special-case program that fails untested inputs.
Keep verifier acceptance $V$ distinct from an independently audited validity label $C$:

$$
\mathrm{false\ acceptance}=P(V=1\mid C=0),\qquad
\mathrm{false\ rejection}=P(V=0\mid C=1).
$$

Both rates depend on the distribution of candidate errors used to audit the checker.
A checker that rejects malformed strings perfectly can still fail on a mathematically wrong but well-formatted answer.

## Reading route and active disagreement

DeepSeek-R1 reports strong reasoning results using RL-based training and explicitly discusses reward reliability and domain limits.
The 2025 reasoning-capacity study compares base and RL-trained models at multiple sampling budgets.
It reports settings where improved pass@1 accompanies limited or reduced high-budget coverage.
The 2026 ICLR counterpoint revisits this question with intermediate-reasoning-sensitive evaluation, including CoT-Pass@K.
It reports evidence that RLVR can improve reasoning and extend measured boundaries in its tested settings.
These are competing empirical interpretations with different models, training conditions, and measurements.
Neither establishes that RL can never learn a new algorithm or that every answer-reward setup reliably learns valid reasoning.
Read methods and definitions before deciding whether the studies are measuring the same object.

## Intervention protocol

1. Build a tiny expression task with integers, explicit operator precedence, and exact rational arithmetic.
2. Write an independent reference evaluator and a candidate-answer checker; never use Python eval on untrusted text.
3. Assemble 40 candidate outputs including correct answers, wrong answers, malformed fractions, and equivalent valid forms.
4. Add benign adversarial cases: extra answer markers, whitespace, duplicated fields, and misleading prefixes.
5. Audit false acceptance and rejection against independently reviewed labels before optimizing any policy.
6. Compare a strict exact parser with a deliberately weak last-number parser and inspect accepted shortcuts.
7. Split the task generator by expression structure, not merely by random seed.
8. Freeze the stronger verifier and holdout split before conducting any optional policy experiment.

For an optional CPU demonstration, use a tabular softmax policy over a fixed small candidate set.
Perform at most 200 reward-weighted updates and track probability mass on valid, invalid, and parser-exploiting candidates.
This demonstrates selection pressure under verifier errors, not GRPO training of a language model.
Do not describe redistributing mass among fixed candidates as discovering new reasoning strategies.

## Sampling and coverage controls

If comparing real base and post-trained checkpoints, verify lineage and record prompt templates and token budgets.
For $n$ samples with $c$ correct completions, an established pass@k estimator for $k\le n$ is

$$
\widehat{\mathrm{pass@}k}=1-\frac{\binom{n-c}{k}}{\binom{n}{k}}.
$$

Use the convention that the numerator is zero when fewer than $k$ failures are available.
Report pass@1 and high-budget coverage separately; one can rise while another falls in finite experiments.
The estimator measures sampled answer success, not a formal boundary of all algorithms a model can represent.
Increasing $k$ also increases evaluation cost and opportunities to exploit a weak verifier.

## Bounded manual CPU/Colab exploration

The verifier audit and tabular-policy experiment require only Python, a seeded RNG, and small arrays.
Keep the candidate set below 100 entries and log all updates to make the shortcut visible.
An optional Colab comparison uses saved completions from two documented checkpoints, not a large RL training job.
Cap at 16 questions and eight completions per model; explain why that budget cannot settle high-pass@k literature claims.
No model training, paid API, or unsafe code execution is required for the core project.
If using external completion artifacts, record provenance and avoid selecting samples after seeing correctness.

## Established findings and open hypotheses

**Established:** outcome verifiers and finite sampling metrics measure different aspects of policy behavior.
**Established in cited experiments:** RLVR can improve measured performance; claims about capacity depend on operational definitions and settings.
**Open hypothesis:** your verifier remains reliable as the policy distribution shifts toward outputs it accepts.
Improving a benchmark score does not by itself demonstrate faithful reasoning or broad safety alignment.

## Research deliverable

Provide a verifier test suite, explicit acceptance grammar, observed failure cases, and a comparison of the papers' definitions.
State whether any result concerns sampling efficiency, support under finite sampling, intermediate validity, or generalization.
Continue to [robustness, safety, and leakage evaluation](../evaluation-robustness/module.mdx) to broaden the measurement boundary.
"""),
    dict(slug="evaluation-robustness", title="Model evaluation: robustness, safety, and leakage", year=2025,
         prerequisites=["advanced-reasoning-compute-module"], refs=["antileak", "faithfulness"],
         description="Design leakage-aware, threat-modelled evaluation with grouped uncertainty and transparent abstention accounting.", body=r"""
## Research question and objectives

A score is a property of a model, dataset, prompt, sampler, judge, and execution protocol together.
This module asks how fragile that score is under paraphrase, leakage, invalid scoring, and a declared threat model.
Design an evaluation that distinguishes capability, robustness, refusal behavior, and data exposure.
Learn why a recent dataset release or a private test file alone does not prove the absence of contamination.
An evaluation can be careful without claiming to certify a model as safe.

## Notation and grouped uncertainty

Let $g$ index independent task families and $r$ index matched surface variants within a family.
For a correctness indicator $c_{g,r}$, compare clean and transformed performance using paired differences.
A useful family-level robustness summary is

$$
R_g=\frac{1}{n_g}\sum_{r=1}^{n_g} c_{g,r},\qquad
\Delta_g=R_g^{\mathrm{transformed}}-R_g^{\mathrm{clean}}.
$$

Average and resample at the independent family level when variants share content or a generation template.
Treating many near-identical paraphrases as independent greatly overstates precision.
Record the denominator for every metric, including invalid outputs and abstentions.
For a system allowed to decline a question, report coverage and conditional accuracy separately:

$$
\mathrm{coverage}=\frac{N_{\mathrm{answered}}}{N},\qquad
\mathrm{accuracy}_{\mathrm{answered}}=\frac{N_{\mathrm{correct}}}{N_{\mathrm{answered}}}.
$$

Conditional accuracy is undefined when no items are answered; do not silently substitute a perfect score.
Also report correct answers divided by all items so abstention policy cannot disappear from the comparison.

## Primary readings and claim boundaries

AntiLeakBench constructs evaluations from updated real-world knowledge and explicitly addresses pre-existing knowledge in new material.
Its framework is evidence about a contamination-control approach, not a universal audit of hidden model training corpora.
Read how new knowledge is identified and which assumptions about model cutoffs the method relies on.
Reasoning Models Don't Always Say What They Think motivates checking behavior rather than trusting trace descriptions alone.
Its hint-based faithfulness tests are different from contamination detection, but both expose gaps between observable text and causal claims.
Do not infer model intent from an evaluation failure when a narrower explanation, such as a parser flaw, fits the evidence.

## Leakage taxonomy and intervention protocol

1. Freeze task generation, scoring, and model selection before opening final test responses.
2. Separate training overlap, development-set tuning, retrieval access, judge leakage, and test-answer exposure in your audit.
3. Generate 12 small task families from fresh seeds and inspect for exact and normalized near-duplicates.
4. Hold out entire structural families, not just alternate numbers from a template used during prompt tuning.
5. Create meaning-preserving paraphrases and irrelevant-context variants using a documented transformation rule.
6. Randomize item order and answer-option order while preserving a mapping back to canonical answers.
7. Run a fixed-budget baseline and a transformed condition with identical generation settings.
8. Review parser disagreements and preserve raw outputs before aggregating scores.

Fresh seeds reduce exact overlap with your development set; they do not prove the model never learned the underlying task.
A post-cutoff fact can still be accessible through retrieval or later training revisions.
Record model revision, retrieval/tool permissions, timestamps, and whether any provider updated the system during the run.
Keep answer keys inaccessible to retrieval tools and judges except where explicitly needed for scoring.

## Safety and privacy threat model

Use synthetic data only: plant a harmless fictional canary such as a randomly generated project code in a mock document.
Declare the attacker controls, the protected field, and what counts as exposure before testing a toy retrieval assistant.
Test whether benign instructions can cause the assistant to repeat a field it was instructed not to disclose.
Do not use real passwords, personal data, production systems, or harmful instructions.
Record both exposure and utility on permitted questions; a model that refuses everything is not a useful protected assistant.
For broader refusal behavior, use only appropriately licensed benign/unsafe-category metadata or approved evaluation resources.
Do not expand this bounded exercise into adaptive offensive testing against a live service.

## Controls and limits

- Include an answer-key-only checker test to establish that scoring is correct before involving a model.
- Reorder options to detect letter or position heuristics without changing semantic content.
- Evaluate benign requests near the refusal boundary to measure over-refusal separately from safety compliance.
- Audit judge agreement on a blind sample; an LLM judge is not automatically ground truth.
- Report all attempted variants and any exclusions, including failures caused by API or parsing errors.
- Keep hypothesis generation after test inspection clearly separate from confirmatory evidence.

An attack failure on 12 toy examples does not certify privacy or jailbreak resistance.
A canary exposure is a concrete failure under the stated setup, not proof of general extraction of training data.
A confidence interval quantifies sampling uncertainty, not hidden contamination or distribution-shift uncertainty.

## Bounded manual CPU/Colab exploration

Generate 12 families with two variants each and use a small local model or previously saved, provenance-labelled outputs.
Limit generation to 64 tokens per item and total model execution to 20 minutes.
Compute grouped summaries and inspect every invalid answer manually; no training is necessary.
A CPU-only scorer can fully audit duplicates, parsing, and grouped uncertainty even without running a language model.
Label that route an evaluation-pipeline audit, not evidence about an untested model's behavior.
Keep the fictional-canary extension to five mock documents and ten benign requests in an isolated local setup.

## Established findings and open hypotheses

**Established:** leakage controls, scoring validity, and task sampling are distinct requirements of credible evaluation.
**Open hypothesis:** your measured robustness gap persists across unseen families and a frozen model revision.
Passing this exploration provides no safety certification and no calibrated grade.

## Research deliverable

Write a compact evaluation card containing provenance, threat model, grouping unit, exclusions, and all metric denominators.
Show one concrete way an apparently improved score could arise without a better model.
Carry the audit into the [research reproduction capstone](../research-reproduction/module.mdx).
"""),
    dict(slug="research-reproduction", title="Research reproduction and falsification capstone", year=2025,
         prerequisites=["advanced-circuit-tracing-module", "advanced-representation-steering-module", "advanced-verifiable-rewards-module", "advanced-evaluation-robustness-module"], refs=["tracing", "s1", "rl-counterpoint"],
         description="Reproduce one narrow research claim with a frozen protocol, explicit deviations, and a falsification attempt.", body=r"""
## Research question and objectives

A reproduction is a chain of justified correspondences between a paper's claim and a runnable experiment.
It is not a similar-looking plot obtained from an unrelated model or task.
Choose one narrow result from circuit tracing, inference-time compute, or verifiable-reward evaluation.
Define what would count as agreement, disagreement, or an inconclusive reduced-scale adaptation before running the study.
The capstone rewards honest boundaries in the report, not a positive result or a benchmark rank.

## Select a claim with an operational target

For circuit tracing, target a prediction about an intervention's sign at a specified node on a specified prompt family.
For inference-time compute, target a budget-matched comparison with an explicit feasible answer-selection rule.
For RLVR, target a verifier or metric claim rather than attempting frontier-model training on a free accelerator.
Read both the primary method and the relevant limitations before selecting the claim.
Use the [circuit-tracing module](../circuit-tracing/module.mdx), [compute module](../reasoning-compute/module.mdx), or [RLVR module](../verifiable-rewards/module.mdx) as the prerequisite protocol.
The cited 2026 RLVR counterpoint is a reminder that changing a measurement can alter the apparent scientific conclusion.

## Notation and decision rule

Let $\delta$ be a paired effect on an explicitly named statistic, with $G$ independent task families.
For treatment and control family outcomes $s_g^T$ and $s_g^C$, estimate

$$
\hat\delta=\frac{1}{G}\sum_{g=1}^{G}(s_g^T-s_g^C).
$$

Choose a scientifically meaningful tolerance $\tau$ before observing final-test effects.
Report an interval for $\delta$ using a family-level method appropriate to your sample size and design.
Do not declare reproduction merely because a null-hypothesis test fails to reject zero.
If the paper claims a positive effect, a broad interval spanning substantial harm and benefit is inconclusive.
A teaching adaptation may test only the direction of a claim; label that weaker target explicitly.

## Protocol registration before execution

1. Record the paper version, target figure or claim, exact task, and the authors' stated assumptions.
2. Record code and model revisions, weight licenses, dependencies, hardware, precision, and random seeds.
3. Write a correspondence list: original component, local substitute, expected consequence of the substitution.
4. Freeze task-family splits, prompt construction, scoring, and the selection of intervention sites or budgets.
5. Define the primary statistic, tolerance, uncertainty method, exclusions, and maximum run budget.
6. Specify one negative control and one serious alternative explanation to test.
7. Save the protocol before looking at final outcomes; timestamp any later amendments separately.
8. Execute a small plumbing pilot on development examples, not the reserved final set.

Changing a failed parser after seeing test responses may be necessary, but it makes that round exploratory.
Keep the original outputs, document the change, and use fresh held-out examples for any confirmatory rerun.
Do not replace a paper's hard task with a convenient easy task while retaining the original performance claim.
Model size and training history are potential causal changes, not clerical details.

## Falsification attempt and controls

For a proposed circuit, test a counterfactual that changes the hypothesized variable while preserving distractors.
For a steering claim, change topic or paraphrase while retaining the intended behavior and intervention scale.
For a compute claim, compare at matched total tokens and include selector cost rather than oracle selection alone.
For an RLVR claim, independently validate the verifier and distinguish answer validity from intermediate reasoning validity.
Run the negative control with the same care and reporting detail as the preferred condition.
If an identity intervention changes outputs, stop the scientific interpretation until implementation correctness is restored.

A failed reproduction can reflect implementation error, task mismatch, or a genuine limit of the original claim.
These explanations require different evidence; listing them is not the same as discriminating among them.
Use a minimal diagnostic rerun to isolate one possibility rather than broad unregistered hyperparameter search.
Report unavailable proprietary weights or missing artifacts as blockers, not silently substituted reproductions.

## Bounded manual CPU/Colab exploration

Plan for two hours of human reading and setup, with at most 30 minutes of model execution.
CPU route: reproduce local linearization failure in a small ReLU graph or audit a verifiable expression checker.
Colab route: run one frozen small checkpoint on at most 24 prompt pairs with two intervention conditions.
Reserve half the compute budget for controls and a fresh diagnostic set rather than spending it all on the headline condition.
Set a hard output-token and disk-cache cap, and record wall time and peak memory if available.
No distributed training, premium API, giant dataset, or paper-level benchmark target is required.
If your budget cannot resolve the effect, return an uncertainty analysis and a next-experiment recommendation.
This is a reduced-scale research exploration unless the original setting and artifacts are actually reproduced.

## Interpreting disagreement

Compare qualitative direction, effect magnitude, and failure modes separately.
A tiny effect in the expected direction may still be practically inconsistent with a large claimed gain.
A faithful implementation with a smaller model can reveal a scaling dependence without disproving a frontier-model result.
A successful replication on one prompt does not establish broad generalization.
A negative result under a carefully matched condition is worth retaining even when it is inconvenient.
Never invent a benchmark number to make the report look complete.

## Established findings and open hypotheses

**Established:** the cited papers supply concrete claims, methods, and limitations that can be checked at different levels of fidelity.
**Open hypothesis:** the one you select survives your declared change of scale, task family, and evaluation budget.
Your report should distinguish direct observation, implementation inference, and speculative explanation in separate sentences.
Research status remains draft even if the manual exploration succeeds; no grading calibration is implied.

## Research deliverable and review checklist

Provide the frozen protocol, environment details, raw outputs or small permitted artifacts, and a script invocation that reruns the analysis.
Include a deviations log, negative-control result, failure inventory, and the strongest alternative explanation still consistent with the data.
Finish with one of three qualified conclusions: matched reproduction, informative reduced-scale adaptation, or inconclusive attempt.
Explain what single next experiment would most reduce uncertainty and what resources it would actually require.
There is no generated notebook, submission interface, leaderboard score, or pretend calibrated problem associated with this capstone.
"""),
]


def render(module, order):
    """Serialize simple YAML scalars with JSON quoting; leave math bodies intact."""
    metadata = {
        "id": "advanced-" + module["slug"] + "-module",
        "title": module["title"], "division": "advanced", "module": module["slug"],
        "kind": "research", "status": "draft", "year": module["year"],
        "prerequisites": module["prerequisites"], "problems": [],
        "description": module["description"], "order": order,
    }
    header = "---\n" + "\n".join(key + ": " + json.dumps(value, ensure_ascii=False) for key, value in metadata.items()) + "\n---\n"
    intro = "\n# " + module["title"] + "\n\n**Research exploration — not a calibrated problem.**\n\nResearch selection checked on **" + RESEARCHED + "**; this is a curated reading route, not an exhaustive or newest-paper claim.\n"
    citations = "\n## Primary references and verification\n\n"
    for key in module["refs"]:
        year, title, url = PAPERS[key]
        citations += "- [" + title + "](" + url + ") — " + str(year) + "; primary page/title checked " + RESEARCHED + ".\n"
    citations += "\nYears denote first preprint/publication, except the explicitly identified 2026 conference counterpoint. Live HTTP checks are available through `python3 tools/seed_research.py --verify-urls`; reachability does not validate a scientific claim.\n\nAll instructional prose and project designs here are independently authored; no paper results or benchmark measurements are fabricated.\n"
    result = header + intro + module["body"] + citations
    lines = len(result.splitlines())
    if not 80 <= lines <= 150:
        raise ValueError("{} has {} lines; expected 80–150".format(module["slug"], lines))
    return result


def normalized(text):
    text = html.unescape(re.sub(r"<[^>]+>", " ", text))
    return re.sub(r"[^a-z0-9]+", "", text.lower())


def verify_paper(item):
    key, (year, title, url) = item
    request = urllib.request.Request(url, headers={"User-Agent": "DLGuide-research-verification/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            text = response.read(3_000_000).decode("utf-8", errors="replace")
            status = response.status
            resolved = response.url
        matched = normalized(title) in normalized(text)
        success = status == 200 and matched
        detail = "HTTP {}; title {}; {}".format(status, "matched" if matched else "NOT MATCHED", resolved)
    except Exception as exc:
        success, detail = False, "{}: {}".format(type(exc).__name__, exc)
    return success, "{} ({}) — {} — {}".format(key, year, title, detail)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check generated modules without writing files")
    parser.add_argument("--verify-urls", action="store_true", help="Read-only HTTP GET and normalized primary-title checks")
    args = parser.parse_args()
    if args.verify_urls:
        with ThreadPoolExecutor(max_workers=6) as pool:
            results = list(pool.map(verify_paper, PAPERS.items()))
        for _, message in results:
            print(message)
        return 0 if all(ok for ok, _ in results) else 1
    failures = []
    for order, module in enumerate(MODULES, 1):
        path = ROOT / "content" / "advanced" / module["slug"] / "module.mdx"
        text = render(module, order)
        if args.check:
            if not path.is_file() or path.read_text(encoding="utf-8") != text:
                failures.append(str(path.relative_to(ROOT)))
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding="utf-8")
        print("{}: {} lines".format(path.relative_to(ROOT), len(text.splitlines())))
    if failures:
        print("Out-of-date research source: " + ", ".join(failures))
        return 1
    print("{} {} research modules; no problems or notebooks generated.".format("Checked" if args.check else "Seeded", len(MODULES)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
