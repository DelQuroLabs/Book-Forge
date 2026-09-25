import type { ReactNode } from "react";
import {
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Flag,
  Users,
  BookOpen,
} from "lucide-react";
import { type Series, type Book, uuid, bookWords } from "../shared/domain";
import {
  roadmapFor,
  moveVolume,
  seriesPlanningWarnings,
  type SeriesRoadmap,
} from "../shared/series-planning";
const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="field">
    <span>{label}</span>
    {children}
  </label>
);
export function SeriesRoadmapEditor({
  series,
  books,
  onChange,
  onVolumes,
  onCast,
}: {
  series: Series;
  books: Book[];
  onChange: (change: Partial<Series>) => void;
  onVolumes: () => void;
  onCast: () => void;
}) {
  const r = roadmapFor(series),
    set = (change: Partial<SeriesRoadmap>) =>
      onChange({ roadmap: { ...r, ...change } }),
    warnings = seriesPlanningWarnings(series);
  const linked = books.filter((b) => b.seriesId === series.id),
    available = series.characters.filter(
      (c) => !r.characterArcs.some((a) => a.characterId === c.id),
    );
  const stats = [
    ["Planned books", series.volumes.length],
    ["Linked manuscripts", linked.length],
    ["Open story threads", series.threads.filter((t) => !t.resolved).length],
    [
      "Words across books",
      linked.reduce((n, b) => n + bookWords(b), 0).toLocaleString(),
    ],
  ];
  return (
    <div className="series-roadmap">
      <div className="roadmap-intro">
        <div>
          <span className="eyebrow">
            THE WHOLE STORY, BEFORE THE NEXT CHAPTER
          </span>
          <h2>Your series at a glance</h2>
          <p>
            Plan the destination, then give every book a reason to exist. This
            is an author-edited plan, not an automatically generated series.
          </p>
        </div>
        <button className="secondary" onClick={onVolumes}>
          <BookOpen size={16} />
          Plan volume arcs
        </button>
      </div>
      <div className="roadmap-stats">
        {stats.map(([label, value]) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <section className="panel">
        <div className="section-title">
          <h3>
            <Flag size={18} /> Series-wide direction
          </h3>
        </div>
        <div className="two-fields">
          <Field label="Central series conflict">
            <textarea
              rows={4}
              maxLength={4000}
              value={r.centralConflict}
              onChange={(e) => set({ centralConflict: e.target.value })}
              placeholder="What problem is too large to resolve in one book?"
            />
          </Field>
          <Field label="Final-book endgame">
            <textarea
              rows={4}
              maxLength={4000}
              value={r.endgame}
              onChange={(e) => set({ endgame: e.target.value })}
              placeholder="What is finally resolved—and what does victory cost?"
            />
          </Field>
          <Field label="Theme / reader promise">
            <textarea
              rows={3}
              maxLength={2000}
              value={r.theme}
              onChange={(e) => set({ theme: e.target.value })}
              placeholder="The question or emotional experience carried through every volume."
            />
          </Field>
          <Field label="Escalation & progression rules">
            <textarea
              rows={3}
              maxLength={4000}
              value={r.escalation}
              onChange={(e) => set({ escalation: e.target.value })}
              placeholder="How do stakes, power and responsibility grow without resetting earlier progress?"
            />
          </Field>
        </div>
      </section>
      <section>
        <div className="section-title">
          <div>
            <h3>Reading order & book milestones</h3>
            <p>
              Reordering preserves manuscript links, character beats and payoff
              references by their IDs.
            </p>
          </div>
        </div>
        <div className="roadmap-books">
          {series.volumes.map((v, i) => {
            const b = linked.find((b) => b.volumeId === v.id);
            return (
              <article className="panel roadmap-book" key={v.id}>
                <div className="roadmap-book-head">
                  <span className="eyebrow">BOOK {i + 1}</span>
                  <span className="badge">
                    {b ? "Manuscript linked" : "Plan only"}
                  </span>
                  <div className="roadmap-order">
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Move ${v.title} earlier`}
                      disabled={i === 0}
                      onClick={() =>
                        onChange({
                          volumes: moveVolume(series, v.id, -1).volumes,
                        })
                      }
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Move ${v.title} later`}
                      disabled={i === series.volumes.length - 1}
                      onClick={() =>
                        onChange({
                          volumes: moveVolume(series, v.id, 1).volumes,
                        })
                      }
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </div>
                <h3>{v.title}</h3>
                <p>
                  {v.arc || "Define this book’s standalone arc in Volume arcs."}
                </p>
                <dl>
                  <dt>Progression</dt>
                  <dd>{v.progression || "Not planned yet"}</dd>
                  <dt>Ending & handoff</dt>
                  <dd>{v.ending || "Not planned yet"}</dd>
                </dl>
                {r.milestones
                  .filter((m) => m.volumeId === v.id)
                  .map((m) => (
                    <div className="roadmap-event" key={m.id}>
                      <strong>{m.title || "Untitled milestone"}</strong>
                      <span>{m.timeAnchor || "Timing not set"}</span>
                      <p>{m.consequence}</p>
                    </div>
                  ))}
                {b && (
                  <small>
                    {bookWords(b).toLocaleString()} words · {b.chapters.length}{" "}
                    chapters
                  </small>
                )}
              </article>
            );
          })}
        </div>
      </section>
      <section className="panel">
        <div className="section-title">
          <div>
            <h3>Timeline & turning points</h3>
            <p>
              Use relative dates or world-calendar labels. This is a plan, not a
              calendar simulator.
            </p>
          </div>
          <button
            className="secondary"
            disabled={r.milestones.length >= 100}
            onClick={() =>
              set({
                milestones: [
                  ...r.milestones,
                  {
                    id: uuid(),
                    title: "",
                    volumeId: series.volumes[0]?.id || "",
                    timeAnchor: "",
                    consequence: "",
                  },
                ],
              })
            }
          >
            <Plus size={16} />
            Add milestone
          </button>
        </div>
        {!r.milestones.length && (
          <p className="microcopy">
            Track a war’s outbreak, a major reveal, a system unlock, or an
            irreversible choice.
          </p>
        )}
        {r.milestones.map((m) => (
          <div className="roadmap-entry" key={m.id}>
            <div className="roadmap-entry-heading">
              <strong>Series milestone</strong>
              <button
                className="icon-button"
                aria-label="Remove milestone"
                onClick={() => {
                  if (confirm("Remove this milestone from the series plan?"))
                    set({
                      milestones: r.milestones.filter((x) => x.id !== m.id),
                    });
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="two-fields">
              <Field label="Milestone title">
                <input
                  maxLength={200}
                  value={m.title}
                  onChange={(e) =>
                    set({
                      milestones: r.milestones.map((x) =>
                        x.id === m.id ? { ...x, title: e.target.value } : x,
                      ),
                    })
                  }
                />
              </Field>
              <Field label="Milestone book">
                <select
                  aria-label="Milestone book"
                  value={m.volumeId}
                  onChange={(e) =>
                    set({
                      milestones: r.milestones.map((x) =>
                        x.id === m.id ? { ...x, volumeId: e.target.value } : x,
                      ),
                    })
                  }
                >
                  <option value="">Unassigned</option>
                  {series.volumes.map((v, i) => (
                    <option key={v.id} value={v.id}>
                      {i + 1}. {v.title}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Time / chronology anchor">
              <input
                maxLength={300}
                value={m.timeAnchor}
                onChange={(e) =>
                  set({
                    milestones: r.milestones.map((x) =>
                      x.id === m.id ? { ...x, timeAnchor: e.target.value } : x,
                    ),
                  })
                }
                placeholder="Year 2, first winter · six months after book one"
              />
            </Field>
            <Field label="Milestone consequence">
              <textarea
                rows={2}
                maxLength={2000}
                value={m.consequence}
                onChange={(e) =>
                  set({
                    milestones: r.milestones.map((x) =>
                      x.id === m.id ? { ...x, consequence: e.target.value } : x,
                    ),
                  })
                }
              />
            </Field>
          </div>
        ))}
      </section>
      <section className="panel">
        <div className="section-title">
          <div>
            <h3>
              <Users size={18} /> Character journeys across books
            </h3>
            <p>
              Use the approved recurring cast. A planned ending is not an event
              that has already happened.
            </p>
          </div>
          <button
            className="secondary"
            disabled={!available.length}
            onClick={() =>
              set({
                characterArcs: [
                  ...r.characterArcs,
                  {
                    id: uuid(),
                    characterId: available[0].id,
                    startingState: "",
                    endingState: "",
                    beats: [],
                  },
                ],
              })
            }
          >
            <Plus size={16} />
            Add character arc
          </button>
        </div>
        {!series.characters.length && (
          <button className="text-button" onClick={onCast}>
            Add recurring characters first
          </button>
        )}
        {r.characterArcs.map((a) => {
          const change = (part: Partial<typeof a>) =>
            set({
              characterArcs: r.characterArcs.map((x) =>
                x.id === a.id ? { ...x, ...part } : x,
              ),
            });
          return (
            <div className="roadmap-entry" key={a.id}>
              <div className="roadmap-entry-heading">
                <strong>
                  {series.characters.find((c) => c.id === a.characterId)
                    ?.name || "Missing character"}
                </strong>
                <button
                  className="icon-button"
                  aria-label="Remove character arc"
                  onClick={() => {
                    if (
                      confirm(
                        "Remove this planned arc? The recurring character will remain in the cast.",
                      )
                    )
                      set({
                        characterArcs: r.characterArcs.filter(
                          (x) => x.id !== a.id,
                        ),
                      });
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <Field label="Arc character">
                <select
                  aria-label="Arc character"
                  value={a.characterId}
                  onChange={(e) => change({ characterId: e.target.value })}
                >
                  {series.characters
                    .filter(
                      (c) =>
                        c.id === a.characterId ||
                        available.some((x) => x.id === c.id),
                    )
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </Field>
              <div className="two-fields">
                <Field label="Starting belief / limitation">
                  <textarea
                    rows={2}
                    maxLength={2000}
                    value={a.startingState}
                    onChange={(e) => change({ startingState: e.target.value })}
                  />
                </Field>
                <Field label="End-of-series transformation">
                  <textarea
                    rows={2}
                    maxLength={2000}
                    value={a.endingState}
                    onChange={(e) => change({ endingState: e.target.value })}
                  />
                </Field>
              </div>
              {series.volumes.map((v, i) => (
                <Field label={`Book ${i + 1} character change`} key={v.id}>
                  <textarea
                    rows={2}
                    maxLength={2000}
                    value={
                      a.beats.find((b) => b.volumeId === v.id)?.change || ""
                    }
                    placeholder={v.title}
                    onChange={(e) =>
                      change({
                        beats: [
                          ...a.beats.filter((b) => b.volumeId !== v.id),
                          ...(e.target.value
                            ? [{ volumeId: v.id, change: e.target.value }]
                            : []),
                        ],
                      })
                    }
                  />
                </Field>
              ))}
            </div>
          );
        })}
      </section>
      {warnings.length > 0 && (
        <aside className="notice roadmap-notices">
          <div>
            <strong>Planning reminders—not automatic repairs</strong>
            <ul>
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </aside>
      )}
      <p className="microcopy">
        Save series to persist this roadmap. Linked-book AI requests include it
        as planning context; later-volume beats are marked as future plans. Real
        model adherence is not guaranteed. Changes flag linked manuscripts for
        continuity review.
      </p>
    </div>
  );
}
