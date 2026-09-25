# Book-Forge / Ghost Writer — development handoff

The owner intends to work in `github.com/DelQuroLabs/Book-Forge`. The implemented app is still named Ghost Writer. Preserve existing features and data; do not replace the project with a new scaffold.

## Latest product priority

**Write stories well and cohesively, not merely remember facts.** Build toward a unified Story Blueprint joining series arcs, book structure, causal chapter/scene goals and source-linked memory. Read `docs/STORY-BLUEPRINT.md` and its example. Their advanced scene structure is a proposed extension, NOT already implemented functionality and NOT an app import format.

The current app already has chapter briefs, series planning, a book bible, source-hashed memory, pins, retrieval, voice controls, drafting/review, explicit saves and optional device recovery. Inspect the code and the implemented/proposed table before making claims.

## Start here

- `GITHUB-SETUP.md`, `README.md`, `docs/charter.md`
- `docs/STORY-BLUEPRINT.md`, `docs/STORY-MEMORY.md`, `docs/SERIES-PLANNING.md`
- `docs/COMPETITOR-REVIEW.md`, `docs/GPT-6-SOL-REVIEW-PROMPT.md`
- `docs/QUALITY.md`, `artifacts/memory.json`, tests and verification artifacts

## Non-negotiable boundaries

- Preserve manuscripts, stable chapter/volume IDs, version history, explicit saves, budgets, source citations and backward-compatible backups.
- Plans are future intentions, NOT established memory. Extract memory from accepted prose and invalidate it after source changes.
- Existing quote tests prove source presence, not semantic truth. Existing synthetic generation tests prove data flow, not excellent prose.
- LitRPG and coherent cross-book character/world/resource progression are priorities. Geography must not determine character identity.
- No paid provider calls, account purchases, remote deployment, DNS edits, Git pushes or destructive migrations without appropriate authorization. Initial API spend ceiling is zero.
- Never request credentials in chat or commit secrets/private books. Run tests in isolated data directories. Do not copy third-party proprietary code, assets or novel corpora.
- Keep GhostForge read-only if that separate reference is available; it is intentionally not in this repository package.
- `coolify.delquro.com` is a management endpoint, not an app origin. Do not expose demo mode as a private deployed service.
- Run relevant tests and report failures honestly. Do not weaken tests to manufacture a pass. Preserve a rollback path for schema changes.

The GitHub-ready ZIP was packaged from the existing implementation plus handoff docs; no new scene-planning UI or real-model quality validation was added during packaging.
