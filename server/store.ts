import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import {
  forge,
  newBook,
  newSeries,
  chapterTemplate,
  type Book,
  type Series,
  type Job,
} from "../shared/domain.js";
export const dataDir = process.env.DATA_DIR || join(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });
export const db = new Database(join(dataDir, "ghost-writer.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");
db.exec(`CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY,kind TEXT NOT NULL,json TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS revisions (id TEXT PRIMARY KEY,book_id TEXT NOT NULL,chapter_id TEXT NOT NULL,title TEXT NOT NULL,body TEXT NOT NULL,created_at TEXT NOT NULL,reason TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY,expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS revision_chapter ON revisions(book_id,chapter_id);
CREATE TABLE IF NOT EXISTS metadata (key TEXT PRIMARY KEY,value TEXT NOT NULL);`);
export function get<T>(id: string, kind?: string): T | undefined {
  const r = (
    kind
      ? db
          .prepare("SELECT json FROM documents WHERE id=? AND kind=?")
          .get(id, kind)
      : db.prepare("SELECT json FROM documents WHERE id=?").get(id)
  ) as { json: string } | undefined;
  return r ? JSON.parse(r.json) : undefined;
}
export function list<T>(kind: string): T[] {
  return (
    db
      .prepare("SELECT json FROM documents WHERE kind=? ORDER BY rowid DESC")
      .all(kind) as { json: string }[]
  ).map((r) => JSON.parse(r.json));
}
export function put(kind: string, o: { id: string }) {
  const existing = db
    .prepare("SELECT kind FROM documents WHERE id=?")
    .get(o.id) as { kind: string } | undefined;
  if (existing && existing.kind !== kind)
    throw new Error("Document ID belongs to another record type.");
  db.prepare(
    "INSERT INTO documents(id,kind,json) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET json=excluded.json",
  ).run(o.id, kind, JSON.stringify(o));
}
export function remove(id: string) {
  db.prepare("DELETE FROM documents WHERE id=?").run(id);
}
export function checkpoint(book: Book, chapterId: string, reason: string) {
  const c = book.chapters.find((c) => c.id === chapterId);
  if (c)
    db.prepare("INSERT INTO revisions VALUES(?,?,?,?,?,?,?)").run(
      randomUUID(),
      book.id,
      c.id,
      c.title,
      c.body,
      new Date().toISOString(),
      reason,
    );
}
export function saveBook(next: Book, reason = "Manual edit") {
  const previous = get<Book>(next.id, "book");
  if (previous && next.rev !== previous.rev)
    throw Object.assign(
      new Error(
        "This book changed in another tab or job. Reload before saving; your local text has not been discarded.",
      ),
      { status: 409 },
    );
  db.transaction(() => {
    if (previous) {
      if (
        previous.bible !== next.bible ||
        JSON.stringify(previous.characters) !==
          JSON.stringify(next.characters) ||
        previous.premise !== next.premise ||
        previous.location !== next.location ||
        previous.era !== next.era
      ) {
        if (previous.chapters.some((c) => c.body))
          next.continuityNotice =
            "Canon, character or setting information changed. Review existing chapters before further generation.";
      }
      for (const c of previous.chapters) {
        const n = next.chapters.find((x) => x.id === c.id);
        if (!n || n.body !== c.body) {
          checkpoint(previous, c.id, reason);
          if (n) {
            n.summary = "";
            n.findings = [];
          }
          next.continuityNotice =
            "Manuscript changed. Generated summaries and review findings for edited chapters were cleared. Review downstream chapters and series canon before continuing.";
        }
      }
    }
    next.rev = (previous?.rev || 0) + 1;
    next.updatedAt = new Date().toISOString();
    put("book", next);
    if (
      previous &&
      next.seriesId &&
      (JSON.stringify(previous.chapters.map((c) => [c.id, c.title, c.body])) !==
        JSON.stringify(next.chapters.map((c) => [c.id, c.title, c.body])) ||
        previous.bible !== next.bible ||
        JSON.stringify(previous.characters) !== JSON.stringify(next.characters))
    ) {
      invalidateLaterBooks(next);
    }
  })();
  return next;
}
export function invalidateLaterBooks(source: Book) {
  if (!source.seriesId) return;
  const series = get<Series>(source.seriesId, "series");
  const n = series?.volumes.findIndex((v) => v.id === source.volumeId) ?? -1;
  if (!series || n < 0) return;
  const future = new Set(series.volumes.slice(n + 1).map((v) => v.id));
  for (const book of list<Book>("book"))
    if (book.seriesId === series.id && future.has(book.volumeId || "")) {
      book.continuityNotice =
        "An earlier series volume changed. Review inherited facts, chronology and downstream chapters; source-linked memory will use the current text.";
      book.rev++;
      book.updatedAt = new Date().toISOString();
      put("book", book);
    }
}
export function saveSeries(next: Series) {
  const prev = get<Series>(next.id, "series");
  if (prev && prev.rev !== next.rev)
    throw Object.assign(
      new Error("This series changed elsewhere. Reload before saving."),
      { status: 409 },
    );
  next.rev = (prev?.rev || 0) + 1;
  next.updatedAt = new Date().toISOString();
  put("series", next);
  return next;
}
export function jobs() {
  return list<Job>("job");
}
export function hasActiveJob(bookId: string) {
  return jobs().some(
    (j) => j.bookId === bookId && ["queued", "running"].includes(j.status),
  );
}
export function updateJob(j: Job, message?: string) {
  j.updatedAt = new Date().toISOString();
  if (message) {
    j.message = message;
    j.events = [...j.events, `${j.updatedAt} · ${message}`].slice(-100);
  }
  put("job", j);
}
export function seedDemo() {
  if (
    process.env.DEMO_MODE !== "true" ||
    db.prepare("SELECT value FROM metadata WHERE key='demo-seeded'").get()
  )
    return;
  const c = forge({
    seed: "quiet-protocol",
    genre: "LitRPG",
    culture: "ja",
    location: "Kyoto, Japan · after the system",
    era: "Post-system",
  });
  c.title = "The Quiet Protocol";
  c.protagonist = "Ueno Akari";
  c.role = "infrastructure mechanic";
  c.goal = "restore the district’s flood defenses";
  c.opposition = "a salvage guild hoarding the repair cores";
  c.stakes = "an approaching dungeon surge will swallow the district";
  c.system =
    "Repair class. Transfer durability between compatible objects, spending stamina and spare parts. No free materials; no repeat XP for trivial repairs.";
  c.premise =
    "When Kyoto’s hidden repair system begins to fail, an unlicensed mechanic discovers that the lowest-ranked class may be the only one capable of saving her district.";
  const series = newSeries(c, 3);
  series.title = "The Unwritten System";
  series.volumes[1].title = "The City Beneath";
  series.volumes[2].title = "What the System Forgot";
  series.threads = [
    {
      id: randomUUID(),
      name: "Who wrote the first repair protocol?",
      setup: series.volumes[0].id,
      payoff: series.volumes[2].id,
      resolved: false,
    },
  ];
  saveSeries(series);
  const b = newBook(c, series.id, series.volumes[0].id);
  b.sample = true;
  b.characters = series.characters;
  b.color = 0;
  b.chapters = [chapterTemplate(1), chapterTemplate(2), chapterTemplate(3)];
  b.chapters[0].title = "A crack in the ordinary";
  b.chapters[0].brief =
    "Introduce Akari at the floodgate. The system reports success, but the physical repair fails. Establish the cost of her ability.";
  b.chapters[0].body =
    "The gate had been repaired three times. Ueno Akari knew because she had signed for every one of them.\n\nOn the fourth morning, she found water climbing the inspection stairs.\n\nShe lowered her tool bag onto the only dry step and waited for the familiar blue text to settle at the edge of her vision.\n\n[STRUCTURAL INTEGRITY: 100%]\n\nBelow it, through a seam wide enough to admit her smallest finger, the river continued to pour.\n\n“Then you won’t mind,” she said to the empty control room, “if I check your work.”";
  b.chapters[0].status = "draft";
  b.chapters[1].title = "The price of a borrowed skill";
  b.chapters[1].brief =
    "Akari tests durability transfer and discovers that every repair must take material strength from somewhere else.";
  b.chapters[2].title = "An inconvenient ledger";
  b.chapters[2].brief =
    "A surveyor brings evidence of missing salvage cores. The city’s safety reports do not match the physical inventory.";
  saveBook(b);
  const d = forge({
    seed: "last-orbit",
    genre: "Science fiction",
    culture: "mx",
    location: "Orbital habitat Aurora",
    era: "Near future",
  });
  d.title = "A Map of Distant Suns";
  const b2 = newBook(d);
  b2.color = 1;
  b2.sample = true;
  b2.targetWords = 80000;
  saveBook(b2);
  const e = forge({
    seed: "glass-house",
    genre: "Mystery",
    culture: "fr",
    location: "Lyon, France",
    era: "Contemporary",
  });
  e.title = "The Glass Archive";
  const b3 = newBook(e);
  b3.color = 2;
  b3.sample = true;
  b3.targetWords = 50000;
  saveBook(b3);
  db.prepare("INSERT INTO metadata VALUES(?,?)").run("demo-seeded", "true");
}
