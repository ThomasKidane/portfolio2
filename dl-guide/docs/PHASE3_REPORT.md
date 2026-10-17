# Phase 3 report

Date: 2026-10-17. This report distinguishes implemented code, local CPU checks, and acceptance criteria that still require real Colab/T4 runs.

## Acceptance status

**Phase 3 is not certified complete.** This macOS environment has no CUDA/T4 runtime or authenticated Colab execution session. LeNet-5 and ResNet cannot honestly be claimed to meet the requested real-dataset metric/time targets here. Targets remain `calibrated: false` and problems remain `status: draft`; a working static page or CPU fixture does not change that.

The intended vertical slice IDs are `bronze-lenet5`, `silver-resnet`, and `gold-transformer`. Their source metadata, starter/reference implementations, unit checks, module/editorial pages, and generated notebooks are developed alongside the runtime. Exact local verification results will be recorded below after integration.

## Changes from upstream

- Independently authored Vite/React static subsite instead of copying the successfully building modern Next.js upstream. No upstream source, educational content, assets, or service configuration is reused. See the licensing and architecture records.
- No Firebase, accounts, Algolia, Sentry, ads, service-backed code runner, or backend in the guide. Browser-only search and manual local progress replace cloud integrations.
- Colab-link-only override applied throughout: the guide never consumes result JSON/zip files or learner code. The notebook prints a self-check verdict and a backlink; the learner sets progress manually. No anti-tampering claims or hashes.
- A versioned manual progress export/import is a browser backup, not grading evidence. Editorial/reference reveal is an honor-system convenience, not secure access control.
- The guide is built as its own static app and copied into the existing portfolio deployment at `/dl-guide/`. A separate manual GitHub Pages workflow is supplied.

## Verification record

Local integration checks completed so far:

- 69 runtime, toolchain, and text-loader CPU tests pass with the complete notebook test environment; 70 authored curriculum/reference tests pass separately.
- Full 54-notebook smoke: nine implemented references execute end to end on explicitly labeled CPU fixtures, each under 60 seconds; 45 unimplemented drafts are explicitly skipped; zero execution failures and zero benchmark passes claimed. Strict completeness correctly exits nonzero.
- Genuine TinyShakespeare and text8 downloads and verified cache reloads were exercised; 33 offline text-loader tests cover split integrity and cache behavior.
- Site typecheck and 19 site/catalog tests pass. All 112 MDX documents compile and render. The seeder now escapes comparison operators to avoid invalid MDX.
- All 54 starter-only notebooks are generated with immutable runtime ref `24d60a86199b4b53ca417b2a1cf291932adfcb9a`; notebook/schema/path validation passes with zero errors.
- The root portfolio production build succeeded with the guide copied into `public/dl-guide/`.
- Browser checks confirmed problem rendering, manual status changes, editorial unlocking, and no horizontal overflow at 390px. The portfolio-matched white/royal-blue theme with locally bundled pixel/monospace fonts was verified visually on desktop/mobile.

These are not claims that GPU, Colab, remote deployment, or benchmark accuracy has been tested. The catalog has 54 problems, 54 individual model modules, and four contest modules. Initial notebook runtime pinning and generation are complete; later runtime changes require a fresh commit pin and regeneration.

A strict `npx tsc --build` on the existing portfolio found pre-existing errors in unrelated blog, auth, Figgie, and contact files (including missing `react-katex`/Vite raw SVG declarations and unchecked-index errors). No new diagnostics were reported in the portfolio integration component. These unrelated problems are not silently repaired as part of DL Guide; the standalone guide has its own typecheck and tests.

## Remaining acceptance work

1. Execute each slice notebook in a fresh Colab T4 session with reference code pasted into the student cell; record actual dataset, metrics, total time, memory, and dependencies.
2. Run five real reference seeds on declared hardware, inspect variance and feasibility, and use the calibration tool to write provenance/thresholds. Only then publish the corresponding problems.
3. Verify untouched starters produce actionable FAIL verdicts in Colab. Local smoke checks are useful but not a substitute for the hosted environment.
4. Complete unsupported dataset/metric adapters and draft reference implementations before claiming full-catalog executable coverage. Draft scaffolding is not a solved exercise.
5. Verify GitHub Colab badges against the pushed public branch and verify the deployed static subsite. Pages publishing requires repository Pages configuration and is not enabled implicitly.

## Continuation policy

Continue with catalog drafts and CI/documentation without inventing GPU evidence. No user decision is needed to retain honest draft labels. GPU calibration and any expansion that requires unavailable datasets or services remain explicitly open. CPU smoke must report unsupported/stub skips rather than present them as successful full notebook runs.
