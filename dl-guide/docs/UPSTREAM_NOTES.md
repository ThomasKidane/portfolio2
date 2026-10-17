# Upstream due diligence — Step 0

Inspection date: 2026-10-17. Scope: repository architecture, content/progress model, services, workflows, licensing, and Node 22 dependency/build viability. No implementation, source transplant, or curriculum/content reuse.

## Reference and checkout identity

- Supplied URL: `https://github.com/cp-org/usaco-guide`; `gh api repos/cp-org/usaco-guide --jq '.full_name'` returned **HTTP 404 / Not Found**.
- Accessible upstream: [cpinitiative/usaco-guide](https://github.com/cpinitiative/usaco-guide). `gh api repos/cpinitiative/usaco-guide --jq '{full_name,html_url,default_branch}'` returned `cpinitiative/usaco-guide`, its canonical GitHub URL, and default branch `master`.
- Inspected commit: `092bf547cf4f63140057b220dba2861f884e1905`, verified with `git rev-parse HEAD` in `/tmp/dl-guide-upstream`; remote `origin` is `https://github.com/cpinitiative/usaco-guide.git`.
- A temporary isolated checkout, `/tmp/dl-guide-node22-check`, was created using `git clone --no-hardlinks /tmp/dl-guide-upstream /tmp/dl-guide-node22-check` solely for installing/building. Generated artifacts remain outside the portfolio and supplied upstream checkout.

## Current architecture (observed, not inferred from old docs)

Root `package.json` pins Next.js `16.3.6`, React/React DOM `19.1.0`, Yarn `4.9.2`; it declares TypeScript `^5.9.2`, Tailwind `^4`, MDX compiler `^3.1.0`, Firebase `^12.0.0`, `better-sqlite3 ^12.6.2`, Algolia, Storybook 10, and Chromatic. `.yarnrc.yml` selects `nodeLinker: node-modules`. Root lockfile is `yarn.lock`; the npm lockfile belongs to `src/functions`, not the root app.

This is a **modern stack**, not an obsolete Gatsby application. `docs/MIGRATION.md` describes its Gatsby-to-Next migration, but current source/config are the authority. Some historical documentation paths may be stale: `src/lib/constants.ts` places the database at `data/content.db` (not `/public/data/content.db`), with current indexing/cache behavior in the scripts and `src/lib/database.ts`.

The app uses Next's **Pages Router** (`src/pages`, `_app.tsx`, `_document.tsx`). Module/division/problem pages use `getStaticPaths`/`getStaticProps`; that does not make the entire app a server-free export. `next.config.ts` includes redirects, custom Webpack aliases/fallbacks, and server-side Firebase null-loading. No `output: 'export'` was found in that config. The build/start scripts use `next build --webpack` and `next start`.

Actual server capabilities include `src/pages/api/get-token.ts` (GitHub OAuth token exchange using `EDITOR_CLIENT_SECRET`), `src/pages/api/fetch-metadata.ts` plus judge-specific metadata parsers, and Firebase functions under `src/functions/src` for users, groups, submissions, claims, backups, contact forms, and problem suggestions. Do not carry any of this into a static portfolio without an explicit requirement and security/deployment design.

## Scripts and content pipeline

Exact root script definitions inspected in `package.json`:

- `dev`: `yarn tsx scripts/watch-content.ts`; `dev:watch`: `yarn dev`.
- `dev:no-watch`: `yarn tsx scripts/load-content.ts && next dev --webpack`.
- `prebuild`: `yarn clean && yarn tsx scripts/index-content.ts`.
- `build`: `next build --webpack && yarn tsx scripts/algolia-index.ts`.
- `start`: `next start`.
- `clean`: `rimraf dist .next data public/usaco-divisions.json public/problem-tags.json`.
- `check-ts-errors`: `tsc --noEmit`; `check-code-snippets`: `yarn tsx scripts/check-code-snippets.ts`.
- `lint` is declared as `next lint`; CI instead invokes the separate `eslint` script (`eslint --fix --ext .jsx --ext .js --ext .ts --ext .tsx --cache src`). A declared script is not proof it works with this Next version.
- Storybook, Chromatic, Prettier, and Firebase deployment scripts are also present. They were inspected, not all executed.

Yarn 4 does not imply automatic npm-style execution of arbitrary `prebuild` hooks; upstream CI explicitly invokes **`yarn prebuild` followed by `yarn build`**, and the experiment follows that sequence.

`scripts/index-content.ts` compiles/indexes module MDX under `content/` and solution MDX under `solutions/` into SQLite. It creates tables for compiled MDX, module/solution frontmatter, problems, per-module problem lists, problem slugs, and USACO IDs. It validates module IDs against ordering, deduplicates problems, produces `public/usaco-divisions.json` and `public/problem-tags.json`, and obtains last-updated timestamps from Git. It attempts to deepen shallow history; a shallow local source can still leave timestamps unavailable without preventing indexing. SQLite is a local/build-time content store here, not evidence of a remotely hosted SQL dependency.

`src/lib/parseMdxFile.ts` uses `gray-matter`, MDX compile, GFM/math/frontmatter/TOC/AST/image plugins, heading slugs, external-link handling, KaTeX, and snippet processing. `src/lib/database.ts` opens read-only connections for content queries and writable WAL-mode connections for indexing.

`scripts/load-content.ts` uses cached content when the database exists, otherwise indexes; it ensures generated public JSON exists. `scripts/watch-content.ts` performs initial indexing, starts `next dev --webpack`, watches content/solution MDX and problem JSON, serializes incremental updates with full-rebuild fallback, and serves an SSE reload channel on port 3001. Ordering changes are not among its filtered MDX/problem-JSON events, so do not assume all source edits trigger incremental indexing.

## Content schema and ordering

Inspected concrete examples `content/2_Bronze/Intro_Greedy.mdx` and its sibling `.problems.json`, plus `content/ordering.ts`, `src/types/content.ts`, and `src/models/problem.ts`. No example prose, records, or implementation are reproduced here.

- MDX frontmatter includes stable `id`, `title`, `author`, `contributors`, `description`, and `frequency`. The shared frontmatter type also permits prerequisites, redirects, incomplete/updated flags, division, width, and problem-specific metadata. Rendering permits custom JSX components, not just plain Markdown.
- `content/ordering.ts` explicitly defines **section → chapter → module ID** ordering, labels/descriptions, and derives module-to-section/URL/rank maps. It is not alphabetical filesystem ordering. The concrete curriculum arrangement will not be reused.
- Sibling `*.problems.json` files are JSON objects with a `MODULE_ID` and named list IDs (such as tutorial/general), whose values are arrays. Records include a stable `uniqueId`, name, external URL, source, difficulty, star flag, tags, and `solutionMetadata` (including internal/in-module variants and optional hints). `extraProblems.json` is handled specially by the indexer.
- Indexing cross-checks `MODULE_ID` against ordering and stores list membership independently from deduplicated problem records. MDX, ordering, and problem lists therefore form a coupled system rather than interchangeable content blobs.

## Progress and persistence

Inspected `src/context/UserDataContext/UserDataContext.tsx`, `properties/userProgress.ts`, `properties/hooks.ts`, `migration.ts`, and `src/context/FirebaseContext.tsx`.

- Guests store progress/preferences in localStorage under the versioned user-data key `guide:userData:v100`, with a separate theme key. Module/problem progress and activity history, plus resource progress, are tracked separately. These are source observations, not a recommendation to reuse their schema/keys.
- Mutation hooks provide separate localStorage and Firestore update representations. Unsigned users take the localStorage path; signed-in users update `users/{uid}` in Firestore. Auth state and Firestore snapshot listeners mirror signed-in data back to local storage. This is not merely a cloud-only progress feature.
- Firebase is initialized client-side with an upstream project configuration; auth, Firestore, and functions are real integrations. Emulator wiring exists but `shouldUseEmulator` is hard-coded false in the inspected provider. Merely running a copied app could contact upstream services; no such runtime browsing was performed.
- The new app will use independently written local persistence only unless a later requirement explicitly adds accounts/sync. No upstream service identifiers or user data should be reused.

## Services: present versus unsubstantiated

- **Firebase: present.** Client provider/auth/Firestore progress, callable/group features, functions source, `.firebaserc`, and `firebase.json` exist. Functions have a separate npm package/lockfile and declare Node `22`. `firebase.json` references Firestore rules; that reference alone does not establish deployed rules or permissions.
- **Algolia: present.** Actual search clients and module/problem/editor search interfaces exist. `scripts/algolia-index.ts` runs after Next build and can save/delete changed records when configured. It explicitly skips indexing if `ALGOLIA_APP_ID` is absent. No remote index writes are needed for the local build experiment; application search is nevertheless not established as offline/local search.
- **Analytics: present; not all requests are gated.** `_app.tsx` renders `GoogleAnalytics` only with `NEXT_PUBLIC_GA_MEASUREMENT_ID`. Separately, `useAnalyticsEffect.tsx` sends an upstream Firebase fallback increment when legacy `window.ga` is absent and an unconditional Firebase pageview increment; omitting the GA environment variable does not disable those source-level requests. A Google Analytics script in the Codeforces HTML parser sample is fixture content, not an additional app installation.
- **Sentry: not found** in inspected tracked source/config/manifests/lockfile searches. No Sentry dependency/config integration was discovered; do not claim it must be removed.
- **Ads: no active ad-network integration discovered.** Searches for ad-network markers found a historical removal of `guide:userData:adSettings` in migration code, not a current ad implementation. `Advertisement` is also a problem title. Third-party-services documentation mentions an organizational Google Ad Grant, which is not proof of ads on this app.
- **Netlify: mentioned, not established as current hosting.** `docs/Third Party Services.md` says Vercel hosting and that Netlify/self-hosting are possible, while warning the document may be outdated. No tracked Netlify configuration or adapter was discovered. Contributor/resource `netlify.app` links are external sites, not deployment evidence. Current deployed hosting was not independently audited.
- **Storybook/Chromatic: present** in dependencies, scripts, stories/config, and CI. These are useful upstream tooling, not required runtime services for the new guide.

Evidence searches used `rg -n` from the upstream checkout over `src`, `scripts`, `.github`, `package.json`, `next.config.ts`, docs and `yarn.lock`, plus `git ls-files` for tracked configuration/license filenames. Absence findings mean “not discovered in the inspected repository,” not a claim about deployed infrastructure or third-party injected scripts.

## Workflows inspected

`.github/workflows/build-tests.yml` installs with Yarn, explicitly runs `yarn prebuild`, `yarn build` with a 4 GiB heap, starts the Next server, checks links with Dart linkcheck, and runs bundlewatch. It specifies Node `20.x`.

`test.yml` specifies Node `20.x`, typechecks, runs ESLint, uploads to Chromatic, and has a separate build/Lighthouse job. `code-snippets.yml` installs compiler/toolchain dependencies, checks lesson snippets, and uses Node `20.x`. Python workflows validate MDX, problem JSON, tags, and solutions. Prettier has an autofix workflow; `update-usaco.yml` is an automation workflow.

`functions.yml` is separate: Node `22.x`, root `yarn` install plus `npm ci` in `src/functions`, then its lint and TypeScript build. This distinction matters: root Yarn install does not validate the entire functions deployment. No CI runs or service deployments were triggered during this inspection.

## Node 22 experiment: commands and evidence

System runtime before testing: `node --version` → `v26.7.0`; `npm --version` → `11.19.0`. Node 26 was not used as the evidence for Node 22 compatibility. `npx` supplied the requested LTS executable and pinned package manager without editing project manifests.

From `/tmp`, executed:

```sh
npx --yes --package=node@22 --package=@yarnpkg/cli-dist@4.9.2 --call 'node --version && yarn --version'
git clone --no-hardlinks /tmp/dl-guide-upstream /tmp/dl-guide-node22-check
```

Runtime probe succeeded: **Node `v22.23.3`, Yarn `4.9.2`**.

From `/tmp/dl-guide-node22-check`, executed:

```sh
npx --yes --package=node@22 --package=@yarnpkg/cli-dist@4.9.2 --call 'node --version && yarn --version && yarn install --immutable'
```

**Install succeeded (exit 0)** in approximately 46 seconds wall time (Yarn reported 42.577 s), including fetch/link steps and native-package build hooks. Yarn reported 1,594 packages / 843.18 MiB fetched. Warnings: React/React DOM 19 peer mismatches involving `@reach/router` and other dependencies; TypeScript 5.9.2 outside a requested `<5.9.0` range; missing root peers `monaco-editor` and `webpack`. Resolution completed against the committed lockfile; these warnings were not an install failure, nor proof of runtime failure.

The production-build experiment uses the upstream CI sequence, not `yarn build` alone:

```sh
npx --yes --package=node@22 --package=@yarnpkg/cli-dist@4.9.2 --call 'node --version && yarn prebuild && env -u ALGOLIA_APP_ID -u ALGOLIA_API_KEY NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=4096 yarn build'
```

Algolia variables are explicitly unset to avoid remote index publication, Next telemetry is disabled, and the heap limit matches upstream build CI. The explicit prebuild runs clean/indexing before Next compilation.

**Prebuild and production build both succeeded; combined command exit 0**, approximately 59.4 seconds wall time. Recorded output:

- `Starting content indexing...` followed by modules, solutions, problems, frontmatter, slugs, and generated JSON.
- `Repository is still shallow; skipping module timestamps.` The local source is shallow; indexing still completed, so this is a metadata limitation, not a failed content build.
- `=== Content Indexed Successfully ===`, `Took 6.308 seconds`, `Database size: 62599168 bytes`; generated tag vocabulary had 146 tags.
- `Next.js 16.3.6 (webpack)`, `Finished TypeScript in 6.0s`, `Compiled successfully in 7.7s`.
- `Generating static pages ... (2705/2705) in 14.5s`, then page optimization and build traces.
- Route summary includes static/SSG pages **and dynamic API routes**, confirming the mixed architecture rather than a wholly static export.
- `Algolia app ID not found - skipping indexing`, as intended.
- Nonfatal warnings: several page-data payloads exceeded the 128 kB warning threshold (including a 505 kB solution page and 421 kB user-solutions page). These are performance warnings, not compilation failures.

After install/build, `git diff --exit-code -- yarn.lock package.json` succeeded and the isolated checkout had no tracked-file changes. The local-history fetch emitted Git promisor/local-path warnings on later status checks; no upstream files were changed.

**Conclusion:** this pinned revision's root dependencies, content prebuild, TypeScript build phase, and production compilation/static generation are viable on the tested Node 22.23.3 environment. Do not report a dependency installation failure: none occurred in this experiment. A failed installation on another attempt/environment would still need its own evidence and must not be promoted into an untested assertion of build incompatibility.

**Not validated:** serving/browser interaction, login/cloud synchronization, external search operation, OAuth, Firebase function install/lint/build/deploy, standalone ESLint/snippet/Storybook/linkcheck/Lighthouse suites, deployed security rules, full-history timestamps, or deployment to any host. Build success is not end-to-end runtime/service validation.

## Licensing and decision

Root `LICENSE` and README identify CC BY-NC-SA 4.0; no separate permissive application-code license was discovered. The license page explicitly discusses layout/design/features and curriculum/content. A compliant noncommercial fork is conditionally allowed by the CC legal text, but that is not permissive open-source code licensing. See [LICENSING.md](./LICENSING.md) for conditions, page/legal-text tensions, and no-reuse boundaries.

Select a **clean, independently authored rewrite** fitted to the existing Vite/React portfolio, rather than bringing over this backend/service-heavy Next application. This is a scope/licensing decision, not an allegation that modern upstream technology is outdated or cannot work. See [DECISIONS.md](./DECISIONS.md).
