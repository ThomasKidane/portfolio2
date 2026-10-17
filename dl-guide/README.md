# DL Guide

A static deep-learning curriculum: read a model's history, implement it in Google Colab, and track your own progress. Four divisions span foundations, the deep-learning core, attention and generative models, and frontier techniques.

**Development preview, not a calibrated judge.** Draft labels are intentional. Initial metric targets are hypotheses until measured with five reference runs on the declared hardware. See [the Phase 3 report](docs/PHASE3_REPORT.md) for verification status and remaining work.

## Learner workflow

1. Open a module, read the prerequisites, then choose a problem.
2. Follow **Open in Colab**. Select the declared runtime under **Runtime → Change runtime type**.
3. Edit the student cell, run the self-check, train within the budget, then run the grader.
4. Read the verdict in Colab. Manually set **Solving**, **Solved**, **Reviewing**, or **Skipped** on the site. Once attempted, you can reveal the editorial and reference solution.
5. Export `progress.json` to back up your browser's progress; import it on another browser. Optional notes and scores are personal annotations, not verified results.

The site never receives notebook code, predictions, checkpoints, or grading results. There are no accounts, result uploads, result files for import, or remote judging services. Colab evaluation is a transparent honor-system self-check: Python cannot hide a test set or prevent editing the grader. Browser progress may disappear when site data is cleared; export it regularly. Draft stubs intentionally cannot be solved yet.

## Development

From this directory, use Python 3.11 and Node 22 LTS (Python 3.9 is also supported by the tools):

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-dev.txt -e 'dlguide[vision]'
make notebooks PYTHON=.venv/bin/python
make validate PYTHON=.venv/bin/python
make test PYTHON=.venv/bin/python
make smoke PYTHON=.venv/bin/python
npm --prefix site ci
make site
```

Generated notebooks are committed under `notebooks/<division>/<problem-id>.ipynb`. Never hand-edit them. Metadata, starter code, tests, and reference implementations live under `content/`. Generation also bundles runtime metadata and creates the site's catalog. Smoke mode verifies supported implementations using small CPU fixtures; it does **not** validate real-data accuracy, GPU budgets, or draft implementations. Skipped stubs must remain visible in smoke output.

To work on the standalone UI, run `npm --prefix site run dev`. From the portfolio root, `npm run dev` builds and serves the guide at `/dl-guide/`; `npm run build` includes it in the existing portfolio deployment. The standalone guide does not load the portfolio's auth, analytics, or database clients.

## Fork configuration and deployment

Edit `site.config.json` (`org`, `repo`, `branch`, `runtime_ref`, `notebook_root`, `runtime_path`, `site_url`) and regenerate notebooks/catalog. `notebook_root` includes `dl-guide/` because this project lives in the portfolio repository. A fork that moves it to the repository root must update both roots. Pin `runtime_ref` to a commit or tag containing the runtime and bundled problem metadata; the notebook branch may advance independently.

The portfolio build uses `/dl-guide/`. The independent guide can be hosted anywhere by setting `DL_GUIDE_BASE` to its URL path at build time. Hash routing avoids server rewrites for module/problem links. The manually triggered **Deploy DL Guide to GitHub Pages** workflow publishes only this guide to this repository's Pages site; enable **Settings → Pages → GitHub Actions** first. It is deliberately not automatic to avoid overwriting an existing Pages deployment. The normal portfolio/Vercel deployment continues to include the guide as a subsite.

`site_url` defaults to the existing portfolio domain, `https://www.thomaskidane.com/dl-guide/`. A Pages deployment must instead set it to `https://thomaskidane.github.io/portfolio2/` and regenerate backlinks. Configuring a link does not provision a deployment.

## Calibration

`tools/calibrate.py` is for actual reference runs, not filling in plausible numbers. Use the declared GPU, fixed seeds, and documented dependency versions; do not publish an uncalibrated problem. Lower-is-better metrics require the opposite direction when constructing thresholds. CPU smoke results must never be promoted to T4 calibration. Dataset downloads and GPU/Colab verification require internet and the matching runtime.

## Architecture, attribution, and contributing

[Upstream inspection](docs/UPSTREAM_NOTES.md) · [Licensing](docs/LICENSING.md) · [Architecture decisions](docs/DECISIONS.md) · [Contributing](CONTRIBUTING.md)

Inspired by the division/module/progression model of [USACO Guide](https://usaco.guide/), maintained by the Competitive Programming Initiative. This is independently written; no upstream code, teaching content, assets, or competitive-programming problem sets are redistributed. This is not affiliated with or endorsed by USACO Guide, Google Colab, or the paper authors.
