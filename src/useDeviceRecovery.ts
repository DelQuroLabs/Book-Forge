import { useEffect, useRef, useState } from "react";
import { type Book, uuid } from "../shared/domain";
import {
  deviceKey,
  deviceRecoveryEnabled,
  readDeviceCopies,
  writeDeviceCopy,
  clearBookCopies,
  preferenceKey,
  type DeviceCopy,
} from "./deviceDrafts";
export function useDeviceRecovery(
  draft: Book,
  dirty: boolean,
  chapterId: string,
) {
  const [writerId] = useState(uuid),
    key = deviceKey(draft.id, writerId);
  const [enabled, setEnabled] = useState(() => {
    try {
      return deviceRecoveryEnabled(localStorage, draft.id);
    } catch {
      return false;
    }
  });
  const [copies, setCopies] = useState<DeviceCopy[]>([]),
    [error, setError] = useState(""),
    [warning, setWarning] = useState(""),
    [lastCopy, setLastCopy] = useState("");
  const current = useRef({ draft, dirty, chapterId });
  current.current = { draft, dirty, chapterId };
  const scan = () => {
    try {
      const found = readDeviceCopies(localStorage, draft.id);
      setCopies(found.copies.filter((c) => c.key !== key));
      setWarning(
        found.unreadable
          ? "Some device copies are unreadable. They were left untouched."
          : "",
      );
    } catch {
      setError(
        "Browser storage is unavailable. Use Save to protect your work.",
      );
    }
  };
  const flush = (updateStatus = true) => {
    const state = current.current;
    try {
      if (!state.dirty || !deviceRecoveryEnabled(localStorage, state.draft.id))
        return;
      const savedAt = new Date().toISOString();
      writeDeviceCopy(localStorage, key, {
        version: 1,
        savedAt,
        baseRev: state.draft.rev,
        chapterId: state.chapterId,
        book: state.draft,
      });
      if (updateStatus) {
        setLastCopy(savedAt);
        setError("");
      }
    } catch {
      if (updateStatus)
        setError(
          "Device copy failed (storage blocked, full, or draft too large/invalid). Save to the studio or download your work.",
        );
    }
  };
  useEffect(() => {
    scan();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === preferenceKey(draft.id)) {
        try {
          setEnabled(deviceRecoveryEnabled(localStorage, draft.id));
        } catch {
          setEnabled(false);
        }
      }
      scan();
    };
    const onHide = () => flush(false),
      onVisibility = () => {
        if (document.visibilityState === "hidden") flush(false);
      };
    window.addEventListener("storage", onStorage);
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      flush(false);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [draft.id]);
  useEffect(() => {
    if (!enabled) return;
    if (!dirty) {
      try {
        localStorage.removeItem(key);
        setLastCopy("");
      } catch {
        setError(
          "Could not clear the device copy; it may appear again after reload.",
        );
      }
      return;
    }
    const timer = setTimeout(() => flush(), 450);
    return () => clearTimeout(timer);
  }, [draft, dirty, chapterId, enabled]);
  const toggle = () => {
    if (
      enabled &&
      !confirm(
        "Turn off recovery for this book and erase its recovery copies from this browser? Server saves are unchanged.",
      )
    )
      return;
    try {
      setError("");
      const next = !enabled;
      localStorage.setItem(preferenceKey(draft.id), String(next));
      setEnabled(next);
      if (!next) {
        clearBookCopies(localStorage, draft.id);
        setCopies([]);
        setLastCopy("");
        setError("");
      } else flush();
    } catch {
      setError(
        "Could not change browser recovery settings. Use Save to protect your work.",
      );
    }
  };
  const saved = (next: Book, stillDirty: boolean) => {
    current.current = { ...current.current, draft: next, dirty: stillDirty };
    try {
      if (!stillDirty) {
        localStorage.removeItem(key);
        setLastCopy("");
        setError("");
      } else flush();
    } catch {
      setError(
        "Could not clear the device copy; it may appear again after reload.",
      );
    }
  };
  const discard = (copy: DeviceCopy) => {
    try {
      const raw = localStorage.getItem(copy.key);
      if (raw && JSON.parse(raw).savedAt !== copy.record.savedAt) {
        scan();
        setError(
          "That device copy changed in another tab. Review the newer copy first.",
        );
        return;
      }
      localStorage.removeItem(copy.key);
      scan();
    } catch {
      setError("Could not discard this device copy.");
    }
  };
  return {
    enabled,
    copies,
    error: error || warning,
    lastCopy,
    toggle,
    flush: () => flush(),
    saved,
    discard,
    scan,
  };
}
