import { useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  ShieldCheck,
  Search,
  Pin,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { type Book, type Series, uuid } from "../shared/domain";
import {
  buildMemoryPacket,
  memoryStatus,
  chapterHash,
  FactCategory,
  emptyStyle,
  craftChecks,
  orderedPriorBooks,
  type MemoryFact,
} from "../shared/story-memory";
import { downloadText } from "./WritingTools";
export function StoryMemory({
  book,
  series,
  books,
  chapterId,
  onChapter,
  onChange,
  onRun,
  onSource,
  disabled,
}: {
  book: Book;
  series?: Series;
  books: Book[];
  chapterId: string;
  onChapter: (id: string) => void;
  onChange: (p: Partial<Book>) => void;
  onRun: (all: boolean) => void;
  onSource: (bookId: string, chapterId: string) => void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState(""),
    [error, setError] = useState("");
  const [fact, setFact] = useState({
    category: "state" as MemoryFact["category"],
    subject: "",
    key: "",
    value: "",
    quote: "",
  });
  const chapter = book.chapters.find((c) => c.id === chapterId),
    status = chapter ? memoryStatus(chapter) : "empty";
  const packet = useMemo(
    () => buildMemoryPacket(book, chapterId, series, books, query || undefined),
    [book.chapters, chapterId, series, books, query],
  );
  const prior = orderedPriorBooks(book, series, books),
    d = packet.diagnostics,
    style = book.writingStyle || emptyStyle();
  const updateChapter = (p: Partial<Book["chapters"][number]>) =>
    onChange({
      chapters: book.chapters.map((c) =>
        c.id === chapterId ? { ...c, ...p } : c,
      ),
    });
  const changeFact = (id: string, p: Partial<MemoryFact>) => {
    if (chapter?.memory)
      updateChapter({
        memory: {
          ...chapter.memory,
          facts: chapter.memory.facts.map((f) =>
            f.id === id ? { ...f, ...p } : f,
          ),
        },
      });
  };
  const checks = chapter
    ? craftChecks(chapter, [
        ...prior.flatMap((b) => b.chapters),
        ...book.chapters.slice(
          0,
          book.chapters.findIndex((c) => c.id === chapterId),
        ),
      ])
    : [];
  const add = () => {
    if (!chapter) return;
    if (
      !fact.subject.trim() ||
      !fact.key.trim() ||
      !fact.value.trim() ||
      !fact.quote.trim()
    )
      return setError(
        "Complete the subject, key, fact and exact source quote.",
      );
    if (!chapter.body.includes(fact.quote))
      return setError(
        "That exact quote is not in this chapter. Copy it directly from the manuscript.",
      );
    if (status === "stale")
      return setError("Rebuild or explicitly replace stale memory first.");
    const memory = chapter.memory || {
      version: 1 as const,
      sourceHash: chapterHash(chapter),
      generatedAt: new Date().toISOString(),
      summary: "",
      facts: [],
      rejectedFacts: 0,
    };
    if (memory.facts.length >= 40)
      return setError(
        "This chapter has 40 facts. Remove an unnecessary entry first.",
      );
    updateChapter({
      memory: {
        ...memory,
        facts: [
          ...memory.facts,
          { ...fact, id: uuid(), authority: "author", pinned: true },
        ],
      },
    });
    setFact({ ...fact, key: "", value: "", quote: "" });
    setError("");
  };
  return (
    <section className="story-memory">
      <div className="memory-heading">
        <div>
          <span className="eyebrow">CONTINUITY WORKBENCH</span>
          <h2>
            <Brain size={23} />
            Story memory
          </h2>
          <p>Earlier chapters. Previous books. Evidence you can inspect.</p>
        </div>
        <button
          className="secondary"
          disabled={
            disabled ||
            !book.chapters.some(
              (c) => c.body.trim() && memoryStatus(c) !== "current",
            )
          }
          onClick={() => onRun(true)}
        >
          Build missing / stale memory
        </button>
      </div>
      <div className="memory-intro">
        <ShieldCheck size={20} />
        <p>
          Saved in your studio, not a chat window. Every fact links to its
          source. AI extractions are candidates, not verified canon. Pins are
          always included when their source is current; an oversized or stale
          pinned set blocks generation instead of being silently dropped.
        </p>
      </div>
      <div className="memory-stats">
        <div>
          <strong>{d.eligibleChapters}</strong>
          <span>earlier written chapters</span>
        </div>
        <div>
          <strong>{d.eligibleBooks}</strong>
          <span>books in context scope</span>
        </div>
        <div>
          <strong>{d.current}</strong>
          <span>current chapter ledgers</span>
        </div>
        <div>
          <strong>{d.missing + d.stale}</strong>
          <span>missing / stale ledgers</span>
        </div>
      </div>
      <div className="memory-controls">
        <label className="field">
          <span>Current chapter / memory boundary</span>
          <select
            aria-label="Memory chapter"
            value={chapterId}
            onChange={(e) => onChapter(e.target.value)}
          >
            {!book.chapters.length && (
              <option value="">Add chapters first</option>
            )}
            {book.chapters.map((c, i) => (
              <option key={c.id} value={c.id}>
                {i + 1}. {c.title}
              </option>
            ))}
          </select>
        </label>
        <button
          className="secondary"
          disabled={disabled || !chapter?.body.trim()}
          onClick={() => onRun(false)}
        >
          Extract this chapter’s memory
        </button>
      </div>
      <p className="microcopy">
        The writing packet stops before the selected chapter. Later chapters and
        later volumes are never retrieved as past events. Chapter ledgers below
        describe the selected chapter for use by subsequent chapters. Save
        changes explicitly; extraction is a separately authorized AI job.
      </p>
      {d.warnings.map((w) => (
        <div key={w} className="notice warning">
          <AlertTriangle size={17} />
          <span>{w}</span>
        </div>
      ))}
      <div className="memory-columns">
        <div>
          <section className="panel memory-panel">
            <div className="memory-panel-heading">
              <h3>Chapter ledger</h3>
              <span className={"badge " + (status === "current" ? "good" : "")}>
                {status}
              </span>
            </div>
            {!chapter?.body.trim() ? (
              <p className="microcopy">
                Write this chapter first. Its memory is extracted automatically
                with an authorized AI draft, or separately from existing prose.
              </p>
            ) : (
              <>
                {status === "stale" && (
                  <>
                    <p className="notice warning">
                      Source text changed. These facts are excluded. Review and
                      unpin old facts before extracting again; rebuilding does
                      not certify existing prose.
                    </p>
                    <button
                      className="secondary compact"
                      disabled={disabled}
                      onClick={() => {
                        if (
                          confirm(
                            "Replace this stale ledger with an empty manual ledger? Old memory facts and pins will be removed; prose is unchanged.",
                          )
                        )
                          updateChapter({
                            memory: {
                              version: 1,
                              sourceHash: chapterHash(chapter),
                              generatedAt: new Date().toISOString(),
                              summary: "",
                              facts: [],
                              rejectedFacts: 0,
                            },
                          });
                      }}
                    >
                      Replace stale ledger manually
                    </button>
                  </>
                )}
                {chapter.memory && (
                  <>
                    <label className="field">
                      <span>Chapter continuity recap</span>
                      <textarea
                        rows={3}
                        maxLength={2000}
                        disabled={disabled || status === "stale"}
                        value={chapter.memory.summary}
                        onChange={(e) =>
                          updateChapter({
                            memory: {
                              ...chapter.memory!,
                              summary: e.target.value,
                            },
                          })
                        }
                      />
                    </label>
                    <p className="microcopy">
                      {chapter.memory.rejectedFacts} unsupported, duplicate or
                      excess extraction entries discarded. Recaps are not
                      source-verified claims.
                    </p>
                  </>
                )}
                <div className="memory-facts">
                  {chapter.memory?.facts.map((f) => (
                    <article className="memory-fact" key={f.id}>
                      <div>
                        <span className="eyebrow">
                          {f.category} ·{" "}
                          {f.authority === "author"
                            ? "author reviewed"
                            : "AI candidate"}
                        </span>
                        <button
                          className="secondary compact"
                          aria-label={`${f.pinned ? "Unpin" : "Pin"} ${f.subject} ${f.key}`}
                          disabled={
                            disabled || (!f.pinned && status !== "current")
                          }
                          onClick={() =>
                            changeFact(f.id, {
                              pinned: !f.pinned,
                              ...(!f.pinned
                                ? { authority: "author" as const }
                                : {}),
                            })
                          }
                        >
                          <Pin size={13} />
                          {f.pinned ? "Pinned" : "Pin after review"}
                        </button>
                      </div>
                      <strong>
                        {f.subject} · {f.key}
                      </strong>
                      <p>{f.value}</p>
                      <blockquote>{f.quote}</blockquote>
                      <button
                        className="inline-link"
                        disabled={disabled}
                        onClick={() => {
                          if (
                            confirm(
                              "Remove this memory fact? Source prose remains unchanged.",
                            )
                          )
                            updateChapter({
                              memory: {
                                ...chapter.memory!,
                                facts: chapter.memory!.facts.filter(
                                  (x) => x.id !== f.id,
                                ),
                              },
                            });
                        }}
                      >
                        Remove fact
                      </button>
                    </article>
                  ))}
                </div>
                <details className="manual-memory">
                  <summary>
                    <Plus size={14} />
                    Add an author-verified fact
                  </summary>
                  <p className="microcopy">
                    No AI call. Use an exact source quote and a specific key,
                    such as “alive”, “location”, “level”, or “knows vault code”.
                    A pin preserves the dated evidence, not an eternal current
                    state.
                  </p>
                  <div className="two-fields">
                    <label className="field">
                      <span>Fact category</span>
                      <select
                        value={fact.category}
                        onChange={(e) =>
                          setFact({
                            ...fact,
                            category: e.target.value as MemoryFact["category"],
                          })
                        }
                      >
                        {FactCategory.options.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      <span>Fact subject</span>
                      <input
                        maxLength={120}
                        value={fact.subject}
                        onChange={(e) =>
                          setFact({ ...fact, subject: e.target.value })
                        }
                      />
                    </label>
                  </div>
                  <label className="field">
                    <span>Fact key</span>
                    <input
                      maxLength={100}
                      value={fact.key}
                      onChange={(e) =>
                        setFact({ ...fact, key: e.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Established fact / value</span>
                    <textarea
                      maxLength={500}
                      rows={2}
                      value={fact.value}
                      onChange={(e) =>
                        setFact({ ...fact, value: e.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Exact evidence quote</span>
                    <textarea
                      maxLength={500}
                      rows={3}
                      value={fact.quote}
                      onChange={(e) =>
                        setFact({ ...fact, quote: e.target.value })
                      }
                    />
                  </label>
                  {error && (
                    <p role="alert" className="notice warning">
                      {error}
                    </p>
                  )}
                  <button
                    className="primary"
                    disabled={disabled || status === "stale"}
                    onClick={add}
                  >
                    Add pinned fact
                  </button>
                </details>
              </>
            )}
          </section>
          <section className="panel memory-panel">
            <h3>Voice & chapter craft</h3>
            <p className="microcopy">
              Persistent author direction sent with drafting and review. Use
              only writing samples you own or have permission to use; samples
              are a reference, not text to copy.
            </p>
            <div className="two-fields">
              <label className="field">
                <span>Point of view</span>
                <input
                  maxLength={120}
                  value={style.pov}
                  placeholder="Close third person; Akari only"
                  onChange={(e) =>
                    onChange({
                      writingStyle: { ...style, pov: e.target.value },
                    })
                  }
                />
              </label>
              <label className="field">
                <span>Tense</span>
                <input
                  maxLength={80}
                  value={style.tense}
                  placeholder="Past tense"
                  onChange={(e) =>
                    onChange({
                      writingStyle: { ...style, tense: e.target.value },
                    })
                  }
                />
              </label>
            </div>
            <label className="field">
              <span>Voice direction</span>
              <textarea
                rows={3}
                maxLength={2000}
                value={style.voice}
                placeholder="Concrete details, restrained emotion, dry dialogue. Let consequences carry the tension."
                onChange={(e) =>
                  onChange({
                    writingStyle: { ...style, voice: e.target.value },
                  })
                }
              />
            </label>
            <label className="field">
              <span>Phrases / habits to avoid</span>
              <textarea
                rows={2}
                maxLength={1000}
                value={style.avoid}
                onChange={(e) =>
                  onChange({
                    writingStyle: { ...style, avoid: e.target.value },
                  })
                }
              />
            </label>
            <details>
              <summary>Your own style sample</summary>
              <label className="field">
                <span>Author-owned style sample</span>
                <textarea
                  rows={5}
                  maxLength={4000}
                  value={style.sample}
                  onChange={(e) =>
                    onChange({
                      writingStyle: { ...style, sample: e.target.value },
                    })
                  }
                />
              </label>
            </details>
            {prior.at(-1)?.writingStyle && (
              <button
                className="secondary compact"
                onClick={() => {
                  if (
                    confirm(
                      "Replace this book’s style directions with those from the previous volume?",
                    )
                  )
                    onChange({
                      writingStyle: structuredClone(prior.at(-1)!.writingStyle),
                    });
                }}
              >
                Use previous volume’s style
              </button>
            )}
            <h4>Local craft checks</h4>
            {checks.length ? (
              checks.map((f, i) => (
                <div className="notice warning" key={i}>
                  <span>
                    {f.issue}
                    <br />
                    {f.suggestion}
                  </span>
                </div>
              ))
            ) : (
              <p className="microcopy">
                No exact repeated long paragraphs or eight-word opening matches
                found against earlier prose. This is a limited mechanical check,
                not a literary quality score.
              </p>
            )}
          </section>
        </div>
        <aside>
          <section className="panel memory-panel">
            <h3>
              <Search size={17} />
              What the AI can see
            </h3>
            <label className="field">
              <span>Try retrieval search (preview only)</span>
              <input
                value={query}
                maxLength={200}
                placeholder="A clue, character, object or promise…"
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <p className="microcopy">
              With this field empty, retrieval uses the selected chapter’s title
              and brief, just as generation does. Search previews do not change
              the manuscript or AI instructions.
            </p>
            <div className="memory-context-size">
              {d.characters.toLocaleString()} / {d.limit.toLocaleString()}{" "}
              memory characters{" "}
              <strong>
                {d.blocked ? "Needs review" : "Within memory budget"}
              </strong>
            </div>
            <p className="microcopy">
              {d.selectedFacts} facts included · {d.supersededFacts} historical
              state entries superseded · {d.omittedFacts} active facts omitted ·{" "}
              {packet.excerpts.length} raw excerpts · {packet.recaps.length}{" "}
              recaps. Canon and the current prompt use additional space; the
              server’s total request guard still applies.
            </p>
            <button
              className="secondary compact"
              onClick={() =>
                downloadText(
                  "ghost-writer-context-preview.json",
                  JSON.stringify(packet, null, 2),
                  "application/json",
                )
              }
            >
              Download context preview
            </button>
            <h4>Selected facts & pins</h4>
            {[...packet.pinned, ...packet.facts].slice(0, 30).map((f, i) => (
              <article
                className="memory-evidence"
                key={f.source.bookId + f.source.chapterId + f.id + i}
              >
                <small>
                  {f.pinned ? "PINNED · " : ""}
                  {f.source.bookTitle} · Ch {f.source.chapterNumber}
                </small>
                <strong>
                  {f.subject} / {f.key}
                </strong>
                <p>{f.value}</p>
                <details>
                  <summary>Source evidence</summary>
                  <blockquote>{f.quote}</blockquote>
                </details>
              </article>
            ))}
            {d.selectedFacts > 30 && (
              <p className="microcopy">
                First 30 shown; download the packet for all selected facts.
              </p>
            )}
            <h4>Retrieved source passages</h4>
            {!packet.excerpts.length && (
              <p className="microcopy">
                No literal keyword matches. Try a distinctive name or phrase;
                pins and recaps can still provide context.
              </p>
            )}
            {packet.excerpts.map((x, i) => (
              <article className="memory-evidence" key={i}>
                <small>
                  {x.source.bookTitle} · Ch {x.source.chapterNumber} · offset{" "}
                  {x.start}
                </small>
                <p>{x.text}</p>
                <button
                  className="inline-link"
                  onClick={() => onSource(x.source.bookId, x.source.chapterId)}
                >
                  <BookOpen size={13} />
                  {x.source.bookId === book.id
                    ? "Open source chapter"
                    : "Open source book"}
                </button>
              </article>
            ))}
            {packet.previousEnding && (
              <details>
                <summary>Actual previous ending</summary>
                <blockquote>{packet.previousEnding.text}</blockquote>
              </details>
            )}
            {packet.conflicts.map((c, i) => (
              <div className="notice warning" key={i}>
                <span>
                  Possible conflict: {c.subject} / {c.key}:{" "}
                  {c.values.map((v) => v.value).join(" ↔ ")}. Review source
                  ledgers before generation.
                </span>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </section>
  );
}
