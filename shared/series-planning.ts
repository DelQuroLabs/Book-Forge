import { z } from "zod";
import type { Series } from "./domain.js";
export const SeriesRoadmapSchema = z.object({
  centralConflict: z.string().max(4000).default(""),
  endgame: z.string().max(4000).default(""),
  theme: z.string().max(2000).default(""),
  escalation: z.string().max(4000).default(""),
  milestones: z
    .array(
      z.object({
        id: z.string().min(1),
        title: z.string().max(200),
        volumeId: z.string().max(120),
        timeAnchor: z.string().max(300),
        consequence: z.string().max(2000),
      }),
    )
    .max(100)
    .default([]),
  characterArcs: z
    .array(
      z.object({
        id: z.string().min(1),
        characterId: z.string().min(1),
        startingState: z.string().max(2000),
        endingState: z.string().max(2000),
        beats: z
          .array(
            z.object({
              volumeId: z.string().min(1),
              change: z.string().max(2000),
            }),
          )
          .max(20),
      }),
    )
    .max(100)
    .default([]),
});
export type SeriesRoadmap = z.infer<typeof SeriesRoadmapSchema>;
export const roadmapFor = (s: Series): SeriesRoadmap =>
  SeriesRoadmapSchema.parse(s.roadmap || {});
export function validateRoadmapReferences(s: Series): void {
  const r = roadmapFor(s),
    volumes = new Set(s.volumes.map((v) => v.id)),
    cast = new Set(s.characters.map((c) => c.id));
  for (const [items, label] of [
    [r.milestones, "milestone"],
    [r.characterArcs, "character arc"],
  ] as const)
    if (new Set(items.map((x) => x.id)).size !== items.length)
      throw new Error(`Duplicate ${label} IDs.`);
  for (const m of r.milestones)
    if (m.volumeId && !volumes.has(m.volumeId))
      throw new Error("Roadmap milestone refers to a missing volume.");
  if (
    new Set(r.characterArcs.map((a) => a.characterId)).size !==
    r.characterArcs.length
  )
    throw new Error("Only one series arc per recurring character is allowed.");
  for (const a of r.characterArcs) {
    if (!cast.has(a.characterId))
      throw new Error("Roadmap arc refers to a missing recurring character.");
    if (new Set(a.beats.map((b) => b.volumeId)).size !== a.beats.length)
      throw new Error("Duplicate character-arc beats for a volume.");
    for (const b of a.beats)
      if (!volumes.has(b.volumeId))
        throw new Error("Character arc refers to a missing volume.");
  }
}
export function moveVolume(s: Series, id: string, direction: -1 | 1): Series {
  const i = s.volumes.findIndex((v) => v.id === id),
    next = i + direction;
  if (i < 0 || next < 0 || next >= s.volumes.length) return s;
  const volumes = [...s.volumes];
  [volumes[i], volumes[next]] = [volumes[next], volumes[i]];
  return { ...s, volumes };
}
export function volumeHasRoadmapReferences(s: Series, id: string): boolean {
  const r = roadmapFor(s);
  return (
    r.milestones.some((m) => m.volumeId === id) ||
    r.characterArcs.some((a) => a.beats.some((b) => b.volumeId === id))
  );
}
export function seriesPlanningWarnings(s: Series): string[] {
  const r = roadmapFor(s),
    warnings: string[] = [];
  if (!s.volumes.length)
    warnings.push(
      "Add at least one volume to give the series a reading order.",
    );
  if (!r.endgame.trim())
    warnings.push(
      "Define the endgame so individual books build toward an intentional ending.",
    );
  for (const t of s.threads) {
    const a = s.volumes.findIndex((v) => v.id === t.setup),
      b = s.volumes.findIndex((v) => v.id === t.payoff);
    if (a >= 0 && b >= 0 && b < a)
      warnings.push(
        `“${t.name || "Untitled thread"}” pays off before its setup in the current reading order. Review the mapping or explain the nonlinear structure in canon.`,
      );
  }
  if (r.milestones.some((m) => !m.volumeId))
    warnings.push("Some milestones are unassigned to a book.");
  return warnings;
}
