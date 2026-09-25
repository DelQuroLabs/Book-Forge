import { ChapterMemorySchema, WritingStyleSchema } from "./story-memory.js";
import { z } from "zod";
import { SeriesRoadmapSchema } from "./series-planning.js";

export const GENRES = [
  "LitRPG",
  "Progression fantasy",
  "Epic fantasy",
  "Cozy fantasy",
  "Science fiction",
  "Mystery",
  "Thriller",
  "Romance",
  "Historical fiction",
  "Horror",
] as const;
import { cultureProfiles } from "./naming.js";
export {
  cultureProfiles,
  locationProfile,
  locationSuggestions,
} from "./naming.js";
export const text = z.string().max(100000);
export const CharacterSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  role: z.string().max(200),
  origin: z.string().max(200),
  culture: z.string().max(100),
  language: z.string().max(100),
  era: z.string().max(100),
  notes: z.string().max(4000),
});
export type Character = z.infer<typeof CharacterSchema>;
export const ConceptSchema = z.object({
  seed: z.string().max(120),
  genre: z.enum(GENRES),
  culture: z.string().max(100),
  location: z.string().max(200),
  era: z.string().max(100),
  title: z.string().max(200),
  premise: z.string().max(5000),
  protagonist: z.string().max(300),
  role: z.string().max(200),
  goal: z.string().max(1000),
  opposition: z.string().max(1000),
  stakes: z.string().max(1000),
  system: z.string().max(2000),
  tone: z.string().max(100),
  explanation: z.string().max(3000),
  engineVersion: z.literal("1.0"),
});
export type Concept = z.infer<typeof ConceptSchema>;
export const ChapterSchema = z.object({
  memory: ChapterMemorySchema.optional(),
  id: z.string(),
  title: z.string().max(200),
  brief: z.string().max(10000),
  body: text,
  summary: z.string().max(10000),
  status: z.enum(["planned", "draft", "revised"]),
  findings: z
    .array(
      z.object({
        quote: z.string(),
        issue: z.string(),
        suggestion: z.string(),
        severity: z.enum(["high", "medium", "low"]),
      }),
    )
    .max(30),
});
export type Chapter = z.infer<typeof ChapterSchema>;
export const BookSchema = z.object({
  writingStyle: WritingStyleSchema.optional(),
  id: z.string(),
  rev: z.number().int().nonnegative(),
  title: z.string().min(1).max(200),
  genre: z.string().max(100),
  premise: z.string().max(10000),
  location: z.string().max(200),
  culture: z.string().max(100),
  era: z.string().max(100),
  tone: z.string().max(100),
  targetWords: z.number().int().min(1000).max(200000),
  chapterCount: z.number().int().min(1).max(40),
  seriesId: z.string().nullable(),
  volumeId: z.string().nullable(),
  bible: text,
  characters: z.array(CharacterSchema).max(100),
  chapters: z.array(ChapterSchema).max(100),
  concept: ConceptSchema.nullable(),
  color: z.number().int().min(0).max(5),
  updatedAt: z.string(),
  sample: z.boolean(),
  continuityNotice: z.string().max(2000),
});
export type Book = z.infer<typeof BookSchema>;
export const VolumeSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  arc: z.string().max(4000),
  ending: z.string().max(2000),
  progression: z.string().max(1000),
});
export const SeriesSchema = z.object({
  roadmap: SeriesRoadmapSchema.optional(),
  id: z.string(),
  rev: z.number().int().nonnegative(),
  title: z.string().min(1).max(200),
  genre: z.string().max(100),
  premise: z.string().max(10000),
  canon: text,
  location: z.string().max(200),
  culture: z.string().max(100),
  era: z.string().max(100),
  characters: z.array(CharacterSchema).max(100),
  volumes: z.array(VolumeSchema).max(20),
  threads: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().max(500),
        setup: z.string().max(120),
        payoff: z.string().max(120),
        resolved: z.boolean(),
      }),
    )
    .max(100),
  updatedAt: z.string(),
});
export type Series = z.infer<typeof SeriesSchema>;
export type Job = {
  id: string;
  bookId: string;
  kind: "plan" | "draft" | "autopilot" | "review" | "memory";
  chapterId?: string;
  status: "queued" | "running" | "paused" | "done" | "failed" | "cancelled";
  message: string;
  steps: number;
  total: number;
  requests: number;
  maxRequests: number;
  maxOutputTokens: number;
  budget: number;
  spent: number;
  uncertain: number;
  events: string[];
  createdAt: string;
  updatedAt: string;
};
export type Settings = {
  demo: boolean;
  keyConfigured: boolean;
  model: string;
  ready: boolean;
  reason: string;
  auth: boolean;
  storage: string;
  paidEnabled: boolean;
};
export const words = (s: string) =>
  s.trim() ? s.trim().split(/\s+/u).length : 0;
export const bookWords = (b: Book) =>
  b.chapters.reduce((sum, c) => sum + words(c.body), 0);
export const uuid = () => globalThis.crypto.randomUUID();
function random(seed: string) {
  let h = 2166136261;
  for (const c of seed) {
    h ^= c.codePointAt(0)!;
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T>(r: () => number, a: readonly T[]) =>
  a[Math.floor(r() * a.length)];
export function suggestName(
  culture: string,
  seed: string,
  era = "Contemporary",
): string {
  const p = cultureProfiles.find((p) => p.id === culture);
  if (!p)
    throw new Error(
      "Choose a supported naming profile or enter a name manually.",
    );
  if (
    !/contemporary|modern|near.future|post.system|future/i.test(era) &&
    p.id !== "custom"
  )
    throw new Error(
      "This starter naming catalog is contemporary. Enter a researched historical name manually or use an invented culture.",
    );
  const r = random(seed + ":names:" + culture);
  const set = p.nameSets ? pick(r, p.nameSets) : p;
  const given = pick(r, set.given);
  if (p.order === "single") return given;
  const family = pick(r, set.family);
  if (p.id === "mx" || p.format === "two-family") {
    const second = pick(
      r,
      p.family.filter((f) => f !== family),
    );
    return `${given} ${family} ${second}`;
  }
  return p.order === "family-given"
    ? `${family} ${given}`
    : `${given} ${family}`;
}
const foundations = {
  LitRPG: [
    {
      role: "infrastructure mechanic",
      goal: "restore the district’s flood defenses",
      opposition: "a salvage guild hoarding the repair cores",
      stakes: "an approaching dungeon surge will swallow the district",
      system:
        "Repairer class. Transfer durability between compatible objects, spending stamina and spare parts. No free materials; no repeat XP for trivial repairs.",
      noun: "Salvage",
      place: "flood districts",
    },
    {
      role: "guild medic",
      goal: "bring an expedition home from a sealed tutorial",
      opposition: "a ranking system that rewards abandoning injured teammates",
      stakes: "the tutorial closes in three days",
      system:
        "Field Medic class. Healing consumes finite charges and cannot resurrect the dead. Cooperative achievements unlock new skills.",
      noun: "Mercy",
      place: "sealed tutorial",
    },
    {
      role: "seed keeper",
      goal: "save a settlement’s last viable harvest",
      opposition: "a trade council controlling the system’s water allocation",
      stakes: "winter will cut off the settlement’s food supply",
      system:
        "Cultivator class. Growth requires water, soil nutrients, and time. Skill levels improve efficiency but do not create resources.",
      noun: "Harvest",
      place: "border settlement",
    },
  ],
  Mystery: [
    {
      role: "municipal archivist",
      goal: "identify who altered a missing person’s records",
      opposition: "an official who controls access to the archive",
      stakes: "the archive is scheduled for demolition",
      system:
        "Grounded mystery. Every decisive clue must be planted before the solution; no supernatural explanations.",
      noun: "Archive",
      place: "old municipal archive",
    },
  ],
  Romance: [
    {
      role: "restoration architect",
      goal: "save a beloved community theater with a former partner",
      opposition:
        "conflicting plans for the building and their unresolved separation",
      stakes: "the building’s sale will end their last chance to work together",
      system:
        "Contemporary romance. Mutual agency and consent; emotional resolution must be earned through changed behavior.",
      noun: "Encore",
      place: "community theater",
    },
  ],
  "Historical fiction": [
    {
      role: "apprentice cartographer",
      goal: "protect a community facing forced displacement",
      opposition: "a landowner falsifying the local survey",
      stakes: "the survey becomes binding at the season’s end",
      system:
        "Historical setting requires researched dates, institutions and names. This starter concept is not historically verified.",
      noun: "Cartographer",
      place: "riverside town",
    },
  ],
  Horror: [
    {
      role: "night caretaker",
      goal: "bring trapped residents out of an isolated building",
      opposition:
        "an entity that can imitate voices but cannot cross a lit threshold",
      stakes: "the building’s backup power is running out",
      system:
        "Supernatural rule: the entity needs an invitation or darkness. It cannot arbitrarily ignore either limitation.",
      noun: "Threshold",
      place: "isolated observatory",
    },
  ],
  Thriller: [
    {
      role: "emergency dispatcher",
      goal: "expose an engineered failure before an evacuation",
      opposition: "a contractor controlling the city’s backup communications",
      stakes: "a storm will cut off the only safe route",
      system:
        "Grounded thriller. Track communication access, travel time, evidence and who knows what.",
      noun: "Signal",
      place: "emergency operations center",
    },
  ],
  "Science fiction": [
    {
      role: "orbital maintenance engineer",
      goal: "restore a failing habitat’s oxygen cycle",
      opposition: "a corporation concealing a lethal design flaw",
      stakes: "the next supply vessel cannot arrive before oxygen runs out",
      system:
        "Closed-loop habitat. Oxygen, energy and repair materials are finite. Any new technology requires an established capability and cost.",
      noun: "Orbit",
      place: "orbital habitat",
    },
  ],
  "Epic fantasy": [
    {
      role: "oathbound mapmaker",
      goal: "reconnect towns separated by a moving border",
      opposition: "a court profiting from tolls on the only stable passage",
      stakes: "the border will seal permanently at the next eclipse",
      system:
        "Magic stabilizes land by consuming stored memories. Every major use has a personal cost; no unestablished exceptions.",
      noun: "Border",
      place: "fractured kingdom",
    },
  ],
  "Cozy fantasy": [
    {
      role: "apprentice tea maker",
      goal: "reopen a neighborhood gathering house",
      opposition: "a lease dispute and a failing enchanted hearth",
      stakes:
        "the winter festival is the last chance to make the business viable",
      system:
        "Small-scale magic and community stakes. Enchantments require careful craft and time, not violence.",
      noun: "Hearth",
      place: "canal neighborhood",
    },
  ],
  "Progression fantasy": [
    {
      role: "disgraced academy apprentice",
      goal: "master a neglected discipline to protect an outlying school",
      opposition: "a dueling order monopolizing instruction",
      stakes: "the school loses its charter after the next trials",
      system:
        "Advancement requires practiced mastery and recovery. Power has physical costs, and each stage has explicit prerequisites.",
      noun: "Ascendant",
      place: "outlying academy",
    },
  ],
};
export function forge(input: {
  seed: string;
  genre: (typeof GENRES)[number];
  culture: string;
  location: string;
  era: string;
  locked?: Partial<Pick<Concept, "protagonist" | "tone" | "title">>;
}): Concept {
  const r = random(input.seed + ":concept:v1");
  const f = pick(r, foundations[input.genre]);
  const protagonist =
    input.locked?.protagonist ||
    suggestName(input.culture, input.seed, input.era);
  const tone =
    input.locked?.tone ||
    pick(r, [
      "Hopeful and grounded",
      "Tense and character-driven",
      "Wry and adventurous",
      "Intimate and atmospheric",
    ]);
  const title =
    input.locked?.title ||
    `${pick(r, ["The Last", "The Unwritten", "A Promise of", "The Quiet"])} ${f.noun}`;
  return {
    seed: input.seed,
    genre: input.genre,
    culture: input.culture,
    location: input.location,
    era: input.era,
    title,
    protagonist,
    role: f.role,
    goal: f.goal,
    opposition: f.opposition,
    stakes: f.stakes,
    system: f.system,
    tone,
    premise: `In ${input.location}, ${protagonist}, a ${f.role}, must ${f.goal}. But ${f.opposition} stands in the way—and ${f.stakes}.`,
    explanation: `The ${f.role} has the skills to engage with the central problem. The opposition controls what the goal requires; the deadline follows from the setting. The rules constrain solutions rather than providing a last-minute escape.`,
    engineVersion: "1.0",
  };
}
export function characterFrom(c: Concept): Character {
  const p = cultureProfiles.find((p) => p.id === c.culture)!;
  return {
    id: uuid(),
    name: c.protagonist,
    role: c.role,
    origin: c.location,
    culture: c.culture,
    language: p.language,
    era: c.era,
    notes:
      "Want: " +
      c.goal +
      ". Define personal motivation, relationships, and individual voice; do not infer personality from cultural background.",
  };
}
export function newBook(
  c: Concept,
  seriesId: string | null = null,
  volumeId: string | null = null,
): Book {
  return {
    id: uuid(),
    rev: 0,
    title: c.title,
    genre: c.genre,
    premise: c.premise,
    location: c.location,
    culture: c.culture,
    era: c.era,
    tone: c.tone,
    targetWords: 60000,
    chapterCount: 12,
    seriesId,
    volumeId,
    bible: `WORLD & SYSTEM RULES\n${c.system}\n\nSTORY PROMISE\n${c.goal}\n\nOPPOSITION\n${c.opposition}\n\nSTAKES\n${c.stakes}`,
    characters: [characterFrom(c)],
    chapters: [],
    concept: c,
    color: 0,
    updatedAt: new Date().toISOString(),
    sample: false,
    continuityNotice: "",
  };
}
export function newSeries(c: Concept, count = 3): Series {
  return {
    id: uuid(),
    rev: 0,
    title: c.title + " · A series",
    genre: c.genre,
    premise: c.premise,
    canon: c.system,
    location: c.location,
    culture: c.culture,
    era: c.era,
    characters: [characterFrom(c)],
    volumes: Array.from({ length: count }, (_, i) => ({
      id: uuid(),
      title: i === 0 ? c.title : `Book ${i + 1}`,
      arc:
        i === 0
          ? `Establish ${c.protagonist} and the immediate struggle to ${c.goal}.`
          : i === count - 1
            ? "Resolve the series conflict through earned choices. Pay off the central promises."
            : "Explore consequences of the previous ending. Escalate the opposition without undoing earlier growth.",
      ending:
        i === count - 1
          ? "Resolve the core conflict; show the cost and a changed world."
          : "Resolve this volume’s immediate goal; leave a specific consequence for the next.",
      progression:
        i === 0
          ? "Establish baseline capabilities, limits and costs."
          : "Carry forward earned abilities. Define the next milestone and its cost.",
    })),
    threads: [],
    updatedAt: new Date().toISOString(),
  };
}
export function chapterTemplate(n: number): Chapter {
  return {
    id: uuid(),
    title: `Chapter ${n}`,
    brief: "",
    body: "",
    summary: "",
    status: "planned",
    findings: [],
  };
}
