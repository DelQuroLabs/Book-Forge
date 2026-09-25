import { test, expect } from "@playwright/test";
test("library search, navigation and no browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your next chapter starts here." }),
  ).toBeVisible();
  await page.getByLabel("Search your library").fill("Glass");
  await expect(
    page.getByRole("button", { name: "Open The Glass Archive", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open The Quiet Protocol", exact: true }),
  ).toHaveCount(0);
  await page.getByLabel("Search your library").fill("");
  await page.getByRole("button", { name: "In progress", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Open The Quiet Protocol", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open The Glass Archive", exact: true }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("location-informed naming, seeded replay, locks and book creation", async ({
  page,
}) => {
  await page.goto("/#/forge");
  await page.getByLabel("Story location", { exact: true }).fill("Lyon, France");
  await page.getByRole("button", { name: "use the suggested profile" }).click();
  await expect(page.getByLabel("Character naming background")).toHaveValue(
    "fr",
  );
  await page.getByLabel("Replay seed").fill("french-test");
  await page.getByRole("button", { name: "Replay this seed" }).click();
  const name = await page.getByLabel("Protagonist name").inputValue();
  await page
    .getByRole("button", { name: "Lock protagonist", exact: true })
    .click();
  await page.getByRole("button", { name: "Reroll unlocked" }).click();
  await expect(page.getByLabel("Protagonist name")).toHaveValue(name);
  await page.getByLabel("Concept title").fill("TEST Seed novel");
  await page.getByRole("button", { name: "Make this my book" }).click();
  await expect(
    page.getByRole("heading", { name: "TEST Seed novel", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Generate outline", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("Preview mode");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("button", { name: "Add a chapter card" }).click();
  await page.getByRole("button", { name: "Open chapter", exact: true }).click();
  await page
    .getByLabel("Chapter manuscript")
    .fill("The first version of this chapter has a very specific ending.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByText("Saved to your studio", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Chapter manuscript")).toHaveValue(
    "The first version of this chapter has a very specific ending.",
  );
  await page
    .getByLabel("Chapter manuscript")
    .fill(
      "The second version changes the ending but should preserve the first revision.",
    );
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByText("Saved to your studio", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Version history", exact: true })
    .click();
  await expect(
    page.getByText("Manual edit", { exact: false }).first(),
  ).toBeVisible();
  page.on("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Restore", exact: true })
    .first()
    .click();
  await expect(page.getByRole("status")).toContainText("Chapter restored");
  await page.getByRole("button", { name: "Manuscript", exact: true }).click();
  await expect(page.getByLabel("Chapter manuscript")).toHaveValue(
    "The first version of this chapter has a very specific ending.",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("TEST-Seed-novel.md");
});
test("series planning, culturally rooted cast, payoff mapping and linked manuscript", async ({
  page,
}) => {
  await page.goto("/#/series");
  await page
    .getByRole("button", { name: "Plan a series", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Series title", { exact: true })
    .fill("TEST Three-volume journey");
  await page.getByLabel("Planned volumes").fill("3");
  await page
    .getByRole("button", { name: "Create series", exact: false })
    .click();
  await expect(
    page.getByRole("heading", { name: "TEST Three-volume journey" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Volume arcs", exact: true }).click();
  await page
    .getByLabel("The promise of this series")
    .fill("A healer must change a system that rewards abandoning the injured.");
  await page.getByLabel("Volume title").nth(0).fill("First Mercy");
  await page.getByRole("button", { name: "Shared bible", exact: true }).click();
  await page
    .getByLabel("Shared series canon")
    .fill(
      "Healing consumes finite charges. Death is permanent. Preserve each character’s chosen naming order.",
    );
  await page.getByLabel("Primary setting").fill("Busan, South Korea");
  await page.getByLabel("Default naming background").selectOption("ko");
  await page
    .getByRole("button", { name: "Recurring cast", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add character", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Suggest culturally relevant name for New character",
      exact: true,
    })
    .click();
  const name = await page.getByLabel("Full display name").inputValue();
  expect(name).toMatch(/^(Kim|Lee|Park|Choi|Jung|Kang|Yoon|Han) /);
  await page.getByLabel("Role", { exact: true }).fill("Healer");
  await page
    .getByRole("button", { name: "Setups & payoffs", exact: true })
    .click();
  await page.getByRole("button", { name: "Add thread", exact: true }).click();
  await page.getByLabel("Narrative promise").fill("The missing first healer");
  await page.getByLabel("Planted in").selectOption({ label: "1. First Mercy" });
  await page.getByLabel("Paid off in").selectOption({ index: 3 });
  await page.getByRole("button", { name: "Save series", exact: true }).click();
  await expect(
    page.getByText("All changes saved", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Recurring cast", exact: true })
    .click();
  await expect(page.getByLabel("Full display name")).toHaveValue(name);
  await page.getByRole("button", { name: "Volume arcs", exact: true }).click();
  await page
    .getByRole("button", { name: "Create this manuscript", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "First Mercy", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Characters", exact: true }).click();
  await expect(
    page.locator(".shared-cast-card").getByText(name, { exact: true }),
  ).toBeVisible();
  await expect(page.locator(".shared-cast-card")).toContainText("Korean");
  await page.getByRole("button", { name: "Story bible", exact: true }).click();
  await expect(page.getByLabel("Book-specific canon")).toContainText(
    "Healing consumes finite charges",
  );
});
test("narrow screen library, mobile navigation and editor have no horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your next chapter starts here." }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.locator(".sidebar").evaluate((e) => e.getBoundingClientRect().right),
    )
    .toBeLessThanOrEqual(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("button", { name: "Story forge", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "The story forge" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.goto("/#/library");
  await page
    .getByRole("button", { name: "Open The Quiet Protocol", exact: true })
    .click();
  await expect(page.getByLabel("Chapter manuscript")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
test("mutation protection, missing key, stale revisions and secret-free library export", async ({
  request,
}) => {
  const lib = await (await request.get("/api/library")).json();
  const b = lib.books.find((x: { sample: boolean }) => x.sample);
  expect((await request.put("/api/books/" + b.id, { data: b })).status()).toBe(
    403,
  );
  expect(
    (
      await request.put("/api/books/" + b.id, {
        headers: { "X-Ghost-Writer": "1", origin: "https://untrusted.example" },
        data: b,
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.put("/api/books/" + b.id, {
        headers: { "X-Ghost-Writer": "1" },
        data: { ...b, rev: -1 },
      })
    ).status(),
  ).toBe(400);
  const r = await request.post("/api/books/" + b.id + "/jobs", {
    headers: { "X-Ghost-Writer": "1" },
    data: {
      kind: "autopilot",
      budget: 1,
      maxRequests: 5,
      maxOutputTokens: 2000,
      confirmed: true,
    },
  });
  expect(r.status()).toBe(409);
  expect((await r.json()).error).toMatch(/Preview/);
  const backup = await (await request.get("/api/backup")).text();
  expect(backup).not.toContain("OPENAI_API_KEY");
  expect(backup).not.toContain("APP_PASSWORD");
});

test("API enforces document kinds, atomic imports, volume uniqueness, shared identity and stale-save safety", async ({
  request,
}) => {
  const { forge, newBook, newSeries } = await import("../../shared/domain.js");
  const c = forge({
    seed: "api-integrity",
    genre: "LitRPG",
    culture: "ja",
    location: "Kyoto, Japan",
    era: "Near future",
  });
  const series = newSeries(c, 3);
  const book = newBook(c, series.id, series.volumes[0].id);
  book.characters = series.characters;
  const headers = { "X-Ghost-Writer": "1" };
  let r = await request.post("/api/import", {
    headers,
    data: {
      version: 1,
      series: [series],
      books: [book, { ...book, id: crypto.randomUUID() }],
    },
  });
  expect(r.ok()).toBe(false);
  let lib = await (await request.get("/api/library")).json();
  expect(lib.series.some((s: { id: string }) => s.id === series.id)).toBe(
    false,
  );
  r = await request.post("/api/import", {
    headers,
    data: { version: 1, series: [series], books: [book] },
  });
  expect(r.ok()).toBe(true);
  expect(
    (await request.delete("/api/books/" + series.id, { headers })).status(),
  ).toBe(404);
  expect(
    (await request.delete("/api/series/" + book.id, { headers })).status(),
  ).toBe(404);
  expect(
    (await request.get("/api/books/" + series.id + "/export")).status(),
  ).toBe(404);
  lib = await (await request.get("/api/library")).json();
  const savedSeries = lib.series.find(
    (s: { id: string }) => s.id === series.id,
  );
  const savedBook = lib.books.find((b: { id: string }) => b.id === book.id);
  savedSeries.characters[0].name = "Ueno Hana";
  r = await request.put("/api/series/" + series.id, {
    headers,
    data: savedSeries,
  });
  expect(r.ok()).toBe(true);
  lib = await (await request.get("/api/library")).json();
  const updated = lib.books.find((b: { id: string }) => b.id === book.id);
  expect(updated.characters[0].name).toBe("Ueno Hana");
  expect(updated.continuityNotice).toMatch(/Series canon/);
  expect(
    (
      await request.put("/api/books/" + book.id, { headers, data: savedBook })
    ).ok(),
  ).toBe(false);
  const wrongCast = structuredClone(updated);
  wrongCast.characters[0].name = "Local override";
  expect(
    (
      await request.put("/api/books/" + book.id, { headers, data: wrongCast })
    ).ok(),
  ).toBe(false);
  expect(
    (await request.delete("/api/series/" + series.id, { headers })).status(),
  ).toBe(409);
  expect(
    (await request.delete("/api/books/" + book.id, { headers })).ok(),
  ).toBe(true);
  expect(
    (await request.delete("/api/series/" + series.id, { headers })).ok(),
  ).toBe(true);
});
