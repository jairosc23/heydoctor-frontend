"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { toClinicalUserError } from "@/lib/clinical-user-error";

export type AutosaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

export interface UseConsultationAutosaveOptions {
  enabled: boolean;
  /** Cadena que cambia cuando el draft SOAP debe persistirse. */
  draftKey: string;
  debounceMs?: number;
  save: () => Promise<void>;
}

export interface FlushNowResult {
  /** True if this call invoked `save` and it resolved. */
  wrote: boolean;
  /** True if draft was already equal to last persisted fingerprint. */
  alreadyPersisted: boolean;
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
  const abandonedRef = useRef(false);
  const inFlightRef = useRef<Promise<FlushNowResult> | null>(null);
  const queuedKeyRef = useRef<string | null>(null);
  const saveRef = useRef(save);
  const lastSavedDraftKeyRef = useRef<string | null>(null);

  saveRef.current = save;

  const abandon = useCallback(() => {
    abandonedRef.current = true;
    queuedKeyRef.current = null;
  }, []);

  const debouncedKey = useDebouncedValue(draftKey, debounceMs);

  const runSave = useCallback(
    async (keyToSave: string): Promise<FlushNowResult> => {
      if (abandonedRef.current || !enabled) {
        return {
          wrote: false,
          alreadyPersisted: abandonedRef.current ? false : true,
        };
      }

      // Await in-flight save, then re-evaluate (may still be dirty).
      if (inFlightRef.current) {
        await inFlightRef.current;
      }

      if (abandonedRef.current) {
        return { wrote: false, alreadyPersisted: false };
      }

      if (lastSavedDraftKeyRef.current === keyToSave) {
        return { wrote: false, alreadyPersisted: true };
      }

      if (savingRef.current) {
        queuedKeyRef.current = keyToSave;
        if (inFlightRef.current) {
          await inFlightRef.current;
        }
        if (lastSavedDraftKeyRef.current === keyToSave) {
          return { wrote: false, alreadyPersisted: true };
        }
      }

      savingRef.current = true;
      setStatus("saving");
      setErrorMessage(null);

      const run = (async (): Promise<FlushNowResult> => {
        try {
          if (abandonedRef.current) {
            return { wrote: false, alreadyPersisted: false };
          }
          await saveRef.current();
          lastSavedDraftKeyRef.current = keyToSave;
          setLastSavedAt(new Date());
          setStatus("saved");
          return { wrote: true, alreadyPersisted: false };
        } catch (err) {
          setStatus("error");
          setErrorMessage(
            toClinicalUserError(err, "Error al guardar automáticamente"),
          );
          throw err;
        } finally {
          savingRef.current = false;
          const queued = queuedKeyRef.current;
          queuedKeyRef.current = null;
          if (
            !abandonedRef.current &&
            queued &&
            queued !== lastSavedDraftKeyRef.current
          ) {
            // Fire-and-forget follow-up; callers of flushNow await the primary write.
            void runSave(queued);
          }
        }
      })();

      inFlightRef.current = run;
      try {
        return await run;
      } finally {
        if (inFlightRef.current === run) {
          inFlightRef.current = null;
        }
      }
    },
    [enabled],
  );

  const flushNow = useCallback(async (): Promise<FlushNowResult> => {
    return runSave(draftKey);
  }, [draftKey, runSave]);

  useEffect(() => {
    if (abandonedRef.current) {
      return;
    }
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

  const isDraftDirty =
    enabled &&
    lastSavedDraftKeyRef.current != null &&
    draftKey !== lastSavedDraftKeyRef.current;

  return { lastSavedAt, status, errorMessage, flushNow, isDraftDirty, abandon };
}
