import { z } from "zod";
import { BookSchema, type Book, type Chapter } from "./domain.js";
export type ManuscriptHit = {
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  field: "title" | "body";
  start: number;
  end: number;
  before: string;
  match: string;
  after: string;
};
export function searchManuscript(
  chapters: Chapter[],
  query: string,
  matchCase = false,
  limit = 200,
): { hits: ManuscriptHit[]; truncated: boolean } {
  const hits: ManuscriptHit[] = [];
  if (!query.trim()) return { hits, truncated: false };
  const literal = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const [i, chapter] of chapters.entries())
    for (const field of ["title", "body"] as const) {
      const re = new RegExp(literal, matchCase ? "gu" : "giu");
      for (const match of chapter[field].matchAll(re)) {
        if (hits.length >= limit) return { hits, truncated: true };
        const start = match.index!,
          end = start + match[0].length;
        hits.push({
          chapterId: chapter.id,
          chapterNumber: i + 1,
          chapterTitle: chapter.title,
          field,
          start,
          end,
          before: chapter[field].slice(Math.max(0, start - 65), start),
          match: match[0],
          after: chapter[field].slice(end, end + 100),
        });
      }
    }
  return { hits, truncated: false };
}
// Keep edits made while a save request was in flight, but accept the returned
// server revision and server-side summary/continuity invalidation.
export function retainNewerEdits(
  submitted: Book,
  current: Book,
  saved: Book,
): Book {
  if (submitted.id !== current.id || saved.id !== current.id)
    throw new Error("Cannot merge different books.");
  const changes = Object.fromEntries(
    Object.entries(current).filter(
      ([key, value]) =>
        !["id", "rev", "updatedAt", "chapters"].includes(key) &&
        JSON.stringify(value) !== JSON.stringify(submitted[key as keyof Book]),
    ),
  );
  const chapters = current.chapters.map((c) => {
    const before = submitted.chapters.find((x) => x.id === c.id),
      canonical = saved.chapters.find((x) => x.id === c.id);
    if (!before || !canonical) return c;
    const fields = Object.fromEntries(
      Object.entries(c).filter(
        ([key, value]) =>
          key !== "id" &&
          JSON.stringify(value) !==
            JSON.stringify(before[key as keyof Chapter]),
      ),
    );
    const result = { ...canonical, ...fields } as Chapter;
    if (c.body !== before.body || c.title !== before.title) {
      result.summary = "";
      result.findings = [];
    }
    return result;
  });
  return { ...saved, ...changes, chapters };
}
export const RecoverySchema = z
  .object({
    version: z.literal(1),
    savedAt: z.string().datetime(),
    baseRev: z.number().int().nonnegative(),
    chapterId: z.string(),
    book: BookSchema,
  })
  .refine((r) => r.book.rev === r.baseRev, {
    message: "Recovery revision mismatch",
  });
export type RecoveryRecord = z.infer<typeof RecoverySchema>;
export function canRestoreWhole(record: RecoveryRecord, server: Book): boolean {
  return record.book.id === server.id && record.baseRev === server.rev;
}
export function recoveredChapter(chapter: Chapter, newId: string): Chapter {
  return {
    ...chapter,
    id: newId,
    title: chapter.title.slice(0, 188) + " (recovered)",
    status: "revised",
    summary: "",
    findings: [],
  };
}
