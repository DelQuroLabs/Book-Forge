import { test } from "node:test";
import assert from "node:assert/strict";
import {
  forge,
  newBook,
  newSeries,
  chapterTemplate,
  BookSchema,
  type Chapter,
} from "../shared/domain.js";
import {
  makeMemory,
  memoryStatus,
  buildMemoryPacket,
  chapterHash,
  validateBookMemory,
  craftChecks,
  type MemoryFact,
} from "../shared/story-memory.js";
function concept() {
  return forge({
    seed: "continuity-regression",
    genre: "LitRPG",
    culture: "ja",
    location: "Kyoto",
    era: "Contemporary",
  });
}
function chapter(n: number, body: string) {
  return { ...chapterTemplate(n), body };
}
function remember(
  c: Chapter,
  subject: string,
  key: string,
  value: string,
  category: MemoryFact["category"] = "state",
  pin = false,
) {
  c.memory = makeMemory(c, {
    summary: c.body.slice(0, 180),
    facts: [{ category, subject, key, value, quote: c.body.slice(0, 200) }],
  });
  c.memory.facts[0].pinned = pin;
  return c;
}
test("chapter 23 retrieves and carries a pinned fact from chapter 1, with exact evidence and no chapter 24 leakage", () => {
  const b = newBook(concept());
  b.chapters = Array.from({ length: 24 }, (_, i) =>
    chapter(i + 1, `Ordinary journey stage ${i + 1}.`),
  );
  b.chapters[0] = remember(
    chapter(1, "The obsidian seal only answers to three knocks."),
    "obsidian seal",
    "opening rule",
    "three knocks",
    "world-rule",
    true,
  );
  b.chapters[22].brief =
    "Return to the obsidian seal and use the opening rule.";
  b.chapters[23].body = "FUTURE_SECRET_NOT_YET_REVEALED";
  const p = buildMemoryPacket(b, b.chapters[22].id, undefined, [b]);
  assert.equal(p.diagnostics.eligibleChapters, 22);
  assert.equal(p.pinned[0].value, "three knocks");
  assert.equal(p.pinned[0].source.chapterNumber, 1);
  assert.ok(p.excerpts.some((x) => x.text.includes("three knocks")));
  assert.ok(!JSON.stringify(p).includes("FUTURE_SECRET_NOT_YET_REVEALED"));
  assert.equal(p.diagnostics.blocked, false);
});
test("raw retrieval finds early unindexed prose rather than relying only on summaries", () => {
  const b = newBook(concept());
  b.chapters = [
    chapter(1, "The cobalt inventory contains exactly seven cores."),
    ...Array.from({ length: 22 }, (_, i) =>
      chapter(i + 2, "A different journey with no inventory."),
    ),
  ];
  b.chapters[22].brief = "Inspect cobalt cores";
  const p = buildMemoryPacket(b, b.chapters[22].id, undefined, [b]);
  assert.ok(
    p.excerpts.some(
      (x) => x.source.chapterNumber === 1 && x.text.includes("seven cores"),
    ),
  );
  assert.equal(p.diagnostics.missing, 22);
  assert.equal(p.diagnostics.current, 0);
});
test("book four inherits book-one history, selects the latest changing state, excludes future volumes and follows stable-ID reading order", () => {
  const s = newSeries(concept(), 5),
    books = s.volumes.map((v, i) => {
      const b = newBook(concept(), s.id, v.id);
      b.title = `Volume ${i + 1}`;
      b.chapters = [chapter(1, `Book ${i + 1} prose.`)];
      return b;
    });
  books[0].chapters[0] = remember(
    chapter(1, "Maren was alive when she entrusted the glass compass to Jun."),
    "Maren",
    "alive",
    "yes",
  );
  books[2].chapters[0] = remember(
    chapter(1, "Maren died protecting the glass compass."),
    "Maren",
    "alive",
    "no",
  );
  books[4].chapters[0] = remember(
    chapter(1, "FUTURE_MAREN_RETURN"),
    "Maren",
    "alive",
    "resurrected",
  );
  const p = buildMemoryPacket(
    books[3],
    books[3].chapters[0].id,
    s,
    books,
    "glass compass",
  );
  assert.equal(p.diagnostics.eligibleBooks, 3);
  assert.equal(p.facts.find((f) => f.subject === "Maren")?.value, "no");
  assert.equal(p.diagnostics.supersededFacts, 1);
  assert.ok(p.excerpts.some((x) => x.source.bookId === books[0].id));
  assert.ok(!JSON.stringify(p).includes("FUTURE_MAREN_RETURN"));
  s.volumes = [
    s.volumes[2],
    s.volumes[0],
    s.volumes[1],
    s.volumes[3],
    s.volumes[4],
  ];
  const reordered = buildMemoryPacket(
    books[3],
    books[3].chapters[0].id,
    s,
    books,
  );
  assert.equal(
    reordered.facts.find((f) => f.subject === "Maren")?.value,
    "yes",
  );
});
test("edits invalidate source-hashed memory and stale pins block generation rather than being silently omitted", () => {
  const b = newBook(concept());
  b.chapters = [
    remember(
      chapter(1, "The vial contains seven drops."),
      "vial",
      "quantity",
      "seven",
      "resource",
      true,
    ),
    chapter(2, ""),
  ];
  const oldHash = chapterHash(b.chapters[0]);
  b.chapters[0].body = "The vial contains only two drops.";
  assert.notEqual(chapterHash(b.chapters[0]), oldHash);
  assert.equal(memoryStatus(b.chapters[0]), "stale");
  const p = buildMemoryPacket(b, b.chapters[1].id, undefined, [b], "vial");
  assert.equal(p.diagnostics.stale, 1);
  assert.equal(p.diagnostics.blocked, true);
  assert.equal(p.pinned.length, 0);
  assert.ok(!p.facts.some((f) => f.value === "seven"));
  assert.ok(p.excerpts.some((e) => e.text.includes("two drops")));
});
test("only exact evidence quotes are accepted; refreshing unchanged memory retains reviewed pins and legacy books remain valid", () => {
  const b = newBook(concept()),
    c = remember(
      chapter(1, "Jun carries a glass compass."),
      "Jun",
      "inventory",
      "glass compass",
      "resource",
      true,
    );
  const result = makeMemory(c, {
    summary: "Jun carries a compass.",
    facts: [
      {
        category: "identity",
        subject: "Jun",
        key: "eyes",
        value: "blue",
        quote: "Jun has blue eyes.",
      },
    ],
  });
  assert.equal(result.rejectedFacts, 1);
  assert.equal(result.facts.length, 1);
  assert.equal(result.facts[0].pinned, true);
  c.memory = result;
  b.chapters = [c];
  assert.doesNotThrow(() => validateBookMemory(b));
  c.memory.facts[0].quote = "fabricated quotation";
  assert.throws(() => validateBookMemory(b), /evidence/);
  delete c.memory;
  assert.ok(BookSchema.safeParse(b).success);
});
test("contradictory immutable facts are visible and context-budget pressure cannot silently drop pins", () => {
  const b = newBook(concept());
  b.chapters = [
    remember(
      chapter(1, "Jun has blue eyes."),
      "Jun",
      "eyes",
      "blue",
      "identity",
      true,
    ),
    remember(
      chapter(2, "Jun has green eyes."),
      "Jun",
      "eyes",
      "green",
      "identity",
    ),
    chapter(3, ""),
  ];
  const p = buildMemoryPacket(b, b.chapters[2].id, undefined, [b]);
  assert.equal(p.conflicts.length, 1);
  assert.equal(p.diagnostics.blocked, true);
  const tiny = buildMemoryPacket(
    b,
    b.chapters[2].id,
    undefined,
    [b],
    undefined,
    600,
  );
  assert.equal(tiny.diagnostics.blocked, true);
  assert.equal(tiny.pinned.length, 1);
  assert.ok(tiny.diagnostics.warnings.some((w) => w.includes("budget")));
});
test("local craft checks report long repeated passages but do not present ordinary short phrases as plagiarism", () => {
  const text =
    "Jun checked each broken latch carefully before opening the gate, counting the seven spare cores and recording every missing part in the old ledger.";
  const a = chapter(1, text),
    b = chapter(2, text);
  assert.equal(craftChecks(b, [a]).length, 2);
  assert.equal(
    craftChecks(chapter(3, "He opened the gate."), [
      chapter(1, "He opened the gate."),
    ]).length,
    0,
  );
});
