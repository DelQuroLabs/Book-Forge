# Story memory: author and maintainer guide

## Use it now

Open a book → **Story memory**. Choose the chapter you intend to write. The right side previews evidence from earlier chapters and previous linked books only. The selected chapter’s own ledger is edited on the left; that ledger becomes history for later chapters.

### Without an API key

1. Select a written early chapter.
2. Expand **Add an author-verified fact**.
3. Give it a category, subject, specific key, value and an exact quote copied from that chapter.
4. **Add pinned fact**, then press the normal book **Save** button.
5. Select a later chapter (for example chapter 23). The pinned fact appears with its original book/chapter citation. Download the context preview if you want to inspect it.

Pins are dated evidence, not eternal state. If a character was alive in chapter 1 and dies in chapter 18, the old pin is still historical evidence; do not treat it as their present status. Prefer specific knowledge keys (“knows vault code”) and subject names; alias disambiguation is not automatic.

### With authorized server-side AI

Configure the model/key/prices securely and enable paid generation only with explicit authorization. Never paste credentials into chat.

- **Extract this chapter’s memory** reads the selected saved chapter, even if it already has current memory.
- **Build missing / stale memory** reads only written chapters in this book without current ledgers. Run this in earlier books too. It does not silently index the entire series.
- One provider request per selected chapter; your request/output/spend limits apply. Each completed ledger is checkpointed. If a bound stops a run, already built ledgers remain. Starting a fresh missing/stale run skips those current ledgers.
- AI drafting returns prose and continuity memory together, in one call. Memory shares the output allowance with prose; choose a sufficient output limit.
- The model is asked for a recap and up to 20 facts. Quotes absent from the new/saved prose are rejected. Exact quote matching proves presence, **not that the paraphrased fact is true or complete**.
- Memory extraction does not rewrite prose or acknowledge continuity notices. Review those notices yourself before more drafting.
- Existing pinned facts must be reviewed/unpinned before replacing their source chapter with an AI draft. Unchanged-source re-extraction retains pins.

The keyless preview disables paid extraction honestly; it does not synthesize a fake memory result.

## When text changes

Memory is bound to a SHA-256 fingerprint of chapter title and body. An edit or restored version makes a mismatched ledger stale automatically. Stale facts and recaps do not enter the writing packet; current raw prose can still be retrieved.

Stale pins block generation. Review/unpin them, then rebuild memory, or explicitly replace the stale ledger manually and add verified facts again. Replacing a stale ledger asks for confirmation and leaves prose untouched. It removes old ledger entries/pins, not manuscript history.

Earlier-volume prose/canon changes, AI drafting/planning and deletion mark later linked books for review. Reading order is the series’ stable-ID volume order. In-flight results are rejected when their dependent books/series change. These are conservative warnings/guards, not automatic repairs of downstream prose.

## How context is assembled

`shared/story-memory.ts` builds a deterministic packet shared by the UI and worker:

- all earlier linked volumes, plus chapters before the target in the current book;
- source-current facts and author pins;
- most recent changing-state entries for each normalized category/subject/key (earlier pins remain dated);
- conflicting identity/world-rule values surfaced for author review, blocking generation;
- up to ten ranked, source-offset raw excerpts selected using title/brief keywords;
- selected chapter recaps and the last 3,000 characters of the actual previous written ending;
- explicit diagnostics for missing/stale ledgers, rejected entries, superseded states and omitted active facts/recaps.

Default memory budget is **48,000 UTF-16 characters**, not tokens. Mandatory pins/ending cannot be silently removed to fit. Other evidence is selected within the budget. All eligible earlier prose remains stored, but not all of it is transmitted. Full author canon, cast, prior bibles, series roadmap and future-beat planning are additional context. The worker still rejects an overall prompt over 160,000 characters and reserves budget before sending.

Future chapters/volumes are excluded from past-event retrieval. Author plans can still be included separately with explicit future/off-limits instructions. This is not a mathematically guaranteed spoiler filter.

## Voice and craft

Save POV, tense, voice direction, phrases/habits to avoid and an optional owned/licensed sample. These are author instructions in generation/review context; no model fine-tuning occurs. A button can explicitly copy the previous volume’s style, replacing current style only after confirmation.

Local craft checks find case/spacing-normalized repeated paragraphs of at least 20 words and matching first eight opening words. They are transparent warnings, not plagiarism detection, semantic repetition detection or a quality score. AI drafts receive these findings after generation; there is no automatic paid rewrite loop.

## Compatibility and limitations

- Optional chapter/book fields preserve older records without a database migration. New records retain memory in SQLite and JSON library backups. Old app versions may strip fields they do not know: keep the updated source and take a full backup before downgrading.
- Browser recovery includes the new fields under its existing size/privacy limits. Local copies remain unencrypted and optional.
- Keyword retrieval misses synonyms, implication and unrecorded details. There is no embedding index, entity resolver, knowledge graph reasoner, deterministic resource arithmetic, flashback-time engine or whole-series semantic auditor.
- Read order is not always narrative chronology. Reordering volumes can deliberately change which state is considered latest; review afterward.
- A summary is model-written compression, not a lossless fact store. Empty or short extraction output can omit important facts. Pin high-value facts after review.
- Existing bounds: up to 20 series volumes, 100 stored chapters/book, 40 generated-outline chapters, 100k characters/chapter, 40 stored facts/chapter, and the existing 4 MB JSON import limit. Larger restoration needs the SQLite backup process.
- The preview has passed synthetic data-flow and browser tests, not a paid real-model literary benchmark. Do not describe this as unlimited or infallible memory.

See `docs/COMPETITOR-REVIEW.md`, `tests/story-memory.test.ts`, `tests/pipeline.test.ts`, `tests/browser/story-memory.spec.ts` and `artifacts/story-memory-results.json`.
