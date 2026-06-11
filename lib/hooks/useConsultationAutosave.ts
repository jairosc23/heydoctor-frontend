"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";

export type AutosaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

export interface UseConsultationAutosaveOptions {
  enabled: boolean;
  /** Cadena que cambia cuando el draft SOAP debe persistirse. */
  draftKey: string;
  debounceMs?: number;
  save: () => Promise<void>;
}

export function useConsultationAutosave({
  enabled,
  draftKey,
  debounceMs = 900,
  save,
}: UseConsultationAutosaveOptions) {
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hydratedRef = useRef(false);
  const savingRef = useRef(false);
  const queuedKeyRef = useRef<string | null>(null);
  const saveRef = useRef(save);
  const lastSavedDraftKeyRef = useRef<string | null>(null);

  saveRef.current = save;

  const debouncedKey = useDebouncedValue(draftKey, debounceMs);

  const runSave = useCallback(async (keyToSave: string) => {
    if (!enabled) return;
    if (savingRef.current) {
      queuedKeyRef.current = keyToSave;
      return;
    }
    if (lastSavedDraftKeyRef.current === keyToSave) {
      return;
    }

    savingRef.current = true;
    setStatus("saving");
    setErrorMessage(null);
    try {
      await saveRef.current();
      lastSavedDraftKeyRef.current = keyToSave;
      setLastSavedAt(new Date());
      setStatus("saved");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Error al guardar automáticamente",
      );
    } finally {
      savingRef.current = false;
      const queued = queuedKeyRef.current;
      queuedKeyRef.current = null;
      if (queued && queued !== lastSavedDraftKeyRef.current) {
        void runSave(queued);
      }
    }
  }, [enabled]);

  const flushNow = useCallback(async () => {
    await runSave(debouncedKey);
  }, [debouncedKey, runSave]);

  useEffect(() => {
    if (!enabled) {
      hydratedRef.current = false;
      lastSavedDraftKeyRef.current = null;
      return;
    }
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      lastSavedDraftKeyRef.current = debouncedKey;
      return;
    }
    if (lastSavedDraftKeyRef.current === debouncedKey) {
      return;
    }
    setStatus("pending");
    void runSave(debouncedKey);
  }, [debouncedKey, enabled, runSave]);

  return { lastSavedAt, status, errorMessage, flushNow };
}
