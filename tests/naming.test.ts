import { test } from "node:test";
import assert from "node:assert/strict";
import {
  countries,
  matchPlace,
  placeLabel,
  placeStats,
} from "../shared/places.js";
import {
  cultureProfiles,
  locationSuggestions,
  locationProfile,
} from "../shared/naming.js";
import { suggestName, forge, BookSchema, newBook } from "../shared/domain.js";
test("expanded country/region catalog references only valid profiles", () => {
  assert.ok(placeStats.countries >= 32);
  assert.ok(placeStats.regions >= 280);
  assert.ok(placeStats.cities >= 470);
  assert.ok(cultureProfiles.length >= 45);
  assert.equal(
    new Set(cultureProfiles.map((p) => p.id)).size,
    cultureProfiles.length,
  );
  assert.equal(new Set(countries.map((c) => c.id)).size, countries.length);
  assert.equal(countries.find((c) => c.id === "US")!.regions.length, 51);
  for (const c of countries) {
    assert.equal(new Set(c.regions.map((r) => r.name)).size, c.regions.length);
    for (const id of [
      ...c.profiles,
      ...c.regions.flatMap((r) => r.profiles || []),
    ])
      assert.ok(
        cultureProfiles.some((p) => p.id === id),
        `${c.name}: missing ${id}`,
      );
  }
});
test("country-region-city selections round-trip for every catalog entry", () => {
  for (const c of countries)
    for (const r of c.regions)
      for (const city of r.cities) {
        const label = placeLabel(c.id, r.name, city);
        const result = matchPlace(label);
        assert.deepEqual(
          result,
          { countryId: c.id, region: r.name, city },
          label,
        );
      }
});
test("large countries offer multiple backgrounds and regional choices", () => {
  assert.equal(matchPlace(placeLabel("BR", "São Paulo"))?.city, "");
  assert.equal(
    matchPlace(placeLabel("BR", "São Paulo", "São Paulo"))?.city,
    "São Paulo",
  );
  assert.ok(locationSuggestions("India").includes("in-ta"));
  assert.ok(locationSuggestions("India").includes("in-bn"));
  assert.equal(locationProfile("India"), null);
  assert.deepEqual(locationSuggestions("Chennai, Tamil Nadu, India"), [
    "in-ta",
  ]);
  assert.deepEqual(locationSuggestions("Pune, Maharashtra, India"), [
    "in-mr",
    "in-hi",
  ]);
  assert.deepEqual(locationSuggestions("Guangzhou, Guangdong, China"), [
    "cn-cantonese",
    "cn-mandarin",
  ]);
  assert.deepEqual(locationSuggestions("Enugu, Nigeria"), ["ng-ig"]);
  assert.deepEqual(locationSuggestions("Kano, Nigeria"), ["ng-ha"]);
  assert.deepEqual(locationSuggestions("Ibadan, Nigeria"), ["yo"]);
  assert.deepEqual(
    locationSuggestions("Virginia Beach, Virginia, United States"),
    ["us-en"],
  );
  assert.deepEqual(locationSuggestions("Montréal, Québec, Canada"), [
    "ca-fr",
    "ca-en",
  ]);
});
test("accent-insensitive matching, aliases and ambiguous cities do not guess", () => {
  assert.equal(matchPlace("Sao Paulo, Brazil")?.region, "São Paulo");
  assert.equal(matchPlace("Bangalore, India")?.city, "Bengaluru");
  assert.equal(matchPlace("NYC")?.city, "New York City");
  assert.equal(matchPlace("London"), null);
  assert.equal(matchPlace("Hyderabad"), null);
  assert.equal(matchPlace("Victoria"), null);
  assert.equal(matchPlace("London, Ontario, Canada")?.countryId, "CA");
  assert.equal(matchPlace("New Mexico")?.countryId, "US");
  assert.equal(
    matchPlace("Springfield, Massachusetts, United States")?.region,
    "Massachusetts",
  );
  assert.equal(matchPlace("A world unlike any other"), null);
});
test("uncovered local traditions stay explicit instead of borrowing a neighboring profile", () => {
  assert.deepEqual(locationSuggestions("Denpasar, Bali, Indonesia"), []);
  assert.deepEqual(locationSuggestions("Lhasa, Tibet, China"), []);
  assert.deepEqual(locationSuggestions("Iqaluit, Nunavut, Canada"), []);
});
test("all profiles produce repeatable valid names while retaining display conventions", () => {
  for (const p of cultureProfiles)
    for (let i = 0; i < 80; i++) {
      const seed = String(i),
        name = suggestName(p.id, seed);
      assert.equal(name, suggestName(p.id, seed));
      assert.ok(name.length > 0 && name.length <= 120);
      if (p.order === "single") assert.ok(p.given.includes(name));
      if (p.nameSets)
        assert.ok(
          p.nameSets.some(
            (set) =>
              set.given.some((g) => name.startsWith(g + " ")) &&
              set.family.some((f) => name.endsWith(" " + f)),
          ),
        );
      if (p.order === "family-given")
        assert.ok(p.family.some((f) => name.startsWith(f + " ")));
    }
  const c = forge({
    seed: "expanded",
    genre: "LitRPG",
    culture: "in-ta",
    location: "Chennai, Tamil Nadu, India",
    era: "Contemporary",
  });
  BookSchema.parse(newBook(c));
  assert.ok(c.premise.includes(c.protagonist));
  assert.throws(
    () => suggestName("cn-mandarin", "1", "Tang dynasty"),
    /historical/,
  );
});

test("every inhabited continent has several countries and major-country detail is substantial", async () => {
  const { CONTINENTS, continentCounts } = await import("../shared/places.js");
  assert.equal(CONTINENTS.length, 6);
  for (const continent of CONTINENTS)
    assert.ok(continentCounts[continent] >= 3, continent);
  assert.equal(countries.length, 45);
  assert.equal(cultureProfiles.filter((p) => p.id !== "custom").length, 65);
  assert.equal(countries.find((c) => c.id === "US")!.regions.length, 51);
  assert.equal(countries.find((c) => c.id === "CN")!.regions.length, 33);
  assert.equal(countries.find((c) => c.id === "RU")!.regions.length, 36);
  for (const id of ["US", "CN", "RU"])
    assert.ok(
      countries
        .find((c) => c.id === id)!
        .regions.reduce((n, r) => n + r.cities.length, 0) >= 60,
    );
  assert.deepEqual(locationSuggestions("Kazan, Tatarstan, Russia"), [
    "ru-tt",
    "ru",
  ]);
  assert.deepEqual(
    locationSuggestions("Novosibirsk, Novosibirsk Oblast, Russia"),
    ["ru"],
  );
});
test("Antarctic station locations never inherit a similarly named city's naming profile", async () => {
  const { antarcticStations } = await import("../shared/places.js");
  assert.equal(antarcticStations.length, 4);
  for (const station of antarcticStations) {
    assert.equal(matchPlace(station.location), null);
    assert.deepEqual(locationSuggestions(station.location), []);
  }
  assert.equal(
    matchPlace("Rothera Research Station, Adelaide Island, Antarctica"),
    null,
  );
});
