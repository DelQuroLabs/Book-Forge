# Story Blueprint — cohesive stories, not just consistent facts

Status: **architecture and implementation handoff, not a newly implemented scene-planning UI**.

Ghost Writer already has saved outlines/chapter briefs, a book bible, a series roadmap, source-linked story memory, author voice directions and bounded drafting/review. The next step is to unite those controls in a navigable Story Blueprint and add structured scene causality. Remembering facts helps avoid contradictions; it does not by itself create good scenes, satisfying arcs or compelling prose.

## The model

```text
SERIES BLUEPRINT
├── Reader promise, themes, central conflict and final resolution
├── Shared canon: world rules, recurring cast and stable identities
├── Reading order and chronology (different concepts)
├── Character arcs and setup → development → payoff threads
└── BOOK BLUEPRINT, one per volume
    ├── This book's dramatic question and complete local arc
    ├── Inciting event → escalation → midpoint → crisis → climax → aftermath
    ├── Character wants, needs, choices and emotional change
    ├── Chapter sequence: each chapter changes the story
    │   └── SCENE CARD
    │       ├── POV, time, location and people present
    │       ├── Goal → obstacle → turning point → choice → consequence
    │       ├── What changes in stakes, knowledge, relationships or resources?
    │       ├── Entry state and exit state
    │       ├── Setup advanced / payoff earned / secret still withheld
    │       └── Why the next scene follows from this one
    └── LINKED STORY MEMORY
        ├── What the actual saved prose establishes, with source quotes
        ├── Author-reviewed facts and critical pins
        ├── Current state plus dated history, not one overwritable summary
        ├── Unresolved promises, uncertainties and possible contradictions
        └── Source hashes, stale-state warnings and revision dependencies
```

The blueprint is the **home for planning and memory**, not a single giant prompt. The database preserves the full project; each generation gets an appropriate bounded working packet. Plans and established facts must remain separate even when shown together.

## Proposed workspace wireframe

```text
[Series / Book]     [Plan status] [Memory coverage] [Save] [History]

STRUCTURE                 CURRENT CHAPTER / SCENE          EVIDENCE & CHECKS
Series promise            Purpose in this book             Entry-state facts
  Book 1                  POV · time · location            Earlier chapter quotes
    Chapter 1             Goal / obstacle                  Characters' knowledge
      Scene 1             Turning point / choice           Open threads due here
      Scene 2             Consequence / emotional change    Resource constraints
    Chapter 2             Exit state / next-scene bridge    What must stay unrevealed
  Book 2                  [Review brief] [Authorize draft]  Coverage / stale warnings

[Planned beats] [Draft prose] [Established memory] [Review suggestions]
```

Start by extending the existing Outline and Story memory interfaces. Do not build a separate disconnected planner or duplicate the authoritative book data. A standalone book uses the same model without the outer series layer.

## Writing loop

1. **Plan:** define the reader promise and an ending that answers the book's central question; map the series payoffs separately.
2. **Outline:** make each chapter necessary. Record what changes and why the next chapter follows.
3. **Prepare the scene:** clarify whose goal is blocked, what choice they make, and the resulting cost or consequence. Quiet scenes need change too; not every scene needs an action set piece.
4. **Assemble context:** approved canon, appropriate source-current facts, relevant earlier passages, previous ending, character knowledge, current beats and author voice. Future plans remain explicitly labeled as future.
5. **Draft:** write only the intended scene/chapter. Maintain POV, subtext and voice; do not force a mechanical opening/ending pattern.
6. **Inspect:** check both continuity and craft. Is the scene causal, emotionally credible, non-redundant and faithful to the character's available knowledge? Does it earn its payoff?
7. **Revise with permission:** show suggestions and diffs, allow acceptance/rejection, preserve history and reject application to changed source text. Do not silently overwrite the manuscript.
8. **Update memory from the accepted text:** extract what actually happened, not what the outline hoped would happen. Source-verify quotations; label inferred/uncertain claims. Never promote a planned event into established history automatically.
9. **Continue or stop:** under guided mode, await approval. Under bounded autopilot, checkpoint and continue only within explicitly authorized limits and supported quality gates.

## Implemented versus next

| Layer | Current implementation | Next development |
|---|---|---|
| Series structure | Roadmap, endgame, milestones, volume arcs, recurring-character beats, stable volume IDs | Chapter/scene-level thread and reveal schedules |
| Book outline | Saved ordered chapter cards and briefs; authorized outline generation | Structured dramatic spine and chapter-purpose fields |
| Scene causality | Can be expressed in the existing chapter brief | Typed scene cards, entry/exit states and causal links |
| Memory | Source-hashed chapter ledgers, evidence quotes, candidate/author labels, pins, earlier-book retrieval | Stable entity/alias resolution, event-time history, semantic retrieval |
| Voice | Persistent POV, tense, voice, avoid list and owned/licensed writing sample | Measured voice consistency and genre-sensitive craft review |
| Quality review | History-aware chapter review and limited exact-repetition checks | Whole-book developmental review, multi-passage evidence and controlled revision diffs |
| LitRPG | Genre foundation, written system rules and resource-memory category | Deterministic inventory/XP/cost/ability ledger and validated transitions |
| Safety | Explicit saves, revisions, recovery, stale-source checks, request/spend caps | Richer dependency impact maps and additional stress/real-model tests |

The model in `story-blueprint.example.json` is an original worked design example. It is **not** a library backup, an importable app format, a migration or a completed feature. Keep the existing schemas backward-compatible when implementing it.

## Implementation sequence for Book-Forge

1. Add optional structured book-spine and scene-card schemas with stable IDs and explicit links to existing chapters. Preserve legacy chapter briefs and manuscripts.
2. Add the combined blueprint editor, using the existing explicit-save/revision/recovery flow. Validate references before deleting or reordering linked records.
3. Assemble generation context from the saved blueprint and current story memory; expose the assembled selection and omissions. Require author approval before replacing an existing outline/prose.
4. Add source-anchored craft review and accept/reject diffs, with version checks and undo. Do not introduce silent paid retries.
5. Add a deterministic LitRPG transition ledger, then stronger temporal/entity-aware retrieval.
6. Only after permission and a spend ceiling, run a real-model literary/continuity benchmark on original fixtures and evaluate with human readers.

## Acceptance tests

- A chapter-one clue matters in chapter 23 for a concrete causal reason, not merely because its words appear in a prompt.
- Book four respects earlier deaths, promises, character growth and world rules while delivering its own satisfying arc.
- A planned reveal cannot become a past fact merely because it appears in a future outline card.
- A scene changes a goal, relationship, understanding, danger or available resource; redundant scenes are flagged with reasons, not arbitrarily deleted.
- Edits, reordered scenes, changed POV and flashbacks trigger appropriate checks without confusing reading order with event time.
- A cost in LitRPG is reconciled against the relevant inventory/ability state rather than “remembered” as vague prose.
- Critiques cite evidence, distinguish errors from taste and never silently rewrite the author's voice.
- Existing work survives saves, provider failures, restarts and migrations. Real-model quality is reported separately from synthetic data-flow tests.

**Do not promise perfect memory, automatic bestseller quality, or a finished whole-series drafting engine simply because these fields exist.**
