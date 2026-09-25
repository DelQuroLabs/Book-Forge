import {
  test,
  expect,
  type APIRequestContext,
  type Page,
} from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import {
  forge,
  newBook,
  chapterTemplate,
  type Book,
} from "../../shared/domain.js";
const headers = { "X-Ghost-Writer": "1" };
async function create(request: APIRequestContext) {
  const b = newBook(
    forge({
      seed: "writing-browser",
      genre: "LitRPG",
      culture: "ja",
      location: "Kyoto, Japan",
      era: "Contemporary",
    }),
  );
  b.title = "Writing tools verification";
  b.chapters = [
    {
      ...chapterTemplate(1),
      title: "The gate",
      body: "😀 Across the [gate], Akari waited.",
    },
    {
      ...chapterTemplate(2),
      title: "The echo",
      body: "A quiet return. The [gate] opened.",
    },
  ];
  const r = await request.post("/api/books", { headers, data: b });
  expect(r.ok()).toBe(true);
  return (await r.json()) as Book;
}
async function open(page: Page, b: Book) {
  await page.goto("/#/book/" + b.id);
  await expect(page.getByLabel("Chapter manuscript")).toBeVisible();
}
async function enable(page: Page) {
  await page
    .getByRole("button", { name: "Device drafts", exact: true })
    .click();
  await page
    .getByRole("checkbox", { name: "Enable recovery on this device" })
    .check();
  await page.getByRole("button", { name: "Close dialog" }).click();
}
async function copies(page: Page) {
  return page.evaluate(() =>
    Object.keys(localStorage)
      .filter((k) => k.startsWith("ghost-writer:device-draft:v1:"))
      .map((k) => JSON.parse(localStorage.getItem(k)!)),
  );
}

test("writing navigation, literal search selection, focus shortcuts and mobile accessibility", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const b = await create(request);
  await open(page, b);
  await page
    .getByLabel("Chapter manuscript")
    .fill("Unsaved first chapter. 😀 [gate]");
  await page.getByRole("button", { name: "Next chapter", exact: true }).click();
  await expect(page.getByLabel("Chapter manuscript")).toHaveValue(
    b.chapters[1].body,
  );
  await page
    .getByRole("button", { name: "Previous chapter", exact: true })
    .click();
  await expect(page.getByLabel("Chapter manuscript")).toHaveValue(
    "Unsaved first chapter. 😀 [gate]",
  );
  await page.keyboard.press("Control+Shift+F");
  await expect(
    page.getByRole("dialog", { name: "Find in this book" }),
  ).toBeVisible();
  await expect(page.getByLabel("Search manuscript")).toBeFocused();
  await page.getByLabel("Search manuscript").fill("[gate]");
  await expect(
    page.getByText("2 matches found.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Match 2: Chapter 2, body", exact: true })
    .click();
  await expect(page.getByLabel("Jump to chapter")).toHaveValue(
    b.chapters[1].id,
  );
  await expect(page.getByLabel("Chapter manuscript")).toBeFocused();
  expect(
    await page
      .getByLabel("Chapter manuscript")
      .evaluate((el: HTMLTextAreaElement) =>
        el.value.slice(el.selectionStart, el.selectionEnd),
      ),
  ).toBe("[gate]");
  await page.getByRole("button", { name: "Focus mode", exact: true }).click();
  await expect(page.locator("body")).toHaveClass(/focus-writing/);
  await expect(page.locator(".sidebar")).toBeHidden();
  await page.getByLabel("Editor text size").selectOption("22");
  await expect(page.getByLabel("Chapter manuscript")).toHaveCSS(
    "font-size",
    "22px",
  );
  await page.keyboard.press("Control+s");
  await expect(page.locator(".device-status")).toContainText(
    "Saved to your studio",
  );
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: "artifacts/screenshots/writing-focus-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "artifacts/screenshots/writing-focus-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Find in book", exact: true }).click();
  await page.getByLabel("Search manuscript").fill("[gate]");
  await page.screenshot({
    path: "artifacts/screenshots/writing-search-mobile.png",
    fullPage: true,
  });
  const mobileAxe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(mobileAxe.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.locator("body")).toHaveClass(/focus-writing/);
  await page.keyboard.press("Escape");
  await expect(page.locator("body")).not.toHaveClass(/focus-writing/);
  expect(errors).toEqual([]);
});

test("opt-in device recovery reloads for review, restores without autosaving and clears only own saved copy", async ({
  page,
  request,
}) => {
  const b = await create(request);
  await open(page, b);
  await page
    .getByLabel("Chapter manuscript")
    .fill("A device draft waiting to be recovered.");
  expect(await copies(page)).toEqual([]);
  await enable(page);
  await expect.poll(async () => (await copies(page)).length).toBe(1);
  page.on("dialog", (d) => d.accept());
  await page.reload();
  await expect(page.getByLabel("Chapter manuscript")).toHaveValue(
    b.chapters[0].body,
  );
  await page.getByRole("button", { name: "Review device drafts" }).click();
  await expect(page.getByText(/unencrypted browser storage/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Restore device draft", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Restore device draft", exact: true })
    .click();
  await expect(page.getByLabel("Chapter manuscript")).toHaveValue(
    "A device draft waiting to be recovered.",
  );
  await expect(
    page.getByText("Unsaved changes", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByText("Saved to your studio", { exact: true }),
  ).toBeVisible();
  await expect.poll(async () => (await copies(page)).length).toBe(1);
  await page.getByRole("button", { name: "Review device drafts" }).click();
  await expect(
    page.getByRole("button", { name: "Restore device draft", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Discard this copy" }).click();
  await expect(
    page.getByText("No other device drafts found for this book."),
  ).toBeVisible();
  expect(await copies(page)).toEqual([]);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.reload();
  await expect(page.getByLabel("Chapter manuscript")).toHaveValue(
    "A device draft waiting to be recovered.",
  );
});

test("stale device copies cannot replace newer server text; recovery appends a new chapter", async ({
  page,
  request,
}) => {
  const b = await create(request);
  await open(page, b);
  await enable(page);
  await page.getByLabel("Chapter manuscript").fill("Old unsaved branch");
  await expect.poll(async () => (await copies(page)).length).toBe(1);
  const updated = structuredClone(b);
  updated.chapters[0].body = "Newer server revision";
  expect(
    (await request.put("/api/books/" + b.id, { headers, data: updated })).ok(),
  ).toBe(true);
  page.on("dialog", (d) => d.accept());
  await page.reload();
  await expect(page.getByLabel("Chapter manuscript")).toHaveValue(
    "Newer server revision",
  );
  await page.getByRole("button", { name: "Review device drafts" }).click();
  await expect(
    page.getByRole("button", { name: "Restore device draft", exact: true }),
  ).toBeDisabled();
  await page.locator(".recovery-chapters summary").first().click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download recovery JSON" }).click();
  expect((await download).suggestedFilename()).toBe(
    "ghost-writer-device-recovery.json",
  );
  await page
    .getByRole("button", { name: "Add as a new recovered chapter" })
    .first()
    .click();
  await expect(page.getByLabel("Chapter manuscript")).toHaveValue(
    "Old unsaved branch",
  );
  const newId = await page.getByLabel("Jump to chapter").inputValue();
  expect(b.chapters.map((c) => c.id)).not.toContain(newId);
  await page.getByLabel("Jump to chapter").selectOption(b.chapters[0].id);
  await expect(page.getByLabel("Chapter manuscript")).toHaveValue(
    "Newer server revision",
  );
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByText("Saved to your studio", { exact: true }),
  ).toBeVisible();
});

test("typing during a delayed save survives and remains dirty until a second save", async ({
  page,
  request,
}) => {
  const b = await create(request);
  await open(page, b);
  await enable(page);
  let release!: () => void;
  const gate = new Promise<void>((r) => {
    release = r;
  });
  let arrived!: () => void;
  const arrivedPromise = new Promise<void>((r) => {
    arrived = r;
  });
  await page.route("**/api/books/" + b.id, async (route) => {
    if (route.request().method() !== "PUT") return route.continue();
    const response = await route.fetch();
    arrived();
    await gate;
    await route.fulfill({ response });
  });
  await page.getByLabel("Chapter manuscript").fill("Submitted text");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await arrivedPromise;
  await page
    .getByLabel("Chapter manuscript")
    .fill("Newer typing during the request");
  release();
  await expect(
    page.getByRole("button", { name: "Save", exact: true }),
  ).toBeEnabled();
  await expect(page.getByLabel("Chapter manuscript")).toHaveValue(
    "Newer typing during the request",
  );
  await expect(
    page.getByText("Unsaved changes", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(async () => (await copies(page))[0]?.book.chapters[0].body)
    .toBe("Newer typing during the request");
  await page.unroute("**/api/books/" + b.id);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByText("Saved to your studio", { exact: true }),
  ).toBeVisible();
  expect(await copies(page)).toEqual([]);
  await page.reload();
  await expect(page.getByLabel("Chapter manuscript")).toHaveValue(
    "Newer typing during the request",
  );
});

test("failed save and unavailable recovery preserve editing and allow an unsaved Markdown download", async ({
  page,
  request,
}) => {
  const b = await create(request);
  await open(page, b);
  await enable(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await page
    .getByLabel("Chapter manuscript")
    .fill("Must not disappear after a failed save.");
  await expect(page.getByText(/Device copy failed/).first()).toBeVisible();
  await page.route("**/api/books/" + b.id, (route) =>
    route.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({
        error:
          "A newer server revision exists. Reload after protecting your edits.",
      }),
    }),
  );
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByLabel("Chapter manuscript")).toHaveValue(
    "Must not disappear after a failed save.",
  );
  await expect(
    page.getByText("Unsaved changes", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("status").last()).toContainText(
    "newer server revision",
  );
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download working draft" }).click();
  const d = await downloaded;
  const stream = await d.createReadStream();
  let text = "";
  for await (const chunk of stream!) text += chunk.toString();
  expect(text).toContain("Must not disappear after a failed save.");
  expect(text).toContain(b.chapters[1].body);
});

test("two tabs keep independent unsaved recovery records; turning recovery off removes only this book copies", async ({
  page,
  context,
  request,
}) => {
  const b = await create(request);
  await open(page, b);
  await enable(page);
  await page.getByLabel("Chapter manuscript").fill("First tab branch");
  await expect.poll(async () => (await copies(page)).length).toBe(1);
  const second = await context.newPage();
  await open(second, b);
  await second.getByLabel("Chapter manuscript").fill("Second tab branch");
  await expect.poll(async () => (await copies(page)).length).toBe(2);
  expect(
    (await copies(page)).map((c) => c.book.chapters[0].body).sort(),
  ).toEqual(["First tab branch", "Second tab branch"]);
  await second.getByRole("button", { name: "Review device drafts" }).click();
  await expect(
    second.getByRole("button", { name: "Restore device draft", exact: true }),
  ).toBeDisabled();
  second.on("dialog", (d) => d.accept());
  await second
    .getByRole("checkbox", { name: "Enable recovery on this device" })
    .uncheck();
  await expect.poll(async () => (await copies(page)).length).toBe(0);
  await expect(page.locator(".device-status")).toContainText(
    "Device recovery off",
  );
  await second.close();
});

test("pagehide flush protects the latest keystroke before the debounce; focus cleans up on navigation", async ({
  page,
  request,
}) => {
  const b = await create(request);
  await open(page, b);
  await enable(page);
  await page.getByRole("button", { name: "Focus mode", exact: true }).click();
  await page
    .getByLabel("Chapter manuscript")
    .fill("Last keystroke before closing");
  await page.evaluate(() => window.dispatchEvent(new Event("pagehide")));
  expect((await copies(page))[0]?.book.chapters[0].body).toBe(
    "Last keystroke before closing",
  );
  page.on("dialog", (d) => d.accept());
  await page.evaluate(() => {
    location.hash = "/library";
  });
  await expect(page.locator("body")).not.toHaveClass(/focus-writing/);
  await expect(
    page.getByRole("heading", { name: "Your next chapter starts here." }),
  ).toBeVisible();
  await open(page, b);
  await page.getByRole("button", { name: "Review device drafts" }).click();
  await expect(
    page.getByRole("button", { name: "Restore device draft", exact: true }),
  ).toBeEnabled();
  await page.locator(".recovery-chapters summary").last().focus();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Close dialog" }),
  ).toBeFocused();
});
