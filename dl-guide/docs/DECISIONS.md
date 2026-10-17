# Step 0 decisions

Status: **clean rewrite selected; implementation not started in this step**.

## 1. Canonical reference

The supplied `https://github.com/cp-org/usaco-guide` returns repository not found (GitHub API HTTP 404). The current accessible reference is [cpinitiative/usaco-guide](https://github.com/cpinitiative/usaco-guide), inspected at commit `092bf547cf4f63140057b220dba2861f884e1905`. The supplied clone at `/tmp/dl-guide-upstream` remains unchanged. Findings are pinned to that revision, not promises about future upstream changes.

## 2. Rewrite instead of adapting the application

Choose an independently authored DL Guide fitted to the existing static portfolio application.

The rationale is **scope/architecture fit and licensing**, not that upstream technology is obsolete:

- Upstream is a modern Next.js 16 / React 19 / TypeScript 5.9 / Tailwind 4 / MDX 3 stack. Next.js itself is not inherently unsuitable for static websites.
- This particular application combines statically generated lessons with a SQLite content indexing pipeline, Next API routes, Firebase authentication/Firestore/functions, groups/classes, a contribution editor/GitHub OAuth, and Algolia-backed search. That service-heavy architecture makes sense for a collaborative educational platform but is unnecessary carrying cost for a small static portfolio guide.
- Existing portfolio `package.json` uses Vite 6, React 18, TypeScript, and React Router. Introducing a second Next runtime or transplanting upstream providers would increase deployment, maintenance, and integration complexity without establishing a product need.
- CC BY-NC-SA 4.0 and the absence of a separate permissive code license prevent treating this repository as freely reusable MIT/Apache application scaffolding. See [LICENSING.md](./LICENSING.md) for conditional noncommercial fork permissions and the project's stricter no-reuse choice.
- The isolated Node 22.23.3 experiment **successfully installed dependencies, indexed content, typechecked during Next build, and built production pages**. Peer/payload warnings were nonfatal. The rewrite is not justified by claiming upstream is broken. A dependency-resolution or registry-fetch failure in another environment would be an installation observation, not proof that upstream cannot build or is incompatible with Node 22. See [UPSTREAM_NOTES.md](./UPSTREAM_NOTES.md) for the actual commands and bounded conclusions.

A fork would only be reconsidered with a concrete need for upstream's collaboration platform, acceptable licensing/explicit permissions, service ownership, and a reproducible successful build/deployment plan. None is required for the present static portfolio scope.

## 3. Intended implementation boundaries, not implementation

- Integrate with the portfolio's existing static build/router rather than carrying a second server framework. Decide the precise route and component organization in the implementation phase.
- Write new data types, curriculum ordering, lesson prose, examples, and design. General section/chapter/lesson concepts are useful product ideas, but upstream's concrete ordering, code, and curation will not be reused.
- Start with a small independently authored content manifest and predictable stable lesson IDs. Build-time Markdown/MDX or typed content can be selected after evaluating the actual DL lesson requirements; no parser/plugin dependency was added in Step 0.
- Persist progress/preferences locally with a new namespaced/versioned schema. Include validation, storage-unavailable handling, and reset/export considerations. No upstream localStorage keys/data migrations, Firebase projects, account sync, or cloud functions will be adopted.
- Prefer local search over our own small dataset. No dependency on upstream Algolia records or credentials.
- Exclude accounts, class/group management, online contribution editor/OAuth, metadata-scraping API, service-backed judge, ads, and upstream analytics. Add remote services only if requirements later justify them and privacy/ownership are explicitly designed.
- Use original branding and presentation. A rewrite is not license laundering or a pixel-for-pixel clone.

## 4. Implementation decisions

- Keep the requested `dl-guide/` repository-shaped subtree inside the existing public portfolio repository. The guide is a separate Vite/React application under `site/`, built into the portfolio's `public/dl-guide/`; the portfolio uses a normal anchor link rather than routing through its authentication/analytics providers.
- Visual identity follows the portfolio at the user's request: white backgrounds, royal blue `#4169E1`, pixel headings, monospace interface text, serif reading prose, and dotted separators. A navy/blue dark mode preserves the same identity. The guide remains a standalone app, not a reimplementation of portfolio authentication.
- Hash routing makes problem and module links work on both GitHub Pages and the existing portfolio host without a server. `DL_GUIDE_BASE` controls the standalone build prefix. Portfolio deployment uses `/dl-guide/`.
- `site.config.json` is the single source of notebook hosting coordinates and guide backlinks. Runtime installs are pinned to a source commit containing bundled metadata. Generated notebooks and catalogs are committed; compiled site assets are not.
- Section 11 takes precedence: no `results_schema.json`, result uploads/imports, result checksums, anti-tampering logic, or promises of a secure judge. `progress.json` contains only manual learner statuses, annotations, and notes.
- The current machine is macOS without a CUDA/T4 runtime. CPU smoke fixtures verify pipeline wiring, not benchmark thresholds. All targets remain uncalibrated drafts until real hardware calibration is recorded. Missing GPU access is a verification limitation, not a reason to fabricate acceptance evidence or block useful static-site/toolchain work.
- GitHub Pages publishing is manually triggered so it does not silently replace a repository's existing Pages site. The regular portfolio build automatically includes the subsite.

## 5. Step 0 completion gate

Required artifacts are [UPSTREAM_NOTES.md](./UPSTREAM_NOTES.md), [LICENSING.md](./LICENSING.md), and this decision record. The inspection/install evidence and limitations must be written before implementation begins. Step 0 does not create routes, components, content datasets, dependencies, or app configuration, and does not change the upstream checkout. Any subsequent implementation must follow these boundaries.
