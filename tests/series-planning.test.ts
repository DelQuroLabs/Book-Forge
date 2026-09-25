import { test } from "node:test";
import assert from "node:assert/strict";
import { forge, newSeries, SeriesSchema } from "../shared/domain.js";
import {
  roadmapFor,
  moveVolume,
  validateRoadmapReferences,
  volumeHasRoadmapReferences,
  seriesPlanningWarnings,
} from "../shared/series-planning.js";
function make() {
  return newSeries(
    forge({
      seed: "series-planning",
      genre: "LitRPG",
      culture: "ja",
      location: "Kyoto, Japan",
      era: "Contemporary",
    }),
    3,
  );
}
test("legacy series gain an empty view-only roadmap without mutation or migration", () => {
  const s = make(),
    before = JSON.stringify(s);
  assert.equal(s.roadmap, undefined);
  SeriesSchema.parse(s);
  assert.equal(roadmapFor(s).endgame, "");
  assert.deepEqual(roadmapFor(s).characterArcs, []);
  assert.equal(JSON.stringify(s), before);
  assert.doesNotThrow(() => validateRoadmapReferences(s));
});
test("roadmap schema and references reject invalid or duplicate milestones and character beats", () => {
  const s = make();
  s.roadmap = {
    ...roadmapFor(s),
    endgame: "Resolve the repair conflict",
    milestones: [
      {
        id: "milestone",
        title: "The cost",
        volumeId: s.volumes[1].id,
        timeAnchor: "Second winter",
        consequence: "The guild loses its monopoly",
      },
    ],
    characterArcs: [
      {
        id: "arc",
        characterId: s.characters[0].id,
        startingState: "Works alone",
        endingState: "Builds a coalition",
        beats: [{ volumeId: s.volumes[0].id, change: "Trusts an ally" }],
      },
    ],
  };
  SeriesSchema.parse(s);
  validateRoadmapReferences(s);
  assert.equal(volumeHasRoadmapReferences(s, s.volumes[0].id), true);
  assert.equal(volumeHasRoadmapReferences(s, s.volumes[2].id), false);
  const bad = structuredClone(s);
  bad.roadmap!.milestones[0].volumeId = "missing";
  assert.throws(() => validateRoadmapReferences(bad), /missing volume/);
  bad.roadmap = structuredClone(s.roadmap);
  bad.roadmap!.characterArcs[0].characterId = "missing";
  assert.throws(
    () => validateRoadmapReferences(bad),
    /missing recurring character/,
  );
  bad.roadmap = structuredClone(s.roadmap);
  bad.roadmap!.characterArcs[0].beats.push({
    ...bad.roadmap!.characterArcs[0].beats[0],
  });
  assert.throws(
    () => validateRoadmapReferences(bad),
    /Duplicate character-arc beats/,
  );
  bad.roadmap = structuredClone(s.roadmap);
  bad.roadmap!.milestones.push({ ...bad.roadmap!.milestones[0] });
  assert.throws(() => validateRoadmapReferences(bad), /Duplicate milestone/);
  bad.roadmap = structuredClone(s.roadmap);
  bad.roadmap!.endgame = "x".repeat(4001);
  assert.throws(() => SeriesSchema.parse(bad));
});
test("reordering volumes preserves IDs/references and flags reversed setup/payoff order", () => {
  const s = make();
  const first = s.volumes[0].id,
    last = s.volumes[2].id;
  s.threads = [
    {
      id: "promise",
      name: "Hidden author",
      setup: first,
      payoff: last,
      resolved: false,
    },
  ];
  s.roadmap = {
    ...roadmapFor(s),
    milestones: [
      {
        id: "event",
        title: "Reveal",
        volumeId: last,
        timeAnchor: "Winter",
        consequence: "The author is named",
      },
    ],
  };
  const moved = moveVolume(moveVolume(s, last, -1), last, -1);
  assert.equal(moved.volumes[0].id, last);
  assert.equal(s.volumes[0].id, first);
  assert.equal(moved.threads[0].payoff, last);
  assert.equal(moved.roadmap!.milestones[0].volumeId, last);
  validateRoadmapReferences(moved);
  assert.ok(
    seriesPlanningWarnings(moved).some((w) =>
      w.includes("pays off before its setup"),
    ),
  );
  assert.equal(moveVolume(moved, last, -1), moved);
});
