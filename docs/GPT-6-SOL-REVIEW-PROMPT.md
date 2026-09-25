# Prompt for GPT 6-sol: independently audit and improve Ghost Writer

Copy the prompt below into the model/session you intend to use. Attach **Ghost-Writer-App.zip**, or give the agent authorized access to its source directory. The model name is the user’s requested destination, not a claim about model availability. No credentials are included or required for the initial review.

---

You are my independent principal engineer, reliability auditor and long-form fiction workflow evaluator. Work on the existing **Ghost Writer** app. Do not replace it with another blueprint or discard working features. Inspect, test, prioritize and implement justified improvements.

## My goal

I want a private GPT-powered writing studio capable of strong novels and connected series, particularly LitRPG and progression fantasy. Chapter 23 must be able to use facts established in chapter 1, and book 4 must respect the events, deaths, relationships, secrets, promises and rules established in book 1. Persistent storage alone is not proof of useful AI memory; prove that relevant evidence is selected, sent and correctly used. Great prose, causality, pacing and author control matter as much as continuity.

## Inspect before changing anything

1. Inventory the attached repository and read `README.md`, `docs/charter.md`, `docs/QUALITY.md`, `docs/COMPETITOR-REVIEW.md`, `docs/STORY-MEMORY.md`, `docs/WRITING-EXPERIENCE.md`, `docs/SERIES-PLANNING.md` and `artifacts/memory.json`.
2. Inspect the implementation—not just the previous agent’s description. Key files: `shared/domain.ts`, `shared/story-memory.ts`, `shared/writing.ts`, `server/store.ts`, `server/worker.ts`, `server/index.ts`, `src/App.tsx`, `src/StoryMemory.tsx`, `src/useDeviceRecovery.ts`, and all tests.
3. Establish a reproducible baseline. Recorded results are 48 unit/pipeline and 23 browser/API tests; rerun rather than trusting them. Run typecheck, lint, build, formatting and dependency audit. Use isolated test databases; never run destructive fixtures against my saved books. Authentication browser tests require their separate disposable server described in the repository/tests.
4. Preserve GhostForge as a read-only reference, all saved manuscripts, series plans, character naming, revision history and backups. Make backups before migrations. Do not hide failures by weakening assertions or fabricating evidence.

## Reevaluate these competitors from primary sources

Requested addresses:
- https://aiwritebook.com
- https://bookyai.net
- https://go.charter.pub
- https://go1.designr.io
- https://booknova.ai

The previous review could not load the exact Charter/Designr addresses. It separately inspected probable intended matches **https://chapter.pub/fiction-software** / **https://go.chapter.pub**, and **https://go1.designrr.io**. Verify identities; do not silently substitute domains.

Read relevant public help, walkthroughs, FAQs, limits and failure-mode documentation—not only sales pages. Useful starting points are AIWriteBook’s series generator/book editor/chapter generator guides; BookyAI’s support articles on series memory, repeated chapters, chapter boundaries and secrets; Designrr’s Standard WordGenie and AI v4 guides; Chapter’s fiction FAQ; and BookNova’s story-thread/craft descriptions and rights-permitted samples.

Separate **documented workflow**, **vendor claim**, **direct observation**, **inference** and **not verified**. Respect robots, authentication, terms and paywalls. Do not create accounts, buy plans, copy proprietary code/assets or import competitors’ copyrighted novels into our app. Do not claim exhaustive understanding of closed systems. Map useful functional ideas into original implementations and measurable acceptance criteria.

## Audit the current memory architecture critically

It currently stores optional per-chapter source-hashed fact ledgers, exact quotes, candidate/author labels, pins and recaps. It retrieves earlier-volume/chapter evidence with a bounded keyword-based packet, selects latest changing state, blocks stale/oversized pins and immutable conflicts, exposes a context preview, and integrates extraction into drafting plus separately budgeted memory jobs. Author voice controls and local repetition checks exist. These are a foundation, not proof of perfect memory.

Test and improve:
- Chapter-1-to-23 and book-1-to-4 recall with facts whose wording differs from the retrieval query; distinguish retrieval from actual model reasoning.
- Namespace isolation, names/aliases, same-name characters, normalized-key collisions, duplicate facts and contradictory/uncertain evidence.
- Mutable state versus timeless rules; historical pins versus current state; death/departure, knowledge gained/lost, relationships, item ownership and unresolved promises.
- Flashback time versus reading order; volume/chapter reorder, deletion, regeneration and restored revisions; future-plan/reveal leakage.
- Source quote verification versus entailment: a quote may be present without supporting the claimed fact. Summaries and model-generated self-reports are untrusted candidates.
- Stale extraction invalidation and propagation, in-flight dependent source changes, oversized canon, missing ledgers, budget overflow and transparent omissions.
- Retrieval completeness/performance on realistic 100k-word novels and multi-book series. If adding hybrid/vector retrieval, validate deletion/invalidation, provenance, privacy, latency and costs; do not add paid services silently.
- Deterministic LitRPG resource/XP/ability constraints rather than a prompt that merely asks the model to do arithmetic.

## Reliability and security audit

Exercise duplicate requests, double clicks, retries, pauses/cancellation, restart recovery, timeouts, malformed/refused/partial provider output, uncertain billing, orphan jobs after deletion, atomic checkpoints and races between manual edits, memory jobs, series updates and AI responses. Prove edits made during saves cannot disappear.

Check schema migrations, old/new backup compatibility, 4 MB import limits, SQLite integrity/restore, idempotency, auth/session revocation, CSRF/origin boundaries, arbitrary-ID/path handling, secret leakage, XSS and prompt injection from imported prose. Keep manuscript text as data, not instructions to change roles or use tools. Audit recovery quota/blocked storage, multiple tabs, stale copies and logout/privacy behavior. Improve mobile layout, keyboard/focus behavior and accessibility without dropping existing functionality.

## Improve writing quality without taking control away

Prioritize source-anchored developmental review, scene goal/obstacle/decision/consequence structure, POV/tense stability, reveal scheduling, character-knowledge boundaries, causal transitions, varied openings/endings, unresolved-thread payoff and repetition detection. Avoid rigid stylistic quotas that flatten every book into one voice.

Prefer reviewable suggestions/diffs with reasons, severity, evidence, accept/reject, source-version checks, history and undo. Separate objective corrections from taste. Do not automatically rewrite whole manuscripts or start paid regeneration loops. Preserve genre variety and explicit cultural naming choices; geography must never determine identity.

Keep guided checkpoints and bounded per-book autopilot. Whole-series unattended generation is not currently implemented; if proposing it, first design per-volume approval, budgets, resumability, state verification and rollback. Publishing exports must be tested, not labeled KDP-ready merely because a file downloads.

## Safety and deployment boundaries

- Initial paid API spend ceiling is **zero**. Use original synthetic fixtures/local mock providers for engineering tests. Ask for an explicit budget and obtain credentials only through secure server configuration before any live-model experiment.
- No secret requests in chat, account purchases, Git pushes, DNS changes or remote deployment without authorization.
- `coolify.delquro.com` is my management host, not an assumed app origin. Production Docker/Coolify deployment remains unverified. Preserve the existing persistent data location; use one SQLite worker replica unless you deliberately redesign it with approval.
- Do not change or claim support for a model merely because its name appears in this prompt. Verify actual provider availability/API compatibility separately.

## Deliverables

1. Evidence-based competitor/workflow matrix with URLs, scope limits and useful lessons.
2. Prioritized P0/P1/P2 audit findings with file/line references, reproduction, impact and fix status.
3. Actual code changes for the most important safe improvements, not only recommendations; document migrations and rollback.
4. Regression tests for each consequential fix, an honest before/after verification report and preserved artifacts.
5. A continuity/literary benchmark plan separating retrieval recall, extraction accuracy, generated contradiction rate, pacing/voice judgments and costs. If authorized later, use original or licensed fixtures and human review; no fabricated “perfect recall” scores.
6. Updated documentation and source package, and a verified working preview using preserved project data when the environment supports it.
7. A concise handoff: what improved, what failed, what remains unverified, what needs my authorization, and the next highest-value step toward genuinely excellent books.

Be skeptical of both competitor marketing and the previous agent’s work. Prove stability and useful long-range memory before declaring success.
