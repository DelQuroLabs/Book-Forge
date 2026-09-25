import { invalidateLaterBooks } from "./store.js";
import { validateBookMemory } from "../shared/story-memory.js";
import { validateRoadmapReferences } from "../shared/series-planning.js";
import express from "express";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import path from "node:path";
import { z } from "zod";
import {
  BookSchema,
  SeriesSchema,
  type Book,
  type Series,
  type Job,
} from "../shared/domain.js";
import {
  db,
  get,
  list,
  put,
  remove,
  saveBook,
  saveSeries,
  hasActiveJob,
  jobs,
  updateJob,
  seedDemo,
} from "./store.js";
import { readiness, createRun, jobInputSchema, startWorker } from "./worker.js";

const demo = process.env.DEMO_MODE === "true",
  password = process.env.APP_PASSWORD || "",
  production = process.env.NODE_ENV === "production";
if (!demo && password.length < 12)
  throw new Error(
    "APP_PASSWORD must contain at least 12 characters. For a keyless synthetic preview only, set DEMO_MODE=true.",
  );
if (production && !demo && !process.env.PUBLIC_ORIGIN)
  throw new Error(
    "Set PUBLIC_ORIGIN to the HTTPS app URL (not the Coolify management URL).",
  );
if (production && !demo) {
  const origin = new URL(process.env.PUBLIC_ORIGIN!);
  if (
    origin.protocol !== "https:" ||
    origin.origin !== process.env.PUBLIC_ORIGIN
  )
    throw new Error(
      "PUBLIC_ORIGIN must be an HTTPS origin without a path or trailing slash.",
    );
}
if (demo && process.env.OPENAI_API_KEY)
  throw new Error(
    "Demo mode must not have an OpenAI key. Remove the key or disable demo mode.",
  );
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.json({ limit: "4mb" }));
const hash = (v: string) => createHash("sha256").update(v).digest();
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader(
    "Content-Security-Policy",
    `default-src 'self'; script-src 'self'${production ? "" : " 'unsafe-inline'"}; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'${demo ? "" : "; frame-ancestors 'none'"}`,
  );
  if (production && !demo)
    res.setHeader("Strict-Transport-Security", "max-age=31536000");
  next();
});
app.get("/api/health", (_q, r) => r.json({ ok: true }));
app.use("/api", (req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    if (req.get("X-Ghost-Writer") !== "1")
      return void res
        .status(403)
        .json({ error: "Missing request protection header." });
    const origin = req.get("origin");
    const expected = process.env.PUBLIC_ORIGIN;
    if (origin) {
      try {
        const allowed = expected
          ? origin === expected
          : new URL(origin).host === req.get("host");
        if (!allowed)
          return void res
            .status(403)
            .json({ error: "Request origin is not allowed." });
      } catch {
        return void res.status(403).json({ error: "Invalid request origin." });
      }
    }
  }
  next();
});
function session(req: express.Request) {
  if (demo) return true;
  const t = req.headers.cookie
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("gw_session="))
    ?.slice(11);
  if (!t) return false;
  return !!db
    .prepare("SELECT token FROM sessions WHERE token=? AND expires>?")
    .get(hash(t).toString("hex"), Date.now());
}
app.get("/api/auth", (req, res) =>
  res.json({ authenticated: session(req), demo }),
);
const attempts = new Map<string, { count: number; until: number }>();
app.post("/api/login", (req, res) => {
  const ip = req.ip || "unknown";
  const a = attempts.get(ip) || { count: 0, until: Date.now() + 60000 };
  if (a.until < Date.now()) {
    a.count = 0;
    a.until = Date.now() + 60000;
  }
  a.count++;
  attempts.set(ip, a);
  if (attempts.size > 1000) {
    for (const [k, v] of attempts) if (v.until < Date.now()) attempts.delete(k);
  }
  if (a.count > 10)
    return void res
      .status(429)
      .json({ error: "Too many attempts. Wait a minute." });
  const p = z.object({ password: z.string().max(1000) }).parse(req.body);
  if (!timingSafeEqual(hash(p.password), hash(password)))
    return void res.status(401).json({ error: "Incorrect studio password." });
  const token = randomBytes(32).toString("hex");
  db.prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
  db.prepare("INSERT INTO sessions VALUES(?,?)").run(
    hash(token).toString("hex"),
    Date.now() + 12 * 3600000,
  );
  res.setHeader(
    "Set-Cookie",
    `gw_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${production ? "; Secure" : ""}`,
  );
  res.json({ ok: true });
});
app.use("/api", (req, res, next) =>
  session(req)
    ? next()
    : void res.status(401).json({ error: "Sign in to your writing studio." }),
);
app.post("/api/logout", (req, res) => {
  const t = req.headers.cookie
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("gw_session="))
    ?.slice(11);
  if (t)
    db.prepare("DELETE FROM sessions WHERE token=?").run(
      hash(t).toString("hex"),
    );
  res.setHeader(
    "Set-Cookie",
    "gw_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
  );
  res.json({ ok: true });
});
app.get("/api/settings", (_req, res) =>
  res.json({
    demo,
    keyConfigured: !!process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "",
    ...readiness(),
    auth: !demo,
    storage: "SQLite · persistent server volume",
    paidEnabled: process.env.ENABLE_PAID_GENERATION === "true",
  }),
);
app.get("/api/library", (_req, res) =>
  res.json({
    books: list<Book>("book"),
    series: list<Series>("series"),
    jobs: jobs().slice(0, 100),
  }),
);
function ensureFree(bookId: string) {
  if (hasActiveJob(bookId))
    throw Object.assign(
      new Error(
        "Pause the active writing job before editing or deleting this book.",
      ),
      { status: 409 },
    );
}
app.post("/api/books", (req, res) => {
  const b = BookSchema.parse(req.body);
  if (get(b.id))
    throw Object.assign(new Error("This ID already exists."), { status: 409 });
  if (b.seriesId) {
    const s = get<Series>(b.seriesId, "series");
    if (!s || !s.volumes.find((v) => v.id === b.volumeId))
      throw new Error("Choose a valid series volume.");
    if (
      list<Book>("book").some(
        (x) => x.seriesId === b.seriesId && x.volumeId === b.volumeId,
      )
    )
      throw Object.assign(new Error("This volume already has a manuscript."), {
        status: 409,
      });
  }
  validateBookLinks(b);
  res.status(201).json(saveBook(b));
});
function validateBookLinks(b: Book) {
  validateBookMemory(b);
  if (
    new Set(b.chapters.map((c) => c.id)).size !== b.chapters.length ||
    new Set(b.characters.map((c) => c.id)).size !== b.characters.length
  )
    throw new Error("Duplicate chapter or character IDs.");
  if (b.seriesId) {
    const s = get<Series>(b.seriesId, "series");
    if (!s?.volumes?.some((v) => v.id === b.volumeId))
      throw new Error("Invalid series volume.");
    for (const c of s.characters) {
      const local = b.characters.find((x) => x.id === c.id);
      if (local && JSON.stringify(local) !== JSON.stringify(c))
        throw new Error(
          "Edit recurring characters in the series studio; shared cast is authoritative.",
        );
    }
    if (
      list<Book>("book").some(
        (x) =>
          x.id !== b.id &&
          x.seriesId === b.seriesId &&
          x.volumeId === b.volumeId,
      )
    )
      throw new Error("That volume already has a manuscript.");
  } else if (b.volumeId)
    throw new Error("A standalone book cannot reference a series volume.");
}
app.put("/api/books/:id", (req, res) => {
  const b = BookSchema.parse(req.body);
  if (req.params.id !== b.id || !get<Book>(b.id, "book"))
    return void res.status(404).json({ error: "Book not found." });
  ensureFree(b.id);
  validateBookLinks(b);
  res.json(saveBook(b));
});
app.delete("/api/books/:id", (req, res) => {
  const id = String(req.params.id);
  if (!get<Book>(id, "book"))
    return void res.status(404).json({ error: "Book not found." });
  ensureFree(id);
  db.transaction(() => {
    invalidateLaterBooks(get<Book>(id, "book")!);
    remove(id);
    db.prepare("DELETE FROM revisions WHERE book_id=?").run(id);
    for (const j of jobs()) if (j.bookId === id) remove(j.id);
  })();
  res.json({ ok: true });
});
app.get("/api/books/:id/revisions", (req, res) =>
  res.json(
    db
      .prepare(
        "SELECT * FROM revisions WHERE book_id=? ORDER BY created_at DESC LIMIT 100",
      )
      .all(String(req.params.id)),
  ),
);
app.post("/api/books/:id/restore", (req, res) => {
  const id = String(req.params.id);
  ensureFree(id);
  const v = z
    .object({ revisionId: z.string(), expectedRev: z.number() })
    .parse(req.body);
  const b = get<Book>(id, "book");
  if (!b) return void res.status(404).json({ error: "Book not found." });
  if (b.rev !== v.expectedRev)
    return void res
      .status(409)
      .json({ error: "Book changed. Reload before restoring." });
  const r = db
    .prepare("SELECT * FROM revisions WHERE id=? AND book_id=?")
    .get(v.revisionId, id) as
    { chapter_id: string; title: string; body: string } | undefined;
  if (!r) throw new Error("Revision not found.");
  let c = b.chapters.find((c) => c.id === r.chapter_id);
  if (!c) {
    c = {
      id: r.chapter_id,
      title: r.title,
      body: "",
      brief: "",
      summary: "",
      status: "revised",
      findings: [],
    };
    b.chapters.push(c);
  }
  c.body = r.body;
  c.title = r.title;
  c.status = "revised";
  res.json(saveBook(b, "Before restoring an earlier revision"));
});
function validateSeries(s: Series) {
  validateRoadmapReferences(s);
  if (new Set(s.volumes.map((v) => v.id)).size !== s.volumes.length)
    throw new Error("Duplicate volume IDs.");
  if (new Set(s.characters.map((v) => v.id)).size !== s.characters.length)
    throw new Error("Duplicate cast IDs.");
  for (const t of s.threads)
    for (const id of [t.setup, t.payoff])
      if (id && !s.volumes.some((v) => v.id === id))
        throw new Error("Thread refers to a missing volume.");
}
app.post("/api/series", (req, res) => {
  const s = SeriesSchema.parse(req.body);
  validateSeries(s);
  if (get(s.id))
    return void res.status(409).json({ error: "This ID already exists." });
  res.status(201).json(saveSeries(s));
});
app.put("/api/series/:id", (req, res) => {
  const s = SeriesSchema.parse(req.body);
  validateSeries(s);
  if (s.id !== req.params.id || !get<Series>(s.id, "series"))
    return void res.status(404).json({ error: "Series not found." });
  const oldSeries = get<Series>(s.id, "series")!;
  const linked = list<Book>("book").filter((b) => b.seriesId === s.id);
  for (const b of linked) {
    ensureFree(b.id);
    if (!s.volumes.some((v) => v.id === b.volumeId))
      return void res
        .status(409)
        .json({ error: "Cannot remove a volume that has a manuscript." });
  }
  db.transaction(() => {
    saveSeries(s);
    for (const b of linked) {
      const sharedIds = new Set(
        [...oldSeries.characters, ...s.characters].map((c) => c.id),
      );
      b.characters = [
        ...b.characters.filter((c) => !sharedIds.has(c.id)),
        ...s.characters,
      ];
      b.continuityNotice =
        "Series canon or volume plan changed. Review this manuscript against the shared series bible before generating.";
      b.rev++;
      put("book", b);
    }
  })();
  res.json(s);
});
app.delete("/api/series/:id", (req, res) => {
  const id = String(req.params.id);
  if (!get<Series>(id, "series"))
    return void res.status(404).json({ error: "Series not found." });
  if (list<Book>("book").some((b) => b.seriesId === id))
    return void res.status(409).json({
      error:
        "This series has manuscripts. Delete its books first; no manuscripts were removed.",
    });
  remove(id);
  res.json({ ok: true });
});
app.post("/api/books/:id/jobs", (req, res) => {
  const b = get<Book>(String(req.params.id), "book");
  if (!b) return void res.status(404).json({ error: "Book not found." });
  ensureFree(b.id);
  res.status(202).json(createRun(b, jobInputSchema().parse(req.body)));
});
app.post("/api/jobs/:id/control", (req, res) => {
  const { action } = z
    .object({ action: z.enum(["pause", "resume", "cancel"]) })
    .parse(req.body);
  const j = get<Job>(String(req.params.id), "job");
  if (!j) return void res.status(404).json({ error: "Job not found." });
  if (["done", "cancelled"].includes(j.status))
    return void res.status(409).json({ error: "This job has already ended." });
  if (action === "resume") {
    if (j.status !== "paused")
      return void res.status(409).json({
        error:
          "Only paused jobs can resume. Create a new authorized run for a failed job.",
      });
    ensureFree(j.bookId);
    if (j.uncertain > 0)
      return void res.status(409).json({
        error:
          "This run has uncertain provider spend. Do not blindly retry. Review provider usage and start a new explicitly budgeted run.",
      });
    if (!readiness().ready)
      return void res.status(409).json({ error: readiness().reason });
  }
  j.status =
    action === "resume"
      ? "queued"
      : action === "cancel"
        ? "cancelled"
        : "paused";
  updateJob(
    j,
    action === "pause"
      ? "Pause requested. In-flight calls may finish and incur cost."
      : action === "resume"
        ? "Resuming from saved chapter checkpoints."
        : "Cancelled. Saved work is preserved; in-flight usage may still settle.",
  );
  res.json(j);
});
app.get("/api/books/:id/export", (req, res) => {
  const b = get<Book>(String(req.params.id), "book");
  if (!b) return void res.status(404).json({ error: "Book not found." });
  const txt = `# ${b.title}\n\n${b.chapters.map((c, i) => `## ${i + 1}. ${c.title}\n\n${c.body || "[Chapter not drafted]"}`).join("\n\n---\n\n")}`;
  const file =
    b.title.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 70) || "manuscript";
  res.setHeader("Content-Disposition", `attachment; filename="${file}.md"`);
  res.type("text/markdown").send(txt);
});
app.get("/api/backup", (_req, res) => {
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="ghost-writer-library.json"',
  );
  res.json({
    version: 1,
    exportedAt: new Date().toISOString(),
    books: list<Book>("book"),
    series: list<Series>("series"),
  });
});
app.post("/api/import", (req, res) => {
  const backup = z
    .object({
      version: z.literal(1),
      books: z.array(BookSchema).max(100),
      series: z.array(SeriesSchema).max(100),
      exportedAt: z.string().optional(),
    })
    .parse(req.body);
  const all = [...backup.books, ...backup.series];
  if (
    new Set(all.map((x) => x.id)).size !== all.length ||
    all.some((x) => get(x.id))
  )
    return void res.status(409).json({
      error:
        "Import contains duplicate or existing IDs. Restore into a fresh library; existing books are never overwritten.",
    });
  for (const b of backup.books) {
    if (b.seriesId) {
      const s = backup.series.find((s) => s.id === b.seriesId);
      if (!s || !s.volumes.some((v) => v.id === b.volumeId))
        throw new Error("Import has a broken series reference.");
    }
  }
  db.transaction(() => {
    for (const s of backup.series) {
      validateSeries(s);
      saveSeries(s);
    }
    for (const b of backup.books) {
      validateBookLinks(b);
      saveBook(b);
    }
  })();
  res.json({ books: backup.books.length, series: backup.series.length });
});
app.use("/api", (_q, r) => r.status(404).json({ error: "Unknown API route." }));
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (err instanceof z.ZodError)
      return void res.status(400).json({
        error:
          "Invalid input: " +
          err.issues
            .slice(0, 3)
            .map((i) => i.path.join(".") + " " + i.message)
            .join("; "),
      });
    const e = err as Error & { status?: number; type?: string };
    if (e.type === "entity.parse.failed")
      return void res.status(400).json({ error: "Malformed JSON body." });
    res
      .status(e.status || 400)
      .json({ error: e.message || "Request could not be completed." });
  },
);
seedDemo();
startWorker();
if (!production) {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true, hmr: false, allowedHosts: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const dir = path.join(process.cwd(), "dist");
  app.use(express.static(dir));
  app.get("/{*path}", (_req, res) =>
    res.sendFile(path.join(dir, "index.html")),
  );
}
app.listen(Number(process.env.PORT || 3000), "0.0.0.0", () =>
  console.log(
    `Ghost Writer listening on 0.0.0.0:${process.env.PORT || 3000} · ${demo ? "synthetic preview, API disabled" : "private studio"}`,
  ),
);
