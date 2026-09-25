# Ghost Writer: competitor review and continuity upgrade

**Review date: September 25, 2026.** Scope: public product pages, selected operational help articles, linked feature documentation and a short public novel opening. No purchase, account creation, private dashboard access, proprietary code inspection, or paid generation. This is a substantive but bounded review, **not a claim to have read every page or reverse-engineered the products**. Product performance and sales claims are not independently verified.

## Executive conclusion

The useful common pattern is **plan → persist story state → assemble relevant context → draft → inspect → revise**, not a magic prompt or unlimited model memory. Persistent storage and model context are different things: storing every chapter does not mean a model receives or reliably attends to every detail.

Ghost Writer now has an implemented first version of that memory loop. It can carry a sourced chapter-one fact into a chapter-23 request and a book-one fact into book four, with tests proving the transmitted context. It does **not** yet have proof of market-leading prose, semantic perfection, or complete recall of every unpinned detail.

### Address discrepancies

- `https://go.charter.pub/` did not load through the research tool. Search surfaced **Chapter**, at `chapter.pub` / `go.chapter.pub`. Chapter is reviewed below as a **possible intended match**, not a confirmed redirect or the same domain.
- `https://go1.designr.io/` did not load. **Designrr**, at `https://go1.designrr.io/` with two r’s, loaded. It is a **possible intended match**, not a silently corrected identity.

If these were different products, their evaluation remains open until the correct accessible addresses are supplied.

## 1. AIWriteBook — useful operational detail behind the broad promises

### Documented workflow

Its chapter-generator guide describes a wizard that establishes basics, details, cast and outline before chapter drafting. Outline cards include plot events, hooks, interactions, places and per-chapter target length. The author can supply a writing sample and extra instructions, choose a model and refine the chapter in place. This is more specific than the generic promise of “full context.” [Chapter generator](https://aiwritebook.com/en/features/chapter-generator/)

The dedicated series guide describes reading previous books separately, extracting character state, chapter-level plot and style, then merging in reading order. More recent character state takes precedence; deaths and departures are marked. Older plots are compressed; the most recent book keeps chapter-level detail. **The documented input limit is five previous books**, with guidance to choose the last five for longer series. That is a material qualification to broad “whole saga” marketing: extraction/compression necessarily selects information. [Series guide, both chunks reviewed](https://aiwritebook.com/en/ai-book-series-generator/)

The Book Editor describes three distinct passes: developmental review, line editing and proofreading. Its review produces an editorial letter, chapter-purpose/pacing map and reusable style sheet. Suggestions are anchored to passages and split into objective versus optional changes or confidence bands. The author accepts/rejects changes; the uploaded original stays available. [Book Editor, functional sections reviewed](https://aiwritebook.com/en/ai-book-editor/)

### Evaluation and application

**Bring over:** ordered state merging, explicit deaths/departures, source-aware history, persistent author voice, and evidence-linked editorial findings. **Do not imitate:** equating compression with lossless memory or claiming a source quote proves an AI interpretation.

**Implemented now:** chronological retrieval, dated facts with citations, changing-state selection, source hashes, author-reviewed pins, book-level voice/POV/tense/sample controls and history-aware chapter review. Full editorial letters, confidence-calibrated multi-pass editing and accept/reject diffs remain a next phase.

## 2. BookyAI — the most actionable public continuity support notes

The public site presents a desktop publishing pipeline: topic/research, outline, manuscript, editing, covers, assembly and export. Its expanded page documents a shared series Codex, chapter recaps/end beats, unresolved threads, volume milestones, POV, timeline and shared style. Those remain vendor claims, but the support articles explain concrete behavior and past failures. [Main site](https://www.bookyai.net/) · [Expanded product page, selected feature sections](https://special.bookyai.net/)

### What its support documentation adds

- Each chapter uses a separate AI request; continuity depends on the notes sent with it. Its repetition article describes explicit previous-ending notes, a non-fiction coverage ledger and comparisons against the preceding chapter. It says detected repeated passages trigger regeneration. [Repetition article](https://support.bookyai.net/article/a-chapter-repeats-parts-of-the-previous-chapter-why-does-this-happen-and-is-it-fixed)
- Its chapter-boundary article acknowledges that sending the whole outline without binding the current chapter’s beats allowed the model to consume future events. The documented fix marks current beats as binding and later chapters off-limits. [Chapter-boundary article](https://support.bookyai.net/article/a-chapter-ignores-its-outline-beats-and-writes-the-events-of-the-following-chapters-what-can-i-do)
- Its series guide carries shared characters/world, prior-volume recaps and unresolved threads into the next book, with genre/style/tone prefilled. [Series guide](https://support.bookyai.net/article/how-do-i-write-a-book-series-where-the-ai-remembers-the-previous-books)
- Character secrets are supplied as behavioral influences with instructions not to state them until the story reveals them. This is useful prompt design, **not demonstrated impossibility of a spoiler**. [Secrets guide](https://support.bookyai.net/article/how-do-character-secrets-work-won-t-the-ai-just-blurt-them-out)

### Evaluation and application

**Bring over:** the actual previous ending, a lasting evidence ledger, clear current/future boundaries and repetition checks. **Improve on the risky part:** do not automatically spend on repeated regenerations or silently replace prose merely because a heuristic fires.

**Implemented now:** a previous-ending excerpt, current-beat instructions, future-beat separation, persistent memory categories including knowledge/resources/threads, exact long-paragraph and opening repetition warnings, and explicit request/spend limits. Regeneration is not automatic. A complete semantic coverage ledger, dedicated scene timeline and reveal scheduler are not claimed.

The support-center directory was inspected selectively to locate relevant articles; its hundreds of setup/export/troubleshooting pages were not all read. [Support directory](https://support.bookyai.net/kb/getting-started)

## 3. Chapter — possible match for the supplied Charter address

The fiction page describes structure-first planning, character/world building, voice-directed writing, followed by “DoubleCheck.” Its FAQ claims checks for character consistency, chronology, alive/dead status, repeated passages, voice and outline adherence, with smaller fixes automated and larger creative decisions reported. It also claims a persistent story database. [Fiction product and FAQ](https://chapter.pub/fiction-software)

**Important distinction:** these are product descriptions. “1,000+ checks,” “nothing forgotten” and “finished novel” are not independently tested specifications. A persistent database can prevent project loss without solving retrieval, model attention or semantic correctness.

**Bring over:** separate drafting from verification and protect the author’s important decisions. **Implemented now:** source validation, stale-memory blocking, immutable-fact conflict warnings/blocking, local repetition checks and context-aware review. A general-purpose self-repairing whole-novel checker is not implemented or implied.

## 4. Designrr — strongest lesson is workflow and publishing separation

The accessible Designrr page describes guided topic/audience selection, outline approval, WordGenie drafting and a separate design/export stage. It emphasizes templates, imports, table of contents and republishing. [Designrr](https://go1.designrr.io/)

The official Standard WordGenie guide and AI v4 guide distinguish quick generation from a more guided interview-like process: clarify audience/purpose/style, choose a direction, edit chapters/subchapters, then generate. The Standard guide also documents a persistence boundary: the pre-generation outline/prompt session cannot be resumed after timeout, whereas generation content is saved under Docs. That is a recovery lesson, not a feature to copy. [Standard guide](https://learn.designrr.io/en/articles/10242912-how-to-create-an-ebook-using-wordgenie) · [AI v4 guide](https://learn.designrr.io/en/articles/15612240-how-to-create-an-ebook-using-wordgenie-ai-v4)

Plan-dependent AI usage and export options need checking separately; “unlimited PDF projects” is not evidence of unlimited generation or every export format.

**Bring over:** stage clarity, author-approved outline and independent publishing preflight. Ghost Writer already preserves explicit saves and optional device recovery. **Not a priority for this memory upgrade:** decorative templates, flipbooks or cover generation. DOCX/EPUB/print validation remains future work; no new KDP-ready claim is made.

## 5. BookNova — promising craft mechanisms, but distinguish descriptions from proof

Its public page describes a Story Thread Engine with setup/development/payoff tracking, character knowledge and real-time state. It describes previous-ending awareness, varied chapter openings/endings, timeline/scene mapping and a later twist audit. Its additional voice/lexical/relationship sections propose tracking recurring phrases, stable factual anchors and different dimensions of relationships. [Public feature sections reviewed](https://booknova.ai/)

**Useful idea:** continuity is necessary but insufficient. A book can remember every eye color and still have repetitive chapter structure, weak causality or flat relationships. Craft checks should be genre- and scene-sensitive, not a rigid quota of punctuation or a mechanical rotation of eight openings.

**Sample boundary:** I inspected front matter and the opening passage returned in the first chunk of the public *The Stone and The Serpent* PDF. The opening establishes a concrete operation, a revenge motive and tensions among the cast; that is stronger evidence of scene construction than a feature list. It is not a full-novel read or a long-range continuity benchmark. The front matter says AI-assisted and author-reviewed/edited; the landing page’s broader fully-automatic presentation therefore does not isolate unedited model performance. No sample prose is incorporated into Ghost Writer or redistributed in this package. [Public sample](https://booknova.ai/media/samples/booknova_book_stone_serpent.pdf)

**Implemented now:** source-linked long-range retrieval, previous-ending context, author voice instructions and local repetition warnings. A literary scoring engine, semantic twist audit, relationship model and imitation of proprietary “engines” are not claimed.

## What changed in Ghost Writer

Before this work, `server/worker.ts` sent recent chapters in full, older chapter summaries (or full prose when summaries were missing), shared canon and prior-book material. That was not zero memory, but it lacked a dedicated source-linked fact ledger, visibility into selected memory, and robust long-history bounds. Chapter review also lacked earlier chapters from the same book in its context.

Now:

1. **Persisted chapter ledgers:** optional schema-compatible memory records live with each chapter in SQLite-backed book documents and JSON backups. Categories: identity, changing state, knowledge, relationships, world rules, resources, threads and events.
2. **Provenance:** SHA-256 of chapter title/body; verbatim evidence quotes checked against source prose. Unsupported quoted entries are rejected. Extracted recaps remain fallible.
3. **Author pins:** manual fact creation needs no AI. Reviewed pins remain mandatory while their source is current. Rebuilding unchanged memory preserves pins. Stale pins or a mandatory set too large for the memory budget block generation rather than disappearing silently.
4. **Bounded retrieval:** source excerpts, relevant facts, current changing states, prior recaps and the previous ending are selected from strictly earlier chapters/volumes. No rolling last-five-book cutoff; all earlier linked books are eligible. This is keyword retrieval, not a guarantee that every relevant unpinned detail is selected.
5. **Series safety:** reading order uses stable volume IDs. Earlier-source changes mark later volumes for review. In-flight drafting/planning/review checks dependent book and series revisions before applying a result.
6. **Generation integration:** draft output includes structured memory in the same paid request. Existing prose can be indexed with a separately authorized memory job, one request per chapter and checkpointed progress. No hidden background paid extraction.
7. **Inspectable UI:** Book → Story memory shows coverage, missing/stale status, pins, evidence, raw retrieval, context size and a downloadable memory-packet preview. Preview search is separate from actual generation, which uses the target chapter’s title/brief.
8. **Craft:** persistent POV/tense/voice/avoid-list/owned-sample fields; explicit previous-volume style copying; previous-ending/current-beat directions; local repetition warnings; history-aware chapter review.

## Evidence and limits

The final verification record accompanies the source. Current completed suite: **48 unit/pipeline tests and 23 browser/API tests**; typecheck, lint, production build, formatting and dependency audit passed. New tests include actual synthetic-provider request inspection for chapter 1 → chapter 23 and book 1 → book 4, stale evidence, unsupported quotes, ordering/future exclusion, concurrent source edits, UI persistence, context download, mobile overflow and desktop axe checks.

These tests prove data flow and safety invariants on their fixtures. They **do not prove** reliable extraction by a real model, general semantic consistency, or publishable quality. No paid OpenAI call or remote deployment occurred. Current source limits still include 20 series volumes, 100 stored chapters/book (generated outline up to 40), 100,000 characters/chapter, a 48,000-character selected-memory budget and the separate 160,000-character overall request guard. Huge canon/outline material can still stop a request rather than being silently discarded.

## Next improvements, in order

| Priority | Improvement | Required acceptance evidence |
|---|---|---|
| P0 | Authorized real-model continuity benchmark on original fixtures | Source-grounded extraction precision/recall, early-detail recall, death/knowledge/reveal/resource tests, cost and failure logs; distinguish prompt presence from correct prose |
| P1 | Entity IDs/aliases, event time versus reading order, deterministic LitRPG ledger | Same-name characters stay distinct; flashbacks do not reset current state; numeric inventory/XP/ability costs reconcile |
| P1 | Full-manuscript developmental review and controlled revision diffs | Issues cite multiple passages; no source-hash mismatch applies; accept/reject/undo preserve prose and history |
| P1 | Structured scene goals, consequences, POV and reveal scheduling | Chapter N cannot silently consume N+1’s payoff; secrets and knowledge remain correctly scoped |
| P2 | Hybrid semantic retrieval with incremental indexing | Better recall than lexical baseline, bounded latency/cost, source invalidation/deletion/series isolation tests |
| P2 | Publishing pipeline: DOCX/EPUB/PDF and preflight | Reopenable files, validated navigation/fonts/layout, no cropped headings, controlled front/back matter, honest disclosure guidance |

**Bottom line:** the app now has a testable continuity foundation, not just a stronger promise. The next honest step toward “great books” is measuring actual generated books and building source-anchored revision tools—not declaring the model incapable of forgetting.
