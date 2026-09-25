import { test, expect, type APIRequestContext } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import {
  forge,
  newBook,
  newSeries,
  chapterTemplate,
  type Book,
} from "../../shared/domain.js";
import { makeMemory } from "../../shared/story-memory.js";
const headers = { "X-Ghost-Writer": "1" };
function concept() {
  return forge({
    seed: "browser-memory",
    genre: "LitRPG",
    culture: "ja",
    location: "Kyoto",
    era: "Contemporary",
  });
}
async function create(request: APIRequestContext, book: Book) {
  const r = await request.post("/api/books", { headers, data: book });
  expect(r.ok()).toBe(true);
  return (await r.json()) as Book;
}
test("author pins survive save/reload, reach chapter23, carry voice direction and become stale after source edits", async ({
  page,
  request,
}) => {
  const b = newBook(concept());
  b.title = "The Glass Compass";
  b.chapters = Array.from({ length: 24 }, (_, i) => ({
    ...chapterTemplate(i + 1),
    title: "Passage " + (i + 1),
    body:
      i === 0
        ? "The obsidian seal opens only after three knocks."
        : i < 22
          ? "The journey continued along the river."
          : "",
  }));
  b.chapters[22].brief = "Return to the obsidian seal.";
  const saved = await create(request, b);
  await page.goto("/#/book/" + saved.id);
  await page.getByRole("button", { name: "Story memory", exact: true }).click();
  await page.getByText("Add an author-verified fact", { exact: true }).click();
  await page.getByLabel("Fact category").selectOption("world-rule");
  await page.getByLabel("Fact subject").fill("obsidian seal");
  await page.getByLabel("Fact key", { exact: true }).fill("opening rule");
  await page
    .getByLabel("Established fact / value")
    .fill("Requires three knocks");
  await page.getByLabel("Exact evidence quote").fill(b.chapters[0].body);
  await page.getByRole("button", { name: "Add pinned fact" }).click();
  await expect(
    page.getByRole("button", { name: "Unpin obsidian seal opening rule" }),
  ).toBeVisible();
  await page
    .getByLabel("Point of view", { exact: true })
    .fill("Close third person");
  await page
    .getByLabel("Voice direction")
    .fill("Concrete images; restrained emotion.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByText("Saved to your studio", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Story memory", exact: true }).click();
  await expect(page.getByLabel("Voice direction")).toHaveValue(
    "Concrete images; restrained emotion.",
  );
  await page.getByLabel("Memory chapter").selectOption(saved.chapters[22].id);
  await expect(
    page
      .locator(".memory-evidence")
      .filter({ hasText: "Requires three knocks" }),
  ).toContainText("PINNED");
  await expect(
    page
      .locator(".memory-evidence")
      .filter({ hasText: "Requires three knocks" }),
  ).toContainText("Ch 1");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download context preview" }).click();
  const stream = await (await download).createReadStream();
  let raw = "";
  for await (const chunk of stream!) raw += chunk.toString();
  const packet = JSON.parse(raw);
  expect(packet.pinned[0].source.chapterNumber).toBe(1);
  expect(packet.diagnostics.eligibleChapters).toBe(22);
  expect(packet.target.chapterId).toBe(saved.chapters[22].id);
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: "artifacts/screenshots/story-memory-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "artifacts/screenshots/story-memory-mobile.png",
    fullPage: true,
  });
  await page.getByLabel("Memory chapter").selectOption(saved.chapters[0].id);
  await page.getByRole("button", { name: "Manuscript", exact: true }).click();
  await page
    .getByLabel("Chapter manuscript")
    .fill("The obsidian seal opens only after four knocks.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByText("Saved to your studio", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Story memory", exact: true }).click();
  await page.getByLabel("Memory chapter").selectOption(saved.chapters[22].id);
  await expect(
    page.getByText(/Pinned memory has changed source text/),
  ).toBeVisible();
  await expect(page.locator(".memory-context-size")).toContainText(
    "Needs review",
  );
});
test("fourth volume retrieval includes first-volume evidence but no later-volume prose; source changes flag sequels", async ({
  page,
  request,
}) => {
  const c = concept(),
    s = newSeries(c, 5);
  s.title = "Compass Cycle";
  const seriesResponse = await request.post("/api/series", {
    headers,
    data: s,
  });
  expect(seriesResponse.ok()).toBe(true);
  const earlier = newBook(c, s.id, s.volumes[0].id);
  earlier.title = "First Compass";
  earlier.chapters = [
    { ...chapterTemplate(1), body: "Maren died defending the glass compass." },
  ];
  earlier.chapters[0].memory = makeMemory(earlier.chapters[0], {
    summary: "Maren died defending the compass.",
    facts: [
      {
        category: "state",
        subject: "Maren",
        key: "alive",
        value: "no — died in volume one",
        quote: earlier.chapters[0].body,
      },
    ],
  });
  earlier.chapters[0].memory.facts[0].pinned = true;
  const first = await create(request, earlier);
  const fourth = newBook(c, s.id, s.volumes[3].id);
  fourth.title = "Fourth Compass";
  fourth.chapters = [
    {
      ...chapterTemplate(1),
      brief: "Recover the glass compass without Maren.",
    },
  ];
  const saved = await create(request, fourth);
  const future = newBook(c, s.id, s.volumes[4].id);
  future.chapters = [
    { ...chapterTemplate(1), body: "FUTURE SECRET DRAGON REVEAL" },
  ];
  await create(request, future);
  await page.goto("/#/book/" + saved.id);
  await page.getByRole("button", { name: "Story memory", exact: true }).click();
  await expect(
    page
      .locator(".memory-evidence")
      .filter({ hasText: "no — died in volume one" }),
  ).toContainText("First Compass");
  await expect(page.locator(".story-memory")).not.toContainText(
    "FUTURE SECRET DRAGON REVEAL",
  );
  await page
    .getByLabel("Try retrieval search (preview only)")
    .fill("glass compass");
  await expect(
    page
      .locator(".memory-evidence")
      .filter({ hasText: "Maren died defending the glass compass." }),
  ).toHaveCount(2);
  const changed = structuredClone(first);
  changed.chapters[0].body = "Maren survived defending the glass compass.";
  expect(
    (
      await request.put("/api/books/" + first.id, { headers, data: changed })
    ).ok(),
  ).toBe(true);
  await page.reload();
  await expect(
    page.getByText(/An earlier series volume changed/),
  ).toBeVisible();
  const priorLibrary = await (await request.get("/api/library")).json();
  const oldRev = priorLibrary.books.find((x: Book) => x.id === saved.id).rev;
  expect(
    (await request.delete("/api/books/" + first.id, { headers })).ok(),
  ).toBe(true);
  const deletedLibrary = await (await request.get("/api/library")).json();
  expect(deletedLibrary.books.find((x: Book) => x.id === saved.id).rev).toBe(
    oldRev + 1,
  );
});
test("memory extraction is disabled honestly in demo; forged fresh evidence is rejected and backup retains memory", async ({
  page,
  request,
}) => {
  const b = newBook(concept());
  b.chapters = [{ ...chapterTemplate(1), body: "Jun has seven spare cores." }];
  b.chapters[0].memory = makeMemory(b.chapters[0], {
    summary: "Seven spare cores.",
    facts: [
      {
        category: "resource",
        subject: "Jun",
        key: "spare cores",
        value: "seven",
        quote: b.chapters[0].body,
      },
    ],
  });
  const saved = await create(request, b);
  const invalid = structuredClone(saved);
  invalid.chapters[0].memory!.facts[0].quote = "Invented unsupported quote";
  expect(
    (
      await request.put("/api/books/" + saved.id, { headers, data: invalid })
    ).status(),
  ).toBe(400);
  const backup = await (await request.get("/api/backup")).json();
  expect(
    backup.books.find((x: Book) => x.id === saved.id).chapters[0].memory
      .facts[0].value,
  ).toBe("seven");
  await page.goto("/#/book/" + saved.id);
  await page.getByRole("button", { name: "Story memory", exact: true }).click();
  await page
    .getByRole("button", { name: "Extract this chapter’s memory" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Build story memory" }),
  ).toContainText("Preview mode");
  await expect(page.getByRole("dialog")).toContainText(
    "one request per chapter",
  );
});
