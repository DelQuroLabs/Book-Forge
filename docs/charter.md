# Ghost Writer — implementation charter
Updated 2026-09-24. Current phase: preview. Completion label: incomplete until verification.

## Accepted outcome
The user explicitly requests an actual fresh private browser app, including series planning and culturally relevant location-informed character names. Build a usable authoring studio with coherent RNG, shared series canon and volume arcs, character origin/culture/era fields, persisted manuscripts and revision history, server-side OpenAI integration, guided/autopilot drafting and exports. Prepare Docker/Coolify self-hosting for the user's management host coolify.delquro.com; do not deploy remotely without access and explicit action scope.

## Architecture and scope
React + TypeScript + Vite frontend; Node/Express + TypeScript backend; SQLite persistence; durable single-worker jobs; direct OpenAI server-side HTTP adapter. Single-author password protection for deployed use. Chromium desktop plus responsive narrow viewport are current verification targets; Firefox/WebKit remain unverified. Online-first; manual editing/local catalog RNG need the app server but not OpenAI. No service worker/offline guarantee.

This phase implements a complete usable foundation, not every research roadmap feature. Full developmental editing, deterministic LitRPG event ledger, EPUB/print production validation, expanded historical naming catalogs and audio are subsequent work. Billion-combination claim remains unverified and will not be advertised as achieved.

## Data and security
Persistent books, series, characters, revisions and jobs in an app data directory. API key only in server environment/Coolify secret. Live network deployment requires authentication and HTTPS. Local sandbox preview uses synthetic sample content, explicitly isolated demo mode and no key. Neither the repository's historical private-use settings nor the upload's unrelated mobile-agent intake are adopted as current requirements.

## Effects and budget
User authorized local app construction and public package downloads from the default npm registry at registry.npmjs.org, plus Playwright browser distribution for local tests. Use exact package versions and package-lock.json; inspect install hooks before enabling native build scripts. No chargeable API calls, hosting upgrades, account creation, Git pushes, DNS edits or external deployment in this turn. Live paid generation is user-triggered only after deployment configuration and explicit per-run request/output limits. This turn's paid API spend ceiling is zero.

## Acceptance
Create/reopen a coherent concept; cultural origin controls naming without assuming birthplace determines identity; create/edit multi-volume series and shared canon; create linked books; persist edits and restore versions; export manuscript; show honest no-key errors; durable job recovery and pause/cancel; server-side auth/origin checks for deployment. Browser test the production build and record actual results. Keep GhostForge unchanged.

## Deployment assumptions
coolify.delquro.com is treated as the user's Coolify management endpoint, not automatically the Ghost Writer application hostname. App hostname will be assigned in Coolify. Ship Dockerfile, healthcheck, persistent-volume instructions and safe environment template. Remote deployment is not performed.


## Current continuity upgrade

User requested public evaluation of AIWriteBook, BookyAI, Charter/Chapter, Designr/Designrr and BookNova, actual function improvements, long-book/series memory, and an independent GPT 6-sol audit prompt. Implemented source-linked chapter ledgers, bounded earlier-book/chapter retrieval, author pins, stale-source guards, voice/craft controls and explicit memory jobs. Research is bounded public observation, not paid product testing or complete reverse engineering. Real-model quality and advanced deterministic/semantic continuity remain unverified. Paid API spend ceiling remains zero.
