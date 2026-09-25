# Ghost Writer

A fresh, private author’s studio: coherent story seeds, series planning, culturally informed character names, manuscripts, chapter revisions, and bounded server-side GPT writing jobs.

**Version 0.1.0 — working local preview, not a production-release claim.** This is the app source, not just the earlier research proposal. The existing GhostForge reference was not modified or reused as an application base.

## Long-book and series memory

Open a book → **Story memory** to inspect earlier-chapter and prior-volume evidence, add source-quoted author pins, preview retrieval and set persistent voice/POV/tense directions. Authorized AI drafting creates memory alongside prose; existing prose can be indexed with an explicit, budgeted memory job. Source edits invalidate old ledgers; stale pins and contradictory immutable facts block generation for review. No paid extraction runs in demo mode.

This is bounded, source-linked retrieval—not unlimited or infallible AI recall. See [the memory guide](docs/STORY-MEMORY.md), [competitor evaluation](docs/COMPETITOR-REVIEW.md) and [independent GPT 6-sol audit prompt](docs/GPT-6-SOL-REVIEW-PROMPT.md).

## Better writing experience

Open any book → **Manuscript** for chapter navigation, **Find in book**, adjustable text size/spacing and **Focus mode**. Ctrl/Cmd+S saves; Ctrl/Cmd+Shift+F searches. The download arrow exports current text, even before saving.

**Device drafts** offers optional, unencrypted browser recovery, off by default. Copies are reviewed before restoring; stale copies cannot replace newer server revisions. Saves remain explicit, and typing during a save is preserved. See [the writing and recovery guide](docs/WRITING-EXPERIENCE.md).

## Series planning

Open **Series studio → Open series planner** for the new default **Series roadmap** tab. Plan the endgame, book milestones and character changes, then save and create linked manuscripts in **Volume arcs**. The roadmap is included in linked-book generation context. See [the series planning guide](docs/SERIES-PLANNING.md). This is author-edited planning, not automatic whole-series generation.

## Naming expansion

The **Browse countries & places** picker is available in Story forge, series shared settings, and character origin cards. Filter by continent, choose a country, region and city, then explicitly select an available naming background. Every inhabited-continent filter has at least three countries; Antarctica offers four research-station locations without inventing a naming culture. Existing identities and typed place overrides remain intact. See [the catalog and coverage notes](docs/NAMING-CATALOG.md).

## What works

- **Story forge:** seeded, replayable concepts across ten genres, including LitRPG. Premise, role, goal, opposition, stakes and rules come from connected genre foundations, rather than independently shuffled incompatible lists. Lock the title, protagonist or tone and reroll the rest.
- **Series studio:** a dedicated series roadmap with central conflict/endgame/theme/escalation, timeline milestones and character journeys across books, plus shared bible, recurring cast, reorderable volumes, book arcs, progression, ending/handoff notes and setups/payoffs. Create linked manuscripts from volume plans. Series edits update shared character identities and flag affected books for author review.
- **Naming:** 65 real-world starter profiles plus a custom palette, with 45 countries, 387 state/province/region entries and 754 city entries, origin/background/language/era fields, family/given-name conventions, diacritics and author overrides. Location can suggest a profile, but never determines someone’s identity automatically. The same setting can contain characters from different backgrounds. Unresearched historical suggestions stop rather than inventing authority.
- **Authoring:** focus mode, cross-chapter manuscript search, chapter navigation, adjustable reading typography, explicit race-safe saves, optional device-draft recovery, working-draft Markdown downloads, chapter cards, word counts, book bible, cast and chapter revision restoration.
- **Guided GPT workflow:** explicitly authorize an outline, a chapter draft, or a chapter review. Review findings quote existing text and require manual application.
- **Bounded autopilot:** outline when necessary, then draft blank chapters sequentially with series canon, prior volumes and previous chapters in context. Durable checkpoints, pause/cancel, conservative budget reservations, request/output caps, no automatic paid retries.
- **Private storage:** SQLite WAL, single-author password sessions, server-only API key, origin checks, conflict-safe saves, JSON library export/import, consistent full-database backup utility.

The included demo prose is hand-authored fixture content, **not evidence of model quality**. Demo mode refuses an OpenAI key and disables paid generation.

## Quick local preview — no API key or spend

Node 20.19+ is required; Node 22 is the intended container runtime. Native SQLite compilation may need Python 3, `make` and a C++ compiler if a matching prebuilt binary is unavailable.

```bash
npm ci --ignore-scripts
npm rebuild better-sqlite3 esbuild
npm run build
NODE_ENV=production DEMO_MODE=true PORT=3000 npm start
```

Open `http://localhost:3000` on your own machine. In Arena, use the surfaced **Ghost Writer** live preview instead. Do not expose demo mode as a private production studio: it intentionally has no login and contains synthetic examples.

For development:

```bash
DEMO_MODE=true npm run dev
```

### Try the complete no-key authoring path

1. Open **Story forge**. Choose LitRPG and a naming background, change the setting, then reroll/replay. Create a book.
2. Open **Series studio**. Create a series; fill its shared canon and recurring cast, volume arcs and payoff map. Save, then create a volume’s manuscript.
3. Add a chapter card, open it, write or paste prose, and press **Save**. Saves are manual; unsaved-change navigation guards are included.
4. Edit and save again. Open **Version history** and restore the earlier chapter.
5. Export a Markdown manuscript. In **Studio settings**, export/import the JSON library.
6. Open a generation dialog. Preview mode clearly explains why paid generation is disabled.

## Deploy to your Coolify instance

Your management host is **https://coolify.delquro.com**. It is not assumed to be the app hostname. Remote deployment has **not** been performed.

1. Put this source in your own private Git repository. In Coolify, create an application from that repository using the **Dockerfile** build pack; build context is the project root.
2. Assign an **HTTPS app domain** you control. Set the container port to **3000**. The server binds `0.0.0.0`; browser API calls use relative URLs.
3. Add persistent storage mounted at **`/app/data`**. This holds `ghost-writer.db` and SQLite WAL/SHM files. The container runs as UID/GID **1000** (`node`); ensure the mounted directory is writable by that account.
4. Configure the following runtime values in Coolify. Use its secret controls, not commits, screenshots or chat:

| Variable | Value / purpose |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATA_DIR` | `/app/data` |
| `DEMO_MODE` | `false` |
| `APP_PASSWORD` | Unique, randomly generated studio password; minimum 12 characters |
| `PUBLIC_ORIGIN` | Exact HTTPS app origin, e.g. `https://writer.your-domain.example`; no path/trailing slash |
| `OPENAI_API_KEY` | Your key, optional until enabling generation |
| `OPENAI_MODEL` | A model available to your account that supports Responses API strict structured outputs |
| `ENABLE_PAID_GENERATION` | Start with `false`; change to `true` only when ready to authorize paid runs |
| `OPENAI_INPUT_PRICE_PER_MILLION` | Current USD input price for that model; positive number |
| `OPENAI_OUTPUT_PRICE_PER_MILLION` | Current USD output price for that model; positive number |

5. Deploy one replica. Configure health checking at **`/api/health`**. Verify HTTPS, login/logout, save/reopen, export and the persistent mount **before** adding a key.
6. Confirm model access and current pricing independently. Set provider-side budget alerts/limits where available. Enable generation, inspect the run limits in the app, and authorize a small outline/chapter test before a book-length run.

A digest-pinned Node 22 Dockerfile, non-root runtime, healthcheck, `.env.example`, and optional `docker-compose.yml` are included. **Docker is unavailable in the build sandbox, so the image build and Coolify execution are unverified.** The base image manifest was resolved from the official Node Docker Hub repository; that is not a container execution test.

The optional Compose file binds its host port to loopback for use behind your own HTTPS reverse proxy. Coolify’s Dockerfile flow does not require Compose. Do not publish the backend port directly to the Internet: the app trusts one reverse-proxy hop for client IPs. Use a private internal network between Coolify’s proxy and the container. Do not run multiple app replicas against this SQLite worker.

## Cost and generation behavior

There is **no API call on startup**. A run requires a configured server key/model, explicit paid enablement, positive price configuration, and author confirmation. Per-run bounds are $0.10–$100, 1–50 provider requests and 1,000–12,000 output tokens per request.

The worker reserves a conservative input/output estimate before sending a request, then records reported usage. These are **estimates using your configured rates, not an enforceable provider billing cap**. Incorrect prices can make the estimate wrong. Timeout/network/ambiguous server failures retain uncertain spend; do not blindly retry. Pause/cancel cannot undo an already sent request or its cost. Output arriving after pause/cancel is not committed. Restarts pause unfinished runs rather than silently resuming paid work.

Autopilot is sequential per book, not autonomous generation of an entire series. It fills blank chapters and does not overwrite existing manuscript prose. It stops at request/budget limits and preserves completed chapters. Context is bounded; very large inputs are refused instead of being silently truncated. Word counts are targets, not guaranteed output lengths. Review generated facts, continuity, representation and rights yourself.

Prompts/manuscript context leave your server only when you authorize generation. Requests use `store:false`; this is **not a promise of zero provider retention**. Consult OpenAI’s current API data controls and your account settings.

## Data, backups and restoration

`DATA_DIR` defaults to `./data`. Do not put manuscript data inside ephemeral build output or a public web directory. Disk encryption and host access controls are your responsibility; this app does not encrypt its SQLite file at rest.

- **Markdown export:** current manuscript text, with explicit placeholders for undrafted chapters.
- **JSON library export:** current books and series only. No API key, password, sessions, jobs or chapter revision history. Import rejects existing/duplicate IDs, broken references and duplicate volume occupancy atomically. Import supports up to 100 books and 100 series and the current API body limit is **4 MB**. For larger libraries or complete history, use the database backup below.
- **Complete database backup:** includes chapters, revisions, jobs and hashed sessions. Treat as private. The backup utility uses SQLite’s online backup API, not an unsafe copy of only the live main file:

```bash
# Run inside the app container or the project with its runtime dependencies.
node scripts/backup.mjs /app/data/backups/studio-2026-09-24.db
```

Use a new filename each time; existing backups are never overwritten. Copy encrypted backups off the host and test restoration. For restoration, stop the app, preserve the entire old data directory, restore the backup as `ghost-writer.db` into a clean writable data directory, and restart with the same `DATA_DIR`. Do not mix restored databases with stale `-wal`/`-shm` files. Invalidate restored sessions if appropriate (`DELETE FROM sessions` through a trusted local SQLite tool). Paused jobs still require review before resume.

A full disaster-recovery exercise on your deployed host has not been performed. Keep both deployment secrets and independent backups outside the application volume.

## Verification

```bash
npm run typecheck   # frontend, backend and tests
npm run lint
npm test           # domain + local synthetic-provider pipeline tests, zero paid calls
npm run build
npm audit
```

Browser tests require `npx playwright install --with-deps chromium` and two isolated servers. In separate terminals (the password below is deliberately synthetic and must never be used for deployment):

```bash
NODE_ENV=production DEMO_MODE=true DATA_DIR=/tmp/gw-e2e-demo PORT=3001 npm start
NODE_ENV=production DEMO_MODE=false APP_PASSWORD=synthetic-auth-test-password PUBLIC_ORIGIN=https://studio.example.test DATA_DIR=/tmp/gw-e2e-auth PORT=3002 npm start
```

Then run `npm run test:e2e` and stop those test servers. Do not point tests at your real library. Tests create/update/delete synthetic documents. `node scripts/capture.mjs` captures an unmodified demo on port 3000.

**Latest local results:** 29 unit/pipeline tests and 13 browser/API tests passed; TypeScript, lint and production build passed; npm audit reported zero vulnerabilities. Automated axe checks found zero WCAG A/AA violations on four primary desktop views. This does not establish complete accessibility compliance. See [docs/QUALITY.md](docs/QUALITY.md) for exact coverage and unverified gates.

## Honest limits / next work

- Starter RNG catalog, **not a certified billion-combination catalog**. Tests check 1,000 seeds in each implemented genre; they do not prove universal narrative coherence or uniqueness.
- 65 real-world naming profiles plus a custom palette, not comprehensive naming/historical research. Location matching is advisory; custom names and background fields remain author-controlled.
- No deterministic LitRPG simulator/event ledger, automatic revision-aware fact extraction or guaranteed continuity repair. Prose/canon edits invalidate summaries/findings and raise author-review notices; chapter-brief edits are not a dependency-graph system.
- Markdown and JSON exports only today; DOCX, EPUB, print-ready layout and audio are not implemented.
- Single author, online-to-your-server, manual saves, no collaborative/offline editing. Series deletion is available via the protected API, not a UI control.
- No real OpenAI request, full-book literary benchmark, external penetration test, Firefox/WebKit validation, container build or remote deployment was performed.

## Source map

`src/` React UI · `shared/domain.ts` schemas/forge/naming · `server/store.ts` SQLite/revisions · `server/worker.ts` bounded generation · `server/index.ts` auth/API · `tests/` automated coverage · `docs/` charter/quality · `artifacts/` recorded evidence. Older research documents remain separately available as background, not runtime dependencies.
