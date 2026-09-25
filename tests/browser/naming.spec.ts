import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
test("country-region-city controls offer cultural choices without changing identity or place silently", async ({
  page,
}) => {
  await page.goto("/#/forge");
  await page.locator(".place-picker summary").click();
  await page
    .getByRole("combobox", { name: "Country", exact: true })
    .selectOption("IN");
  await page
    .getByRole("combobox", { name: "State / province / region", exact: true })
    .selectOption("Tamil Nadu");
  await page
    .getByRole("combobox", { name: "City / locality", exact: true })
    .selectOption("Chennai");
  await expect(page.getByLabel("Story location", { exact: true })).toHaveValue(
    "Chennai, Tamil Nadu, India",
  );
  await expect(page.getByLabel("Character naming background")).toHaveValue(
    "ja",
  );
  await page
    .getByRole("button", { name: "use the suggested profile", exact: true })
    .click();
  await expect(page.getByLabel("Character naming background")).toHaveValue(
    "in-ta",
  );
  await page
    .getByRole("button", { name: "Replay this seed", exact: true })
    .click();
  await expect(page.getByLabel("Protagonist name")).not.toHaveValue("");
  await page
    .getByRole("combobox", { name: "Country", exact: true })
    .selectOption("CN");
  await page
    .getByRole("combobox", { name: "State / province / region", exact: true })
    .selectOption("Guangdong");
  await page
    .getByRole("combobox", { name: "City / locality", exact: true })
    .selectOption("Guangzhou");
  await expect(page.getByLabel("Character naming background")).toHaveValue(
    "in-ta",
  );
  await page
    .getByRole("button", {
      name: "Cantonese romanization · Chinese names",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Replay this seed", exact: true })
    .click();
  await expect(page.getByLabel("Character naming background")).toHaveValue(
    "cn-cantonese",
  );
  await page.getByLabel("Character naming background").selectOption("ca-fr");
  await expect(page.getByLabel("Story location", { exact: true })).toHaveValue(
    "Guangzhou, Guangdong, China",
  );
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
test("regional character origin, naming background and generated name survive series save/reload", async ({
  page,
}) => {
  await page.goto("/#/series");
  await page
    .getByRole("button", { name: "Plan a series", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Series title", { exact: true })
    .fill("Regional naming test");
  await page
    .getByRole("button", { name: "Create series", exact: false })
    .click();
  await page
    .getByRole("button", { name: "Recurring cast", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add character", exact: true })
    .click();
  await page.locator(".place-picker summary").click();
  await page
    .getByRole("combobox", { name: "Country", exact: true })
    .selectOption("BR");
  await page
    .getByRole("combobox", { name: "State / province / region", exact: true })
    .selectOption("São Paulo");
  await page
    .getByRole("combobox", { name: "City / locality", exact: true })
    .selectOption("Campinas");
  await page
    .getByRole("button", { name: "Use suggestion", exact: true })
    .click();
  await expect(page.getByLabel("Naming background")).toHaveValue("br");
  await page
    .getByRole("button", {
      name: "Suggest culturally relevant name for New character",
      exact: true,
    })
    .click();
  const name = await page.getByLabel("Full display name").inputValue();
  expect(name.split(" ").length).toBe(3);
  await page.getByRole("button", { name: "Save series", exact: true }).click();
  await expect(
    page.getByText("All changes saved", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "Recurring cast", exact: true })
    .click();
  await expect(page.getByLabel("Full display name")).toHaveValue(name);
  await expect(page.getByLabel("Origin / hometown")).toHaveValue(
    "Campinas, São Paulo, Brazil",
  );
  await expect(page.getByLabel("Naming background")).toHaveValue("br");
});

test("continent browsing reaches US, Chinese and Russian regions and offers Pacific and Antarctic places", async ({
  page,
}) => {
  await page.goto("/#/forge");
  await page.locator(".place-picker summary").click();
  const country = page.getByRole("combobox", { name: "Country", exact: true });
  const continent = page.getByRole("combobox", {
    name: "Continent",
    exact: true,
  });
  const region = page.getByRole("combobox", {
    name: "State / province / region",
    exact: true,
  });
  const city = page.getByRole("combobox", {
    name: "City / locality",
    exact: true,
  });
  await continent.selectOption("North America");
  await country.selectOption("US");
  await region.selectOption("Virginia");
  await city.selectOption("Virginia Beach");
  await expect(page.getByLabel("Story location", { exact: true })).toHaveValue(
    "Virginia Beach, Virginia, United States",
  );
  await continent.selectOption("Asia");
  await expect(page.getByLabel("Story location", { exact: true })).toHaveValue(
    "Virginia Beach, Virginia, United States",
  );
  await country.selectOption("CN");
  await region.selectOption("Hebei");
  await city.selectOption("Shijiazhuang");
  await expect(page.getByLabel("Story location", { exact: true })).toHaveValue(
    "Shijiazhuang, Hebei, China",
  );
  await country.selectOption("RU");
  await region.selectOption("Tatarstan");
  await city.selectOption("Kazan");
  await page
    .getByRole("button", {
      name: "Tatar Russian-form surname variant · Russia",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Replay this seed", exact: true })
    .click();
  await expect(page.getByLabel("Character naming background")).toHaveValue(
    "ru-tt",
  );
  await continent.selectOption("Oceania");
  await expect(country.locator('option[value="NZ"]')).toHaveCount(1);
  await expect(country.locator('option[value="FJ"]')).toHaveCount(1);
  await expect(country.locator('option[value="WS"]')).toHaveCount(1);
  await expect(country.locator('option[value="TO"]')).toHaveCount(1);
  await country.selectOption("NZ");
  await region.selectOption("Canterbury");
  await city.selectOption("Christchurch");
  await expect(page.getByLabel("Character naming background")).toHaveValue(
    "ru-tt",
  );
  await continent.selectOption("Antarctica");
  await page
    .getByRole("combobox", { name: "Research station", exact: true })
    .selectOption({ label: "Rothera Research Station" });
  await expect(page.getByLabel("Story location", { exact: true })).toHaveValue(
    "Rothera Research Station, Adelaide Island, Antarctica",
  );
  await expect(page.getByLabel("Character naming background")).toHaveValue(
    "ru-tt",
  );
  await expect(
    page.getByText(
      "Research stations are places, not countries or naming cultures.",
      { exact: false },
    ),
  ).toBeVisible();
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
