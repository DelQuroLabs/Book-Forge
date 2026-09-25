# Series planning in Ghost Writer

## Open the planner

Go to **Series studio → Plan a series**, or choose **Open series planner** on an existing series. The default tab is now **Series roadmap**. Series planning is saved application data, not a separate proposal document.

### 1. Define the whole journey

In **Series roadmap**, record:

- Central conflict spanning the series.
- Final-book endgame and the price of resolution.
- Theme / reader promise.
- Escalation and progression rules—especially useful for LitRPG power growth without resetting earlier consequences.

The overview counts planned books, linked manuscripts, unresolved story threads and current manuscript words. These are factual counts, not an AI quality/readiness score.

### 2. Give every book its own purpose

Use **Plan volume arcs** or the **Volume arcs** tab to edit each title, book arc, ending/handoff and progression milestone. Up to 20 volume plans are supported. Reorder volumes with the up/down buttons on roadmap cards, then save.

Volumes retain their IDs when moved. Manuscript links, milestones, character beats and setup/payoff mappings therefore stay attached to the same book rather than the same list position. The planner warns if a payoff now precedes its setup in reading order. Nonlinear structures are allowed; the author must review and explain them.

A volume with a manuscript cannot be removed. Move/unassign roadmap milestones and clear character beats before deleting a referenced volume. Existing setup/payoff references are reset to unassigned when an otherwise removable volume is deleted.

### 3. Track timeline milestones

Add a milestone, assign it to a book, and record a chronology anchor and consequence. Anchors are free-form author labels, such as “second winter” or “six months after book one.” Unassigned milestones are allowed and produce a planning reminder. This is not a date arithmetic or timeline simulation engine.

### 4. Plan character journeys across books

Create characters in **Recurring cast**, keeping their chosen names, cultural backgrounds and origins. In **Series roadmap**, add an arc for an approved recurring character:

- Starting belief or limitation.
- End-of-series transformation.
- A specific change for each volume.

There is at most one series arc per recurring character. Book beats are keyed to volume IDs, so moving a book does not transfer its beat to someone else’s book. Remove the planned arc before removing its character from the recurring cast; deleting an arc itself leaves the character intact. An empty beat is omitted rather than treated as a permanent reference.

### 5. Preserve canon and promises

**Shared bible** remains the authoritative shared world/rules workspace. **Setups & payoffs** maps promises to the volumes where they are planted and resolved. **Recurring cast** retains culturally informed naming and the expanded location picker. The roadmap complements those sections; it does not replace their data.

Press **Save series**. Saves use optimistic revisions; changes flag linked manuscripts for continuity review and are blocked while a linked book has an active generation job. Saving a plan is not automatic continuity repair of already-written prose.

### 6. Create linked manuscripts

After saving, use **Volume arcs → Create this manuscript**. The book retains its volume link and shared cast. Existing volume manuscripts open from the same area. Guided and autopilot generation remain per-book actions with explicit authorization and limits—not an unattended whole-series drafting run.

## How generation uses the roadmap

The server includes the current saved roadmap, volume plans, shared canon, approved cast, setups/payoffs and prior-volume context in linked-book requests. Prior books are ordered by the current series reading order. Both the request instructions and series planning context distinguish the endgame/later-volume events from facts that have already occurred. They tell the model not to reveal later-book payoffs early.

This integration was verified with a **local synthetic provider**. It is not proof of live-model literary quality, spoiler avoidance or full-series consistency. Generation remains disabled in the keyless demo. There is no AI series-plan generator in this update: authors edit the roadmap themselves, and authorized linked-book generation consumes it as context.

## Persistence and compatibility

`Series.roadmap` is an optional, schema-validated record containing direction fields, milestones and character arcs. Older series without that field show an empty roadmap without rewriting their records or requiring a database migration. The roadmaps are included in library JSON backups and the complete SQLite database.

The API rejects missing character/volume references and duplicate milestones/arcs/beats. Invalid imports roll back through the existing transaction. Use the updated build for new backups; importing them into an older build that does not recognize roadmap fields can discard those fields. The current 4 MB JSON import cap still applies; larger/full-history backups use SQLite.

## Verification

- Three new unit cases cover legacy compatibility, roadmap schema/references, stable reordering and reversed payoff warnings.
- The synthetic autopilot test now asserts that endgame, future milestone, character beat and planning-policy context reach requests.
- Two browser/API cases cover create/edit/save/reload, milestone assignment and reordering, recurring-character beats, backup preservation, linked-book continuity notices, stale saves and invalid references.
- The populated roadmap view passed an automated axe A/AA check and a 390-pixel viewport overflow check. These are partial accessibility checks, not complete conformance certification.

Current suite: **29 unit/pipeline tests and 13 browser/API tests passed**. See `artifacts/series-roadmap-results.json` and the normal test/build reports. Screenshot demonstration text was entered in an unsaved browser draft; existing preview records were not changed.
