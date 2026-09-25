import { RecoverySchema, type RecoveryRecord } from "../shared/writing.js";
export interface DraftStorage {
  length: number;
  key(index: number): string | null;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export const DEVICE_PREFIX = "ghost-writer:device-draft:v1:";
export const preferenceKey = (bookId: string) =>
  "ghost-writer:recovery-enabled:" + encodeURIComponent(bookId);
export const deviceKey = (bookId: string, writerId: string) =>
  DEVICE_PREFIX + encodeURIComponent(bookId) + ":" + writerId;
export type DeviceCopy = { key: string; record: RecoveryRecord };
export function deviceRecoveryEnabled(
  storage: DraftStorage,
  bookId: string,
): boolean {
  return storage.getItem(preferenceKey(bookId)) === "true";
}
export function readDeviceCopies(
  storage: DraftStorage,
  bookId: string,
): { copies: DeviceCopy[]; unreadable: number } {
  const prefix = DEVICE_PREFIX + encodeURIComponent(bookId) + ":",
    copies: DeviceCopy[] = [];
  let unreadable = 0;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key?.startsWith(prefix)) continue;
    try {
      const raw = storage.getItem(key);
      if (!raw || raw.length > 2_000_000) throw Error("Invalid copy size");
      const record = RecoverySchema.parse(JSON.parse(raw));
      if (record.book.id !== bookId) throw Error("Wrong book");
      copies.push({ key, record });
    } catch {
      unreadable++;
    }
  }
  return {
    copies: copies.sort((a, b) =>
      b.record.savedAt.localeCompare(a.record.savedAt),
    ),
    unreadable,
  };
}
export function writeDeviceCopy(
  storage: DraftStorage,
  key: string,
  record: RecoveryRecord,
): void {
  const valid = RecoverySchema.parse(record);
  if (!key.startsWith(DEVICE_PREFIX + encodeURIComponent(valid.book.id) + ":"))
    throw Error("Wrong recovery key");
  const raw = JSON.stringify(valid);
  if (raw.length > 2_000_000)
    throw Error(
      "Draft is too large for browser recovery. Save to your studio instead.",
    );
  storage.setItem(key, raw); // On quota failure, retain the previous copy; never evict other books.
}
export function clearBookCopies(storage: DraftStorage, bookId: string): void {
  const keys: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key?.startsWith(DEVICE_PREFIX + encodeURIComponent(bookId) + ":"))
      keys.push(key);
  }
  for (const key of keys) storage.removeItem(key);
}
