import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import { writeFileSync } from "node:fs";
test("automated WCAG A/AA checks on primary views", async ({ page }) => {
  const results = [];
  for (const path of ["/library", "/forge", "/series", "/settings"]) {
    await page.goto("/#" + path);
    await expect(page.locator("main h1")).toBeVisible();
    const r = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    results.push({ path, violations: r.violations });
  }
  writeFileSync(
    "artifacts/accessibility-results.json",
    JSON.stringify(results, null, 2),
  );
  expect(
    results.flatMap((r) =>
      r.violations.map(
        (v) =>
          `${r.path}: ${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
      ),
    ),
  ).toEqual([]);
});
