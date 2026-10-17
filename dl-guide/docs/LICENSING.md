# Licensing and reuse boundaries — Step 0

Inspected 2026-10-17, upstream [cpinitiative/usaco-guide](https://github.com/cpinitiative/usaco-guide) at commit `092bf547cf4f63140057b220dba2861f884e1905`.

## Evidence and interpretation

- Root `LICENSE` contains **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**. `README.md` identifies the same license.
- No separate permissive software/code license was discovered among the tracked files. A public GitHub repository and dependencies with their own software licenses do not grant an MIT/Apache-style license to this repository's application code.
- `src/pages/license.tsx` explicitly claims coverage of the site's format, layout, design, features, content, topic structure/organization, module text, and problem/link lists. It gives more restrictive examples (including hosting content on another site) and asserts revocability. Those claims are recorded as upstream statements, not adopted here as a definitive statement of copyright law or as amendments to the CC legal text.
- The CC legal text grants reproduction, sharing, and adaptations for **noncommercial purposes**, subject to its conditions. A compliant noncommercial fork/adaptation is therefore conditionally permitted to the extent the licensor owns the relevant rights; it is inaccurate to say that all forks are prohibited or that any use always requires individual written permission.
- Sharing licensed material requires appropriate credit, preservation of supplied notices, a source/license link, and indication of changes. Sharing adapted material also requires the same license elements/version-or-later or a compatible license, without additional restrictive terms or effective technological measures. Commercial use requires separate permission unless a legal exception applies.
- CC BY-NC-SA is **not a permissive open-source software license**: the noncommercial restriction is incompatible with unrestricted commercial reuse. CC licenses are not a substitute for a clearly granted conventional software license and do not address software patent rights as a permissive software license might.
- The license's irrevocable grant while compliant should not be confused with the license page's broad revocation statement. The page and legal text present tension; do not resolve that ambiguity by assuming broader permission. Seek clarification from rights holders/legal counsel if reuse is ever proposed.
- A personal portfolio is not automatically noncommercial merely because visitors pay nothing. Recruiting, promotion, monetization, and other commercial-advantage contexts require care. This is a practical risk assessment, not legal advice.

Legal text: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode). Upstream license page source: [pinned revision](https://github.com/cpinitiative/usaco-guide/blob/092bf547cf4f63140057b220dba2861f884e1905/src/pages/license.tsx).

## Decision: no upstream source or content reuse

The portfolio DL Guide will be an independently authored rewrite, not a rehosted or modified USACO Guide fork. The upstream checkout was inspected for due diligence only. A second temporary checkout was used only for dependency/build experiments; neither checkout is to be vendored into the portfolio.

Do not copy or translate upstream application source, components, styles, distinctive layout/design, assets/logos, MDX lessons, solutions/snippets, problem datasets, curated resource lists, curriculum ordering, or exported/generated content databases. Do not carry over upstream service identifiers, search indexes, analytics IDs, OAuth configuration, or Firebase configuration. The notes describe observed mechanisms; they do not reproduce implementation or teaching content.

General functional ideas such as chapter navigation, searchable lessons, progress checkboxes, and locally saved preferences may inform independently implemented requirements. They are not permission to imitate protected expression, curated arrangements, or branding. Author a new DL curriculum, prose, examples, exercises, and visual design. Link to external resources rather than mirroring them, and independently assess third-party terms before incorporating anything.

## Future provenance checks

- Record authorship and external references for newly written learning material.
- Select and document the new project's code/content licensing separately; this document does not assign a license to the existing portfolio or future app.
- Audit direct/transitive library licenses and any third-party assets selected during implementation. Upstream's license does not replace those obligations.
- Any future upstream reuse requires a fresh license review and, where needed, explicit permission before it enters the portfolio. Attribution alone does not cure a noncommercial or ShareAlike violation.

Step 0 created documentation only. No upstream source or educational content was copied into these deliverables.
