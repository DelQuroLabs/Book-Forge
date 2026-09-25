# Ghost Writer — verification and release boundaries

Recorded 2026-09-24 for app v0.1.0. **Phase: working local preview. Completion label: incomplete for remote deployment/live-model validation.** No production-readiness or literary-quality certification is asserted.

## Evidence actually obtained

| Gate | Observed result | Evidence |
|---|---|---|
| Frontend, server and test TypeScript | PASS | `artifacts/typecheck-results.txt` |
| ESLint | PASS, zero warnings/errors | `artifacts/lint-results.txt` |
| Production build | PASS; Vite + server TypeScript | `artifacts/build-results.txt` |
| Dependencies | npm audit reported 0 vulnerabilities | `artifacts/npm-audit.json` |
| Domain + worker | 48/48 passed; local synthetic HTTP provider only | `artifacts/unit-results.txt`, `tests/*.test.ts` |
| Browser/API | 23/23 passed against compiled production app and isolated databases | `artifacts/browser-results.json`, `tests/browser/` |
| Automated accessibility | Zero axe WCAG 2 A/AA and 2.1 AA violations on library, forge, series list and settings at desktop size | `artifacts/accessibility-results.json` |
| Responsive UI | 1440×1000 desktop and 390×844 mobile captures; no document horizontal overflow at mobile size; navigation/editor exercised | `artifacts/screenshots/`, `artifacts/visual-smoke.json` |
| Browser errors | No page/console errors in captured desktop navigation; no page errors in library test | `artifacts/visual-smoke.json`, browser tests |
| Consistent SQLite backup | Online backup reopened; integrity `ok`; 7 document, 2 revision, 0 session and 1 metadata rows match source | `artifacts/backup-results.json` |
| Reference preservation | GhostForge read-only reference checkout remains clean | `git status --short` at pinned reference checkout produced no output |

Tests run on Linux, Node 20.20.2, Chromium via Playwright 1.63.0. Production container target is Node 22; it has not been executed here. Build contains harmless upstream Zod Rollup comment-annotation warnings. Native SQLite dependency emits an upstream `prebuild-install` deprecation notice; the library remains locked and audit currently reports no known advisories.

## Tested flows

**Forge/domain:** deterministic replay, locks, schema-valid causal-field inclusion across 1,000 seeds in each of 10 genres, name ordering/diacritics/two-family-name conventions, explicit unsupported historical names, advisory location matching and ambiguous-location restraint, book/volume links. This is structural testing, not a proof of all semantic coherence or unique catalog cardinality.

**Writing worker:** sequential outline-to-two-chapter autopilot, shared canon/name context and previous prose in later requests, usage accounting, no-send budget guard, request caps preserving completed work, pause during an in-flight call, restart recovery without automatic spend, refusals, malformed JSON, visible 429 without automatic retries, ambiguous 500 retaining uncertain spend, prevention of duplicate completed single-step work, demo/missing-key readiness. Provider output is a clearly synthetic fixture; these tests do not measure prose quality, real API/model compatibility or provider billing.

**Browser authoring:** library search/filter; location-based profile suggestion; locks/replay; create book; honest disabled-AI dialog; add chapter; edit/save/reload; edit again; restore prior body; export filename. Create three-volume series, edit shared bible/culture/cast, map setup/payoff, save/reload, create linked manuscript and verify shared character/bible visibility. Mobile library/menu/forge/manuscript navigation and overflow checks.

**API integrity/security:** unauthenticated access denial, wrong password and wrong-origin rejection, login, secure/HttpOnly/SameSite cookie attributes, authenticated access, logout revocation, no password/key in settings/library exports, custom-header mutation protection, invalid revision inputs, no paid generation in demo, cross-kind delete/export rejection, atomic import rollback, volume uniqueness, shared-cast propagation/override protection, stale saves and prevention of deleting a series with manuscripts.

Authentication tests use a known synthetic password on a separate disposable server; it is not a deployment credential. No actual API key was received, stored or used.

## Not verified / remaining work

- **Coolify deployment:** blocked on access/action scope and app domain/secrets setup. `coolify.delquro.com` is only the identified management host. No DNS, repository push, deployment or host mutation was performed.
- **Container build/run:** not run; no Docker engine is installed. Dockerfile/Compose/healthcheck are prepared. Official base-image digest lookup is not execution evidence.
- **Live OpenAI generation:** not run; no key or paid-test budget authorized. Account model availability, request compatibility and current prices must be verified securely. Complete a bounded one-chapter test before a long run.
- **Long-form quality:** no real full-book, multi-book continuity or quantitative literary evaluation. No exact word-count promise. Very large context, low output budgets and reasoning-token use can prevent the desired length.
- **Accessibility:** automated partial coverage plus ordinary navigation is not a full screen-reader, keyboard, contrast-at-every-state or touch-target audit. No WCAG conformance claim.
- **Browsers/performance:** Chromium only; no Firefox/WebKit, low-end hardware, network throttling, Lighthouse performance budget, load test or long-duration worker soak.
- **Security/operations:** not an external penetration test; no multi-user security model, host threat assessment, high-availability test or deployed disaster recovery drill. SQLite is plaintext at rest. Production needs HTTPS, private proxy-to-app networking and backups. Do not use demo mode for private deployed content.
- **Import scale:** current JSON import limit is 4 MB and 100 books/100 series; complete database backup is the supported path for larger libraries/history.
- **Roadmap targets:** billion-combination certification, broad historical/cultural catalogs, deterministic LitRPG mechanics, automatic revision-aware fact dependency graph, DOCX/EPUB/print/audio remain unimplemented. Chapter-brief edits do not implement downstream dependency invalidation.
- **Uploaded build specification:** companion lint/package/compact files were not attached, so full specification-package parity/integrity checks are unavailable. The attached memory schema and local verification record were independently validated. No waiver or release-ready state is fabricated.

## Fixes made during verification

Repaired initial JSX/CSS build errors; upgraded audited Vite/esbuild dependencies; installed missing Chromium system libraries; fixed screenshot timing on mobile; tightened ambiguous-spend accounting, pause/checkpoint behavior, wrong-document-kind access/deletion, series link/cast integrity and transactional import validation; gave historical-series manuscript creation an explicit placeholder path rather than forcing an unresearched name; made shared character identities authoritative and read-only in book-local editing. Final test reports reflect the repaired source, not the initial failures.

## Delivery

`Ghost-Writer-App.zip` contains deployable source, lockfile, tests, Docker/Coolify instructions and selected verification evidence. It excludes installed dependencies, compiled output, live databases, secrets, browser traces and fetched competitor page corpora. Full source and current preview remain in `/home/user/ghost-writer`. The earlier research archive remains separate and unchanged.

## Naming expansion verification — catalog v2 (prior checkpoint)

Added 32 countries, 282 region entries, 474 city entries and 51 real-world profiles plus custom. Six additional unit tests validate every city-entry round trip, all profile references, display conventions, compatibility sets, ambiguous place names and unsupported regional traditions. Two additional browser tests verify India/China country-region-city selection without silent identity/location changes, expanded-state axe checks/mobile overflow, and Brazil regional character naming persisted through series save/reload. At that checkpoint, 24 unit/pipeline and 10 browser/API tests passed. TypeScript, lint and build were rerun; audit remains zero. Earlier backup and core security evidence is retained; this feature does not alter database schema, authentication, pricing or provider calls.

Evidence: `artifacts/naming-expansion.json`, new desktop/mobile naming screenshots, updated unit/browser reports and [catalog scope](NAMING-CATALOG.md). A W3C international-name design reference was reviewed; individual added name pools have not undergone professional cultural review. No universal cultural correctness or local population-frequency claim is made.

## Continent and major-country expansion — catalog v3

Current coverage: 45 countries, 387 regional entries, 754 city entries, 65 real-world profiles plus custom, and four Antarctic stations. Country filters offer at least three countries on each inhabited continent (transcontinental memberships overlap). USA: 51 state/DC entries, 187 cities; China: 33 regional entries, 75 cities; Russia: 36 regional entries, 65 cities. These are curated entries, not exhaustive localities or proof of every local naming tradition.

Two new unit cases verify continent coverage/major-country detail and Antarctic isolation. The full existing round-trip test now covers all 754 city entries. A new browser case exercises the continent filter, preservation of the currently selected place, US/China/Russia regional selections, a Tatar name suggestion, Pacific country availability, Antarctic station selection, expanded-state axe checks and mobile overflow. All 26 unit/pipeline tests and 11 browser/API tests passed against this build. Typecheck, lint, production build and npm audit passed. The preview was restarted with existing saved data; no paid calls or deployment occurred. New pools have not had professional per-name cultural review. See `artifacts/naming-expansion.json` and `artifacts/screenshots/naming-continents-*.png`.

## Series roadmap update

Added an optional schema-validated roadmap to series records, default planner view, whole-series direction, per-book timeline milestones, recurring-character start/end and volume beats, reorder controls with stable references, cross-book status counts and planning reminders. Older records render empty roadmap fields without migration. Deletion of referenced volumes/characters is guarded, and the API validates roadmap references. Linked manuscripts continue to receive revision bumps and continuity notices after series saves.

Three new unit cases cover legacy compatibility, invalid/duplicate roadmap references and immutable ID-based reordering/payoff-order warnings. Existing synthetic autopilot coverage now asserts roadmap/endgame/future-beat context inclusion. Two new browser/API cases verify persistence after reload, reordered milestone mapping, character beats, invalid requests, JSON backups, stale saves and linked-book invalidation. Current total: **29 unit/pipeline and 13 browser/API tests pass**. Typecheck, lint, production build and audit pass. The populated planner passed a partial axe A/AA check and mobile horizontal-overflow check. See `artifacts/series-roadmap-results.json`, the two roadmap screenshots, and [the guide](SERIES-PLANNING.md). No live-model or whole-series literary-quality claim is made; no paid calls or remote deployment occurred.


## Writing experience update

Added focus mode, explicit keyboard saving/search, cross-chapter literal/Unicode search with match selection, chapter navigation, editor text size/spacing and current-draft Markdown downloads. Optional per-book unencrypted localStorage recovery is off by default, uses separate writer IDs, preserves previous copies on failure and does not auto-restore or auto-save. Whole restore requires the current server revision and a clean editor; stale copies can be reviewed/downloaded or appended under new chapter IDs. Save/history responses merge newer typing instead of replacing it.

35 unit/pipeline and 20 browser/API tests passed. The seven new browser cases cover recovery, two-tab isolation, delayed/failed saves, quota failure, current-text download, pagehide, focus cleanup, keyboard trapping and desktop/mobile writing accessibility. An initial axe test found low-contrast existing editor labels; their colors/sizes were corrected. A keyboard test exposed collapsed-details controls in the dialog trap; explicit visibility filtering fixed it. The full final suite passes. No paid calls, reference changes or remote deployment. Details: `docs/WRITING-EXPERIENCE.md`, `artifacts/writing-results.json`.


## Source-linked story memory update

48 unit/pipeline and 23 browser/API tests passed on the updated build. Tests inspect actual synthetic-provider request payloads for chapter-one facts at chapter23, prior-volume facts in book4, source hashes/quoted evidence, state selection, future exclusion, immutable conflicts, stale pins, source edits during generation, memory-only checkpoints, UI save/reload, backup retention and mobile overflow. Desktop axe checks cover the new Story memory workbench. Synthetic fixtures demonstrate data flow, not real-model extraction or literary quality. See `artifacts/story-memory-results.json` and the new memory/research guides.

A pure-JS SHA-256 dependency, @noble/hashes 2.0.1, is locked. Hash caching avoids repeated scans of unchanged chapter objects. Frontend framework/schema chunks are split for caching; build succeeds without the new oversized-chunk warning. No load/long-saga performance certification is asserted.
