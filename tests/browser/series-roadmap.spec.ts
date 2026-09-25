import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { forge, newBook, newSeries } from "../../shared/domain.js";
import { roadmapFor } from "../../shared/series-planning.js";
test("series roadmap persists conflict, milestones, character journeys and stable volume order", async ({
  page,
}) => {
  await page.goto("/#/series");
  await page
    .getByRole("button", { name: "Plan a series", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Series title", { exact: true })
    .fill("Roadmap verification");
  await page
    .getByRole("button", { name: "Create series", exact: false })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your series at a glance" }),
  ).toBeVisible();
  await page
    .getByLabel("Central series conflict")
    .fill("Who owns the repair network?");
  await page
    .getByLabel("Final-book endgame")
    .fill("The district runs a repair cooperative.");
  await page
    .getByLabel("Theme / reader promise")
    .fill("Responsibility grows with power.");
  await page
    .getByLabel("Escalation & progression rules")
    .fill("Each ability creates a lasting obligation.");
  await page
    .getByRole("button", { name: "Add milestone", exact: true })
    .click();
  await page
    .getByLabel("Milestone title", { exact: true })
    .fill("The false ledger is exposed");
  await page
    .getByRole("combobox", { name: "Milestone book", exact: true })
    .selectOption({ index: 3 });
  await page.getByLabel("Time / chronology anchor").fill("Second winter");
  await page
    .getByLabel("Milestone consequence")
    .fill("The guild loses its monopoly.");
  await page
    .getByRole("button", { name: "Recurring cast", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add character", exact: true })
    .click();
  await page
    .getByLabel("Full display name", { exact: true })
    .fill("Ueno Akari");
  await page
    .getByRole("button", { name: "Series roadmap", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add character arc", exact: true })
    .click();
  await page.getByLabel("Starting belief / limitation").fill("Works alone");
  await page
    .getByLabel("End-of-series transformation")
    .fill("Leads a cooperative");
  await page
    .getByRole("textbox", { name: "Book 1 character change", exact: true })
    .fill("Trusts her first ally");
  await page
    .getByRole("button", { name: "Move Book 3 earlier", exact: true })
    .click();

  await expect(
    page
      .getByRole("combobox", { name: "Milestone book", exact: true })
      .locator("option:checked"),
  ).toHaveText("2. Book 3");
  await page.getByRole("button", { name: "Save series", exact: true }).click();
  await expect(
    page.getByText("All changes saved", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Central series conflict")).toHaveValue(
    "Who owns the repair network?",
  );
  await expect(page.getByLabel("Final-book endgame")).toHaveValue(
    "The district runs a repair cooperative.",
  );
  await expect(page.getByLabel("Milestone title", { exact: true })).toHaveValue(
    "The false ledger is exposed",
  );
  await expect(
    page
      .getByRole("combobox", { name: "Milestone book", exact: true })
      .locator("option:checked"),
  ).toHaveText("2. Book 3");
  await expect(
    page.getByRole("textbox", { name: "Book 1 character change", exact: true }),
  ).toHaveValue("Trusts her first ally");
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("API validates roadmap references, flags linked books and retains roadmap in library backups", async ({
  request,
}) => {
  const headers = { "X-Ghost-Writer": "1" },
    concept = forge({
      seed: "roadmap-api",
      genre: "LitRPG",
      culture: "ja",
      location: "Kyoto, Japan",
      era: "Contemporary",
    });
  const s = newSeries(concept, 3);
  s.roadmap = {
    ...roadmapFor(s),
    endgame: "End the monopoly",
    milestones: [
      {
        id: "milestone",
        title: "Revelation",
        volumeId: s.volumes[2].id,
        timeAnchor: "Third winter",
        consequence: "The pact ends",
      },
    ],
  };
  const saved = await (
    await request.post("/api/series", { headers, data: s })
  ).json();
  const book = newBook(concept, saved.id, saved.volumes[0].id);
  book.characters = saved.characters;
  const b = await (
    await request.post("/api/books", { headers, data: book })
  ).json();
  const invalid = structuredClone(saved);
  invalid.roadmap.milestones[0].volumeId = "missing";
  expect(
    (
      await request.put("/api/series/" + saved.id, { headers, data: invalid })
    ).ok(),
  ).toBe(false);
  saved.roadmap.endgame = "Give the district control";
  const updated = await request.put("/api/series/" + saved.id, {
    headers,
    data: saved,
  });
  expect(updated.ok()).toBe(true);
  const backup = await (await request.get("/api/backup")).json();
  expect(
    backup.series.find((x: { id: string }) => x.id === saved.id).roadmap
      .endgame,
  ).toBe("Give the district control");
  expect(
    backup.books.find((x: { id: string }) => x.id === b.id).continuityNotice,
  ).toMatch(/Series canon/);
  expect(
    (await request.put("/api/books/" + b.id, { headers, data: b })).status(),
  ).toBe(409);
  await request.delete("/api/books/" + b.id, { headers });
  await request.delete("/api/series/" + saved.id, { headers });
});
