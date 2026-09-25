import { test } from "node:test";
import assert from "node:assert/strict";
import {
  forge,
  newBook,
  chapterTemplate,
  BookSchema,
} from "../shared/domain.js";
import {
  searchManuscript,
  retainNewerEdits,
  RecoverySchema,
  canRestoreWhole,
  recoveredChapter,
  type RecoveryRecord,
} from "../shared/writing.js";
import {
  deviceKey,
  writeDeviceCopy,
  readDeviceCopies,
  clearBookCopies,
  deviceRecoveryEnabled,
  preferenceKey,
  type DraftStorage,
} from "../src/deviceDrafts.js";
function book() {
  const b = newBook(
    forge({
      seed: "writing-test",
      genre: "LitRPG",
      culture: "ja",
      location: "Kyoto, Japan",
      era: "Contemporary",
    }),
  );
  b.chapters = [
    {
      ...chapterTemplate(1),
      title: "The [Gate]",
      body: "😀 café CAFÉ [gate]. 你好。",
      summary: "Old summary",
    },
  ];
  return b;
}
function record(): RecoveryRecord {
  const b = book();
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    baseRev: b.rev,
    chapterId: b.chapters[0].id,
    book: b,
  };
}
class MemoryStorage implements DraftStorage {
  data = new Map<string, string>();
  blocked = false;
  get length() {
    return this.data.size;
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    if (this.blocked) throw Error("Quota exceeded");
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}
test("manuscript search is literal, Unicode-aware and reports selectable UTF16 offsets", () => {
  const b = book();
  const a = searchManuscript(b.chapters, "[gate]");
  assert.equal(a.hits.length, 2);
  assert.equal(a.hits[1].field, "body");
  const hits = searchManuscript(b.chapters, "café").hits;
  assert.equal(hits.length, 2);
  assert.equal(hits[0].start, 3);
  assert.equal(b.chapters[0].body.slice(hits[1].start, hits[1].end), "CAFÉ");
  assert.equal(searchManuscript(b.chapters, "café", true).hits.length, 1);
  assert.equal(searchManuscript(b.chapters, "你好").hits.length, 1);
  assert.equal(searchManuscript(b.chapters, ".*").hits.length, 0);
  assert.equal(searchManuscript(b.chapters, " ").hits.length, 0);
});
test("search caps results only when additional matches exist", () => {
  const b = book();
  b.chapters[0].body = "x".repeat(200);
  assert.equal(searchManuscript(b.chapters, "x").truncated, false);
  b.chapters[0].body += "x";
  const r = searchManuscript(b.chapters, "x");
  assert.equal(r.hits.length, 200);
  assert.equal(r.truncated, true);
});
test("save merge retains typing and metadata changes while adopting server revision", () => {
  const submitted = book(),
    current = structuredClone(submitted),
    saved = structuredClone(submitted);
  current.chapters[0].body = "Typed during save";
  current.title = "Renamed during save";
  saved.rev++;
  saved.continuityNotice = "Review downstream";
  saved.chapters[0].summary = "Server summary";
  const next = retainNewerEdits(submitted, current, saved);
  assert.equal(next.rev, saved.rev);
  assert.equal(next.title, current.title);
  assert.equal(next.chapters[0].body, current.chapters[0].body);
  assert.equal(next.chapters[0].summary, "");
  assert.equal(next.continuityNotice, "Review downstream");
  assert.deepEqual(retainNewerEdits(submitted, submitted, saved), saved);
  assert.equal(submitted.chapters[0].summary, "Old summary");
});
test("save merge preserves post-submit chapter additions, deletions and ordering", () => {
  const submitted = book();
  submitted.chapters.push(chapterTemplate(2));
  const saved = structuredClone(submitted);
  saved.rev++;
  const current = structuredClone(submitted),
    added = chapterTemplate(3);
  current.chapters = [added, current.chapters[1]];
  current.chapters[1].brief = "Changed direction";
  const next = retainNewerEdits(submitted, current, saved);
  assert.deepEqual(
    next.chapters.map((c) => c.id),
    [added.id, submitted.chapters[1].id],
  );
  assert.equal(next.chapters[1].brief, "Changed direction");
  assert.throws(() =>
    retainNewerEdits(submitted, { ...current, id: "other" }, saved),
  );
});
test("recovery validation and revision rules prevent whole-book stale restores", () => {
  const r = record();
  assert.equal(RecoverySchema.safeParse(r).success, true);
  assert.equal(canRestoreWhole(r, r.book), true);
  assert.equal(canRestoreWhole(r, { ...r.book, rev: r.baseRev + 1 }), false);
  assert.equal(canRestoreWhole(r, { ...r.book, id: "other" }), false);
  assert.equal(
    RecoverySchema.safeParse({ ...r, baseRev: r.baseRev + 1 }).success,
    false,
  );
  assert.equal(
    RecoverySchema.safeParse({ ...r, savedAt: "bad date" }).success,
    false,
  );
  const c = recoveredChapter(r.book.chapters[0], "new-id");
  assert.notEqual(c.id, r.book.chapters[0].id);
  assert.equal(c.summary, "");
  assert.deepEqual(c.findings, []);
  assert.match(c.title, /recovered/);
  assert.equal(
    BookSchema.safeParse({ ...r.book, chapters: [c] }).success,
    true,
  );
});
test("device copies isolate books and writers, default off and retain last copy on quota failure", () => {
  const store = new MemoryStorage(),
    r = record(),
    key = deviceKey(r.book.id, "writer-a");
  assert.equal(deviceRecoveryEnabled(store, r.book.id), false);
  store.setItem(preferenceKey(r.book.id), "true");
  assert.equal(deviceRecoveryEnabled(store, r.book.id), true);
  writeDeviceCopy(store, key, r);
  writeDeviceCopy(store, deviceKey(r.book.id, "writer-b"), r);
  const original = store.getItem(key);
  store.blocked = true;
  assert.throws(() =>
    writeDeviceCopy(store, key, {
      ...r,
      savedAt: new Date(Date.now() + 1000).toISOString(),
    }),
  );
  assert.equal(store.getItem(key), original);
  assert.equal(readDeviceCopies(store, r.book.id).copies.length, 2);
  store.blocked = false;
  const other = { ...r, book: { ...r.book, id: r.book.id + ":other" } };
  writeDeviceCopy(store, deviceKey(other.book.id, "writer-a"), other);
  store.setItem(deviceKey(r.book.id, "broken"), "{");
  assert.equal(readDeviceCopies(store, r.book.id).unreadable, 1);
  clearBookCopies(store, r.book.id);
  assert.equal(readDeviceCopies(store, r.book.id).copies.length, 0);
  assert.equal(readDeviceCopies(store, other.book.id).copies.length, 1);
});
