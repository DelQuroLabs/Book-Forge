import { test } from "node:test";
import assert from "node:assert/strict";
import {
  forge,
  suggestName,
  locationProfile,
  GENRES,
  cultureProfiles,
  ConceptSchema,
  newBook,
  newSeries,
  BookSchema,
  SeriesSchema,
} from "../shared/domain.js";
const input = {
  seed: "test-seed",
  genre: "LitRPG" as const,
  culture: "ja",
  location: "Kyoto, Japan",
  era: "Contemporary",
};
test("seed replay gives identical concepts and locks preserve semantic fields", () => {
  const a = forge(input);
  assert.deepEqual(a, forge(input));
  const b = forge({
    ...input,
    seed: "next",
    locked: { protagonist: a.protagonist, tone: a.tone, title: a.title },
  });
  assert.equal(b.protagonist, a.protagonist);
  assert.equal(b.title, a.title);
  assert.equal(b.tone, a.tone);
  assert.ok(b.premise.includes(a.protagonist));
});
test("1000 seeded concepts per implemented genre remain valid and connected", () => {
  for (const genre of GENRES)
    for (let i = 0; i < 1000; i++) {
      const c = forge({ ...input, genre, seed: String(i) });
      ConceptSchema.parse(c);
      assert.ok(c.premise.includes(c.protagonist));
      assert.ok(c.premise.includes(c.goal));
      assert.ok(c.premise.includes(c.opposition));
      assert.ok(c.premise.includes(c.stakes));
      assert.ok(c.system.length > 40);
    }
});
test("naming profiles preserve order and Mexican two-family-name convention", () => {
  for (const p of cultureProfiles)
    for (let i = 0; i < 100; i++) {
      const name = suggestName(p.id, "" + i);
      if (p.order === "family-given")
        assert.ok((p.family as readonly string[]).includes(name.split(" ")[0]));
      if (p.id === "mx") assert.equal(name.split(" ").length, 3);
    }
  assert.equal(suggestName("fr", "abc"), suggestName("fr", "abc"));
});
test("unresearched historical names and unknown cultures fail explicitly", () => {
  assert.throws(() => suggestName("ja", "1", "Heian era"), /historical/i);
  assert.throws(() => suggestName("unknown", "1"), /supported/);
  assert.doesNotThrow(() => suggestName("custom", "1", "An invented age"));
});
test("location inference is advisory and never equates Nigeria with one culture", () => {
  assert.equal(locationProfile("Kyoto, Japan"), "ja");
  assert.equal(locationProfile("Lyon, France"), "fr");
  assert.equal(locationProfile("Ibadan"), "yo");
  assert.equal(locationProfile("Nigeria"), null);
  assert.equal(locationProfile("New York"), null);
});
test("book and series configurations validate with linked volume records", () => {
  const c = forge(input),
    s = newSeries(c, 4),
    b = newBook(c, s.id, s.volumes[0].id);
  SeriesSchema.parse(s);
  BookSchema.parse(b);
  assert.equal(s.volumes.length, 4);
  assert.equal(b.volumeId, s.volumes[0].id);
  assert.equal(b.characters[0].name, c.protagonist);
  assert.equal(b.characters[0].culture, "ja");
});
