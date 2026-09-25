import { makeMemory, memoryStatus } from "../shared/story-memory.js";
import { roadmapFor } from "../shared/series-planning.js";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { once } from "node:events";
import {
  forge,
  newBook,
  newSeries,
  chapterTemplate,
  type Book,
  type Job,
} from "../shared/domain.js";
const dir = mkdtempSync(join(tmpdir(), "ghost-writer-tests-"));
process.env.DATA_DIR = dir;
process.env.NODE_ENV = "test";
process.env.DEMO_MODE = "false";
process.env.OPENAI_API_KEY = "synthetic-test-value";
process.env.OPENAI_MODEL = "synthetic-model";
process.env.ENABLE_PAID_GENERATION = "true";
process.env.OPENAI_INPUT_PRICE_PER_MILLION = "1";
process.env.OPENAI_OUTPUT_PRICE_PER_MILLION = "1";
let responseMode = "ok",
  calls: string[] = [],
  pauseId = "";
let mutateSource: (() => void) | null = null;
const server = createServer(async (req, res) => {
  let body = "";
  for await (const chunk of req) body += chunk;
  const data = JSON.parse(body);
  calls.push(data.input);
  if (mutateSource) {
    const mutate = mutateSource;
    mutateSource = null;
    mutate();
  }
  if (pauseId) {
    const j = store.get<Job>(pauseId)!;
    j.status = "paused";
    store.updateJob(j);
    pauseId = "";
  }
  let value: unknown = {};
  if (data.text.format.name === "book_plan")
    value = {
      bible:
        "Synthetic rule bible. Names, events and resources remain consistent with the approved series canon.",
      chapters: [
        {
          title: "First gate",
          brief: "Establish the protagonist and the first causal obstacle.",
        },
        {
          title: "Second gate",
          brief: "Resolve the immediate obstacle with established skills.",
        },
      ],
    };
  else if (data.text.format.name === "chapter_draft")
    value = {
      body: "Synthetic fixture prose for testing, not generated literary output. The protagonist repairs the damaged gate using only the parts already in the inventory. The cost is paid and the consequence changes the next decision.",
      memory: {
        summary:
          "The protagonist repairs the gate using existing materials; resources are consumed.",
        facts: [
          {
            category: "resource",
            subject: "protagonist",
            key: "repair cost",
            value: "existing inventory parts consumed",
            quote: "The cost is paid",
          },
        ],
      },
    };
  else if (data.text.format.name === "chapter_memory")
    value = {
      summary: "A source-only synthetic extraction recap.",
      facts: [
        {
          category: "event",
          subject: "protagonist",
          key: "repair",
          value: "the cost is paid",
          quote: "The cost is paid",
        },
        {
          category: "identity",
          subject: "invented",
          key: "eyes",
          value: "green",
          quote: "THIS IS NOT IN THE SOURCE",
        },
      ],
    };
  else
    value = {
      findings: [
        {
          quote: "The cost is paid",
          issue: "Show the specific resource cost.",
          suggestion: "Two spare cores are consumed",
          severity: "medium",
        },
      ],
    };
  res.setHeader("Content-Type", "application/json");
  if (responseMode === "ambiguous") {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: { code: "server_error" } }));
  } else if (responseMode === "error") {
    res.statusCode = 429;
    res.end(JSON.stringify({ error: { code: "rate_limit" } }));
  } else if (responseMode === "invalid") {
    res.end(
      JSON.stringify({
        status: "completed",
        output: [{ content: [{ type: "output_text", text: "not-json" }] }],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    );
  } else if (responseMode === "refusal") {
    res.end(
      JSON.stringify({
        status: "completed",
        output: [{ content: [{ type: "refusal" }] }],
        usage: { input_tokens: 10, output_tokens: 20 },
      }),
    );
  } else
    res.end(
      JSON.stringify({
        status: "completed",
        output: [
          { content: [{ type: "output_text", text: JSON.stringify(value) }] },
        ],
        usage: { input_tokens: 100, output_tokens: 200 },
      }),
    );
});
server.listen(0, "127.0.0.1");
await once(server, "listening");
process.env.OPENAI_TEST_ENDPOINT = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
const store = await import("../server/store.js");
const worker = await import("../server/worker.js");
function make() {
  const c = forge({
    seed: "test",
    genre: "LitRPG",
    culture: "ja",
    location: "Kyoto",
    era: "Contemporary",
  });
  const b = newBook(c);
  b.chapterCount = 2;
  store.saveBook(b);
  return b;
}
const opts = {
  kind: "autopilot" as const,
  budget: 5,
  maxRequests: 10,
  maxOutputTokens: 3000,
  confirmed: true as const,
};
after(() => {
  server.close();
  store.db.close();
  rmSync(dir, { recursive: true, force: true });
});
test("chapter saves preserve revisions and reject stale updates", () => {
  const b = make();
  b.chapters = [chapterTemplate(1)];
  b.chapters[0].body = "Original chapter";
  store.saveBook(b);
  const stale = structuredClone(b);
  b.chapters[0].body = "Revised chapter";
  store.saveBook(b);
  assert.match(b.continuityNotice, /changed/);
  const rows = store.db
    .prepare("SELECT body FROM revisions WHERE book_id=?")
    .all(b.id) as { body: string }[];
  assert.ok(rows.some((r) => r.body === "Original chapter"));
  assert.throws(() => store.saveBook(stale), /another tab/);
});
test("different document types cannot reuse an existing ID", () => {
  const b = make();
  assert.throws(() => store.put("series", { id: b.id }), /record type/);
});
test("autopilot plans and drafts sequentially with series canon and approved cultural names", async () => {
  calls = [];
  responseMode = "ok";
  const b = make(),
    s = newSeries(b.concept!, 2);
  s.canon = "Never resurrect characters. Preserve family-name-first display.";
  s.characters[0].name = "Ueno Akari";
  s.roadmap = {
    ...roadmapFor(s),
    centralConflict: "Control of the repair network",
    endgame: "The district gains shared ownership",
    milestones: [
      {
        id: "future-reveal",
        title: "Origin revealed",
        volumeId: s.volumes[1].id,
        timeAnchor: "Second winter",
        consequence: "The first system author is identified",
      },
    ],
    characterArcs: [
      {
        id: "shared-arc",
        characterId: s.characters[0].id,
        startingState: "Distrusts help",
        endingState: "Builds a repair cooperative",
        beats: [{ volumeId: s.volumes[0].id, change: "Accepts one ally" }],
      },
    ],
  };
  store.saveSeries(s);
  b.seriesId = s.id;
  b.volumeId = s.volumes[0].id;
  store.saveBook(b);
  const j = worker.createRun(b, opts);
  await worker.tick();
  const done = store.get<Job>(j.id)!,
    saved = store.get<Book>(b.id)!;
  assert.equal(done.status, "done");
  assert.equal(done.requests, 3);
  assert.equal(done.steps, 3);
  assert.ok(done.spent > 0);
  assert.equal(done.uncertain, 0);
  assert.equal(saved.chapters.length, 2);
  assert.ok(saved.chapters.every((c) => c.body.length > 100));
  assert.ok(
    calls.every((c) => c.includes("Ueno Akari") && c.includes(s.canon)),
  );
  assert.match(calls[2], /Synthetic fixture prose/);
  assert.ok(
    calls.every(
      (c) =>
        c.includes("The district gains shared ownership") &&
        c.includes("Origin revealed") &&
        c.includes("Accepts one ally") &&
        c.includes("not facts already known"),
    ),
  );
});
test("budget guard prevents a request before it is sent", async () => {
  const b = make();
  b.bible = "long canon ".repeat(12000);
  store.saveBook(b);
  const before = calls.length,
    j = worker.createRun(b, { ...opts, budget: 0.1 });
  await worker.tick();
  assert.equal(store.get<Job>(j.id)?.status, "failed");
  assert.match(store.get<Job>(j.id)!.message, /Budget guard/);
  assert.equal(calls.length, before);
});
test("request cap retains completed work and stops remaining chapters", async () => {
  const b = make(),
    j = worker.createRun(b, { ...opts, maxRequests: 2 });
  await worker.tick();
  assert.equal(store.get<Job>(j.id)?.status, "failed");
  assert.equal(store.get<Book>(b.id)?.chapters.filter((c) => c.body).length, 1);
  assert.match(store.get<Job>(j.id)!.message, /Request limit/);
});
test("pause during in-flight request records usage but does not commit output", async () => {
  const b = make(),
    j = worker.createRun(b, opts);
  pauseId = j.id;
  await worker.tick();
  const p = store.get<Job>(j.id)!;
  assert.equal(p.status, "paused");
  assert.equal(p.uncertain, 0);
  assert.ok(p.spent > 0);
  assert.equal(store.get<Book>(b.id)?.chapters.length, 0);
});
test("restart recovery pauses interrupted jobs rather than automatically spending", () => {
  const b = make(),
    j = worker.createRun(b, opts);
  j.status = "running";
  j.uncertain = 0.2;
  store.updateJob(j);
  worker.recoverJobs();
  assert.equal(store.get<Job>(j.id)?.status, "paused");
  assert.equal(store.get<Job>(j.id)?.uncertain, 0.2);
});
test("refusals and invalid structured output cannot replace manuscripts", async () => {
  for (const mode of ["refusal", "invalid"]) {
    responseMode = mode;
    const b = make(),
      j = worker.createRun(b, { ...opts, kind: "plan" });
    await worker.tick();
    assert.equal(store.get<Job>(j.id)?.status, "failed");
    assert.equal(store.get<Book>(b.id)?.chapters.length, 0);
  }
  responseMode = "ok";
});
test("rate limit is visible and does not enter an automatic paid retry loop", async () => {
  responseMode = "error";
  const before = calls.length,
    b = make(),
    j = worker.createRun(b, opts);
  await worker.tick();
  assert.equal(calls.length, before + 1);
  assert.equal(store.get<Job>(j.id)?.status, "failed");
  assert.match(store.get<Job>(j.id)!.message, /429/);
  responseMode = "ok";
});
test("resuming a committed single-step job does not generate twice", async () => {
  const b = make(),
    j = worker.createRun(b, { ...opts, kind: "plan" });
  j.steps = 1;
  store.updateJob(j);
  const before = calls.length;
  await worker.tick();
  assert.equal(calls.length, before);
  assert.equal(store.get<Job>(j.id)?.status, "done");
});
test("demo mode and missing credentials are honest disabled states", () => {
  process.env.DEMO_MODE = "true";
  assert.equal(worker.readiness().ready, false);
  assert.match(worker.readiness().reason, /Preview/);
  process.env.DEMO_MODE = "false";
  delete process.env.OPENAI_API_KEY;
  assert.equal(worker.readiness().ready, false);
  process.env.OPENAI_API_KEY = "synthetic-test-value";
});

test("ambiguous server failures preserve uncertain spend and never retry automatically", async () => {
  responseMode = "ambiguous";
  const before = calls.length,
    b = make(),
    j = worker.createRun(b, opts);
  await worker.tick();
  assert.equal(calls.length, before + 1);
  assert.equal(store.get<Job>(j.id)?.status, "failed");
  assert.ok(store.get<Job>(j.id)!.uncertain > 0);
  assert.equal(store.get<Book>(b.id)?.chapters.length, 0);
  responseMode = "ok";
});

test("memory-only jobs checkpoint extracted evidence without rewriting prose, and discard unsupported quotations", async () => {
  const b = make();
  b.chapters = [chapterTemplate(1), chapterTemplate(2)];
  for (const c of b.chapters)
    c.body =
      "The cost is paid with existing spare cores. The inventory remains finite.";
  store.saveBook(b);
  const before = b.chapters.map((c) => c.body),
    j = worker.createRun(b, { ...opts, kind: "memory" });
  await worker.tick();
  const saved = store.get<Book>(b.id)!;
  assert.equal(store.get<Job>(j.id)?.status, "done");
  assert.deepEqual(
    saved.chapters.map((c) => c.body),
    before,
  );
  assert.ok(
    saved.chapters.every(
      (c) =>
        memoryStatus(c) === "current" &&
        c.memory?.facts.length === 1 &&
        c.memory.rejectedFacts === 1,
    ),
  );
  const oldCalls = calls.length;
  assert.throws(
    () => worker.createRun(saved, { ...opts, kind: "memory" }),
    /No written chapters/,
  );
  assert.equal(calls.length, oldCalls);
});
test("actual draft and review requests include chapter-one facts at chapter23, voice direction and prior-book memory", async () => {
  const b = make(),
    s = newSeries(b.concept!, 4);
  store.saveSeries(s);
  const earlier = newBook(b.concept!, s.id, s.volumes[0].id);
  earlier.chapters = [chapterTemplate(1)];
  earlier.chapters[0].body =
    "SERIES_ANCHOR: Maren died guarding the glass compass.";
  earlier.chapters[0].memory = makeMemory(earlier.chapters[0], {
    summary: "Maren died.",
    facts: [
      {
        category: "state",
        subject: "Maren",
        key: "alive",
        value: "no",
        quote: earlier.chapters[0].body,
      },
    ],
  });
  earlier.chapters[0].memory.facts[0].pinned = true;
  store.saveBook(earlier);
  b.seriesId = s.id;
  b.volumeId = s.volumes[3].id;
  b.writingStyle = {
    pov: "Close third person",
    tense: "Past",
    voice: "VOICE_ANCHOR: terse and concrete",
    sample: "",
    avoid: "Avoid repeated atmospheric openings.",
  };
  b.chapters = Array.from({ length: 23 }, (_, i) => chapterTemplate(i + 1));
  b.chapters[0].body =
    "CHAPTER_ONE_ANCHOR: The seal opens only after three knocks.";
  b.chapters[0].memory = makeMemory(b.chapters[0], {
    summary: "The seal needs three knocks.",
    facts: [
      {
        category: "world-rule",
        subject: "seal",
        key: "opening",
        value: "three knocks",
        quote: b.chapters[0].body,
      },
    ],
  });
  b.chapters[0].memory.facts[0].pinned = true;
  b.chapters[22].brief = "Use the seal and glass compass.";
  store.saveBook(b);
  const j = worker.createRun(b, {
    ...opts,
    kind: "draft",
    chapterId: b.chapters[22].id,
  });
  await worker.tick();
  assert.equal(store.get<Job>(j.id)?.status, "done");
  const prompt = calls.at(-1)!;
  for (const text of [
    "CHAPTER_ONE_ANCHOR",
    "SERIES_ANCHOR",
    "VOICE_ANCHOR",
    "FUTURE BEATS — OFF LIMITS",
  ])
    assert.ok(prompt.includes(text), text);
  assert.equal(memoryStatus(store.get<Book>(b.id)!.chapters[22]), "current");
  const saved = store.get<Book>(b.id)!;
  const review = worker.createRun(saved, {
    ...opts,
    kind: "review",
    chapterId: saved.chapters[22].id,
  });
  await worker.tick();
  assert.equal(store.get<Job>(review.id)?.status, "done");
  assert.ok(calls.at(-1)!.includes("CHAPTER_ONE_ANCHOR"));
});
test("editing an earlier volume during generation prevents committing a result built on stale series memory", async () => {
  const b = make(),
    s = newSeries(b.concept!, 2);
  store.saveSeries(s);
  const prior = newBook(b.concept!, s.id, s.volumes[0].id);
  prior.chapters = [
    { ...chapterTemplate(1), body: "Earlier immutable source prose." },
  ];
  store.saveBook(prior);
  b.seriesId = s.id;
  b.volumeId = s.volumes[1].id;
  b.chapters = [chapterTemplate(1)];
  store.saveBook(b);
  mutateSource = () => {
    const fresh = store.get<Book>(prior.id)!;
    fresh.chapters[0].body = "Changed earlier source prose.";
    store.saveBook(fresh);
  };
  const j = worker.createRun(b, {
    ...opts,
    kind: "draft",
    chapterId: b.chapters[0].id,
  });
  await worker.tick();
  assert.equal(store.get<Job>(j.id)?.status, "failed");
  assert.match(store.get<Job>(j.id)!.message, /earlier book|Book changed/);
  assert.equal(store.get<Book>(b.id)!.chapters[0].body, "");
  assert.match(
    store.get<Book>(b.id)!.continuityNotice,
    /earlier series volume/,
  );
});
test("stale pinned evidence prevents memory refresh until author review; extraction remains separately budgeted", () => {
  const b = make();
  b.chapters = [{ ...chapterTemplate(1), body: "The cost is paid." }];
  b.chapters[0].memory = makeMemory(b.chapters[0], {
    summary: "Cost paid.",
    facts: [
      {
        category: "event",
        subject: "cost",
        key: "paid",
        value: "yes",
        quote: "The cost is paid.",
      },
    ],
  });
  b.chapters[0].memory.facts[0].pinned = true;
  b.chapters[0].body = "The cost is not paid.";
  store.saveBook(b);
  assert.throws(
    () => worker.createRun(b, { ...opts, kind: "memory" }),
    /Unpin stale facts/,
  );
});

test("memory request caps retain completed ledgers and a new missing-only run skips them", async () => {
  const b = make();
  b.chapters = [chapterTemplate(1), chapterTemplate(2)];
  for (const c of b.chapters) c.body = "The cost is paid from the inventory.";
  store.saveBook(b);
  const before = calls.length;
  const limited = worker.createRun(b, {
    ...opts,
    kind: "memory",
    maxRequests: 1,
  });
  await worker.tick();
  const partial = store.get<Book>(b.id)!;
  assert.equal(store.get<Job>(limited.id)?.status, "failed");
  assert.equal(calls.length, before + 1);
  assert.equal(memoryStatus(partial.chapters[0]), "current");
  assert.equal(memoryStatus(partial.chapters[1]), "missing");
  const original = JSON.stringify(partial.chapters[0].memory);
  const continuation = worker.createRun(partial, { ...opts, kind: "memory" });
  await worker.tick();
  assert.equal(store.get<Job>(continuation.id)?.status, "done");
  assert.equal(calls.length, before + 2);
  assert.equal(
    JSON.stringify(store.get<Book>(b.id)!.chapters[0].memory),
    original,
  );
});
test("AI changes to an earlier volume flag later manuscripts without rewriting their prose", async () => {
  const b = make(),
    s = newSeries(b.concept!, 2);
  store.saveSeries(s);
  b.seriesId = s.id;
  b.volumeId = s.volumes[0].id;
  b.chapters = [chapterTemplate(1)];
  store.saveBook(b);
  const later = newBook(b.concept!, s.id, s.volumes[1].id);
  later.chapters = [
    { ...chapterTemplate(1), body: "Do not rewrite this later volume." },
  ];
  store.saveBook(later);
  const j = worker.createRun(b, {
    ...opts,
    kind: "draft",
    chapterId: b.chapters[0].id,
  });
  await worker.tick();
  assert.equal(store.get<Job>(j.id)?.status, "done");
  const after = store.get<Book>(later.id)!;
  assert.match(after.continuityNotice, /earlier series volume/);
  assert.equal(after.rev, later.rev + 1);
  assert.equal(after.chapters[0].body, later.chapters[0].body);
});
