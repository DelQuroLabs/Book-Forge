# Start working in DelQuroLabs/Book-Forge

Repository destination supplied by the author: **https://github.com/DelQuroLabs/Book-Forge**.

This package contains the current **Ghost Writer** application. “Book-Forge” is the repository destination; the app has not been silently renamed or rewritten. No remote repository was read, created, pushed to or deployed as part of this handoff.

## Upload the project, not just the ZIP

GitHub does **not** extract a ZIP uploaded as an ordinary repository file. To get editable source files:

1. Download `Book-Forge-GitHub-Ready.zip` and extract it into a new empty folder on your computer.
2. Open the repository. If it already has work, preserve it and use a new branch; do not overwrite or force-push blindly.
3. Choose **Add file → Upload files** and upload the extracted files/folders, then commit them. Ensure hidden files are included (`.gitignore`, `.dockerignore`, `.env.example`). If your browser/file picker misses dotfiles or struggles with nested uploads, use GitHub Desktop to copy the extracted contents into a local clone and commit/push them.
4. Confirm these are at the **repository root**, not inside an extra `ghost-writer/` or `Book-Forge/` directory:

```text
README.md
GITHUB-SETUP.md
AGENTS.md
package.json
package-lock.json
Dockerfile
src/
server/
shared/
tests/
docs/
```

Keep a private repository if you do not intend to publish the source. No open-source license has been chosen for you. A ZIP attachment in a GitHub release is useful for distribution but is not a substitute for committing the source tree.

## What is and is not included

Included: frontend/backend/shared source, lockfile, Docker/Coolify configuration, tests, existing verification reports/screenshots, competitor review, source-linked memory guide, GPT 6-sol review prompt, and the new Story Blueprint design/example.

Excluded: `.git` metadata, real environment files, API keys, private databases/manuscripts, browser recovery copies, installed dependencies, compiled builds, caches, test-run scratch directories and competitor book corpora. Only the placeholder `.env.example` is included. Known synthetic authentication credentials in the tests are fixtures, not deployment credentials.

**This is a code handoff, not a backup of your personal library.** Your saved books remain in the original workspace. To move them, use Studio settings’ JSON library export/import for supported-size libraries, or the consistent SQLite backup process in README/scripts. Keep those private backups out of GitHub. Browser-local unsaved recovery copies do not travel with a source ZIP.

## Run a local, no-key preview

Use Node 22 (minimum supported Node is 20.19). On macOS/Linux or a Linux development container:

```bash
npm ci --ignore-scripts
npm rebuild better-sqlite3 esbuild
npm run build
NODE_ENV=production DEMO_MODE=true PORT=3000 npm start
```

On Windows PowerShell, use the same install/build commands and then:

```powershell
$env:NODE_ENV="production"
$env:DEMO_MODE="true"
$env:PORT="3000"
npm start
```

Open `http://localhost:3000`. Demo mode intentionally has no login, uses synthetic starter content and disables paid generation. Do not expose it publicly with private manuscripts. `.env.example` is a reference, not an automatically loaded secret file; set environment variables explicitly or use your hosting platform’s secret controls.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The included prior continuity build passed **48 unit/pipeline tests and 23 browser/API tests**. This handoff changes documentation, repository metadata and ignore rules only; those historical results are not a newly run GitHub CI result.

For browser tests, install Chromium:

```bash
npx playwright install --with-deps chromium
```

Start these two **disposable** servers in separate terminals (macOS/Linux examples). Do not use your real data directory:

```bash
NODE_ENV=production DEMO_MODE=true DATA_DIR=.cache/e2e-demo PORT=3001 npm start
```

```bash
NODE_ENV=production DEMO_MODE=false APP_PASSWORD=synthetic-auth-test-password PUBLIC_ORIGIN=https://studio.example.test DATA_DIR=.cache/e2e-auth PORT=3002 npm start
```

Then run `npm run test:e2e` in another terminal. The password above is a public test fixture only. Browser fixtures modify their isolated libraries. Stop the servers afterward. No GitHub Actions workflow is enabled by this package, so uploading it does not itself schedule potentially billable hosted CI.

## Continue development

1. Read `docs/STORY-BLUEPRINT.md` for the planned unified outline/scene/memory model and its implemented-versus-proposed table.
2. Read `docs/STORY-MEMORY.md` and inspect the actual worker/retrieval code before changing it.
3. Give the next agent repository access and `docs/GPT-6-SOL-REVIEW-PROMPT.md`, plus the added priority in `AGENTS.md`.
4. Make small branches with regression tests; keep plans distinct from facts established in prose.
5. Do not claim excellent books based only on synthetic prompt tests. Real-model quality needs an authorized budget, original test material and human editorial evaluation.

## Deployment

See README and `.env.example`. `coolify.delquro.com` is the management host, not the assumed app domain. Deployment still needs the actual app origin, secure server-side configuration, one worker replica, persistent storage and explicit authorization. No deployment or paid model call was performed for this handoff.
