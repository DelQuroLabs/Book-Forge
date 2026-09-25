import { useMemo, useState } from "react";
import {
  Search,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Download,
  Save,
  ShieldCheck,
} from "lucide-react";
import { type Book, words } from "../shared/domain";
import {
  searchManuscript,
  canRestoreWhole,
  type ManuscriptHit,
  type RecoveryRecord,
} from "../shared/writing";
import type { DeviceCopy } from "./deviceDrafts";
export function downloadText(name: string, text: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadWorkingDraft(book: Book) {
  downloadText(
    (book.title.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 65) || "manuscript") +
      "-working-draft.md",
    `# ${book.title}\n\n${book.chapters.map((c, i) => `## ${i + 1}. ${c.title}\n\n${c.body || "[Chapter not drafted]"}`).join("\n\n---\n\n")}`,
    "text/markdown",
  );
}
export function WritingTools({
  book,
  chapterId,
  onChapter,
  focus,
  onFocus,
  onSearch,
  onRecovery,
  recoveryCount,
  textSize,
  onTextSize,
  lineSpacing,
  onLineSpacing,
  onSave,
  canSave,
  busy,
}: {
  book: Book;
  chapterId: string;
  onChapter: (id: string) => void;
  focus: boolean;
  onFocus: () => void;
  onSearch: () => void;
  onRecovery: () => void;
  recoveryCount: number;
  textSize: number;
  onTextSize: (n: number) => void;
  lineSpacing: number;
  onLineSpacing: (n: number) => void;
  onSave: () => void;
  canSave: boolean;
  busy: boolean;
}) {
  const index = book.chapters.findIndex((c) => c.id === chapterId),
    chapter = book.chapters[index];
  return (
    <div className="writing-tools" aria-label="Writing tools">
      <div className="writing-jump">
        <button
          className="icon-button"
          aria-label="Previous chapter"
          disabled={index <= 0}
          onClick={() => onChapter(book.chapters[index - 1].id)}
        >
          <ChevronLeft size={18} />
        </button>
        <label>
          <span className="sr-only">Jump to chapter</span>
          <select
            aria-label="Jump to chapter"
            value={chapterId}
            onChange={(e) => onChapter(e.target.value)}
            disabled={!book.chapters.length}
          >
            {!book.chapters.length && <option value="">No chapters yet</option>}
            {book.chapters.map((c, i) => (
              <option key={c.id} value={c.id}>
                {i + 1}. {c.title || "Untitled chapter"}
              </option>
            ))}
          </select>
        </label>
        <button
          className="icon-button"
          aria-label="Next chapter"
          disabled={index < 0 || index >= book.chapters.length - 1}
          onClick={() => onChapter(book.chapters[index + 1].id)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <button
        className="secondary compact"
        onClick={onSearch}
        title="Ctrl/Cmd + Shift + F"
      >
        <Search size={15} />
        Find in book
      </button>
      <button
        className={"secondary compact" + (focus ? " active" : "")}
        aria-pressed={focus}
        onClick={onFocus}
      >
        {focus ? <Minimize2 size={15} /> : <Maximize2 size={15} />}{" "}
        {focus ? "Exit focus" : "Focus mode"}
      </button>
      <label className="writing-setting">
        Text size
        <select
          aria-label="Editor text size"
          value={textSize}
          onChange={(e) => onTextSize(Number(e.target.value))}
        >
          {[16, 18, 20, 22].map((n) => (
            <option key={n} value={n}>
              {n}px
            </option>
          ))}
        </select>
      </label>
      <label className="writing-setting">
        Spacing
        <select
          aria-label="Editor line spacing"
          value={lineSpacing}
          onChange={(e) => onLineSpacing(Number(e.target.value))}
        >
          <option value={1.7}>Compact</option>
          <option value={1.95}>Standard</option>
          <option value={2.2}>Relaxed</option>
        </select>
      </label>
      <button className="secondary compact" onClick={onRecovery}>
        <ShieldCheck size={15} />
        Device drafts{recoveryCount > 0 ? ` (${recoveryCount})` : ""}
      </button>
      <button
        className="icon-button"
        aria-label="Download working draft"
        title="Download all current text, including unsaved edits"
        onClick={() => downloadWorkingDraft(book)}
      >
        <Download size={17} />
      </button>
      {focus && (
        <button
          className="primary compact"
          aria-label="Save manuscript"
          disabled={!canSave}
          onClick={onSave}
        >
          <Save size={15} />
          {busy ? "Saving…" : "Save"}
        </button>
      )}
      {chapter && (
        <span className="writing-readtime">
          {words(chapter.body).toLocaleString()} words · ~
          {Math.ceil(words(chapter.body) / 220)} min read
        </span>
      )}
    </div>
  );
}
export function ManuscriptSearch({
  book,
  onSelect,
}: {
  book: Book;
  onSelect: (hit: ManuscriptHit) => void;
}) {
  const [query, setQuery] = useState(""),
    [matchCase, setMatchCase] = useState(false);
  const results = useMemo(
    () => searchManuscript(book.chapters, query, matchCase),
    [book.chapters, query, matchCase],
  );
  return (
    <div className="manuscript-search">
      <label className="field">
        <span>Search manuscript</span>
        <input
          data-autofocus
          aria-label="Search manuscript"
          type="search"
          value={query}
          maxLength={200}
          placeholder="A name, phrase, or chapter title…"
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={matchCase}
          onChange={(e) => setMatchCase(e.target.checked)}
        />
        Match case
      </label>
      <p className="microcopy">
        Searches chapter titles and prose, including unsaved edits. Literal text
        only; choose a result to select the matching passage.
      </p>
      <p aria-live="polite" className="search-summary">
        {!query.trim()
          ? "Type to search this book."
          : results.truncated
            ? "Showing the first 200 matches. Refine your search."
            : `${results.hits.length} ${results.hits.length === 1 ? "match" : "matches"} found.`}
      </p>
      <div className="manuscript-search-results">
        {results.hits.map((hit, i) => (
          <button
            key={`${hit.chapterId}-${hit.field}-${hit.start}`}
            className="manuscript-search-hit"
            aria-label={`Match ${i + 1}: Chapter ${hit.chapterNumber}, ${hit.field}`}
            onClick={() => onSelect(hit)}
          >
            <strong>
              {hit.chapterNumber}. {hit.chapterTitle || "Untitled chapter"}{" "}
              <small>{hit.field === "title" ? "Title" : "Manuscript"}</small>
            </strong>
            <span>
              {hit.before}
              <mark>{hit.match}</mark>
              {hit.after}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
export function DeviceRecoveryPanel({
  copies,
  server,
  enabled,
  error,
  lastCopy,
  onToggle,
  onRestore,
  onCopyChapter,
  onDiscard,
  blocked,
  appendBlocked,
}: {
  copies: DeviceCopy[];
  server: Book;
  enabled: boolean;
  error: string;
  lastCopy: string;
  onToggle: () => void;
  onRestore: (copy: DeviceCopy) => void;
  onCopyChapter: (record: RecoveryRecord, chapterId: string) => void;
  onDiscard: (copy: DeviceCopy) => void;
  blocked: boolean;
  appendBlocked: boolean;
}) {
  const [selectedKey, setSelectedKey] = useState("");
  const selected = copies.find((c) => c.key === selectedKey) || copies[0];
  return (
    <div className="device-recovery">
      <label className="checkbox">
        <input
          aria-label="Enable recovery on this device"
          type="checkbox"
          checked={enabled}
          onChange={onToggle}
        />
        Keep recovery copies for this book on this device
      </label>
      <p className="microcopy">
        Optional, unencrypted browser storage. Use only on a trusted device.
        Copies are not studio saves, are not shared between devices, and can be
        lost if browser data is cleared. Copies remain after sign-out. Turning
        this off erases this book’s device copies.
      </p>
      {error && <p className="notice warning">{error}</p>}
      {lastCopy && (
        <p className="microcopy">
          Current tab’s latest device copy:{" "}
          {new Date(lastCopy).toLocaleTimeString()}. Press Save to persist it to
          the studio.
        </p>
      )}
      {!copies.length ? (
        <p className="recovery-empty">
          No other device drafts found for this book.
        </p>
      ) : (
        <>
          <label className="field">
            <span>Device copy to review</span>
            <select
              aria-label="Device copy to review"
              value={selected?.key || ""}
              onChange={(e) => setSelectedKey(e.target.value)}
            >
              {copies.map((c) => (
                <option key={c.key} value={c.key}>
                  {new Date(c.record.savedAt).toLocaleString()} · revision{" "}
                  {c.record.baseRev}
                </option>
              ))}
            </select>
          </label>
          {selected && (
            <>
              <p className="microcopy">
                {canRestoreWhole(selected.record, server)
                  ? "This copy is based on the current server revision. Restore loads it into the editor; it does not save automatically."
                  : "The server revision has changed. Whole-book restore is blocked to avoid overwriting newer work. Review or download the copy, or add individual chapters as new drafts."}
              </p>
              <div className="recovery-actions">
                <button
                  className="primary"
                  disabled={
                    blocked || !canRestoreWhole(selected.record, server)
                  }
                  onClick={() => onRestore(selected)}
                >
                  Restore device draft
                </button>
                <button
                  className="secondary"
                  onClick={() =>
                    downloadText(
                      "ghost-writer-device-recovery.json",
                      JSON.stringify(selected.record, null, 2),
                      "application/json",
                    )
                  }
                >
                  Download recovery JSON
                </button>
                <button
                  className="secondary"
                  onClick={() => {
                    if (
                      confirm(
                        "Discard this device copy? This does not change saved studio content.",
                      )
                    )
                      onDiscard(selected);
                  }}
                >
                  Discard this copy
                </button>
              </div>
              {blocked && (
                <p className="microcopy">
                  Finish your current save or pause the active writing job
                  before restoring. Save current edits before replacing a whole
                  draft.
                </p>
              )}
              <div className="recovery-chapters">
                {selected.record.book.chapters.map((c) => (
                  <details key={c.id}>
                    <summary>
                      {c.title || "Untitled chapter"} · {words(c.body)} words
                    </summary>
                    <pre>{c.body || "(Empty chapter)"}</pre>
                    <button
                      className="secondary compact"
                      disabled={appendBlocked}
                      onClick={() => onCopyChapter(selected.record, c.id)}
                    >
                      Add as a new recovered chapter
                    </button>
                  </details>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
export function revealTextSelection(
  editor: HTMLTextAreaElement | HTMLInputElement,
  start: number,
  end: number,
) {
  editor.focus();
  editor.setSelectionRange(start, end);
  if (editor instanceof HTMLTextAreaElement) {
    const style = getComputedStyle(editor),
      mirror = document.createElement("div");
    for (const prop of [
      "font",
      "fontSize",
      "fontFamily",
      "fontWeight",
      "fontStyle",
      "lineHeight",
      "letterSpacing",
      "padding",
      "boxSizing",
      "wordSpacing",
      "textIndent",
    ] as const)
      mirror.style[prop] = style[prop];
    Object.assign(mirror.style, {
      position: "fixed",
      left: "-10000px",
      top: "0",
      width: editor.clientWidth + "px",
      whiteSpace: "pre-wrap",
      overflowWrap: "break-word",
    });
    mirror.textContent = editor.value.slice(0, start);
    const mark = document.createElement("span");
    mark.textContent = editor.value.slice(start, end) || " ";
    mirror.append(mark);
    document.body.append(mirror);
    editor.scrollTop = Math.max(0, mark.offsetTop - editor.clientHeight / 3);
    mirror.remove();
  }
}
