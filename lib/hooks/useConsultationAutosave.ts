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
  const queuedRef = useRef(false);

  const debouncedKey = useDebouncedValue(draftKey, debounceMs);

  const runSave = useCallback(async () => {
    if (!enabled) return;
    if (savingRef.current) {
      queuedRef.current = true;
      return;
    }
    savingRef.current = true;
    setStatus("saving");
    setErrorMessage(null);
    try {
      await save();
      setLastSavedAt(new Date());
      setStatus("saved");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Error al guardar automáticamente",
      );
    } finally {
      savingRef.current = false;
      if (queuedRef.current) {
        queuedRef.current = false;
        void runSave();
      }
    }
  }, [enabled, save]);

  useEffect(() => {
    if (!enabled) {
      hydratedRef.current = false;
      return;
    }
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      return;
    }
    setStatus("pending");
    void runSave();
  }, [debouncedKey, enabled, runSave]);

  return { lastSavedAt, status, errorMessage, flushNow: runSave };
}
