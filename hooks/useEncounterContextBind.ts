"use client";

import { useEffect } from "react";
import { ensureEncounterContextBound } from "@/lib/clinical-context/ensure-encounter-bind";

/**
 * Canonical Encounter open binds E05 once. No chrome, no flags, no UI.
 * Bind failure stays fail-closed: HAB/emit/sign/close remain gated.
 */
export function useEncounterContextBind(
  consultationId: string | null | undefined,
): void {
  useEffect(() => {
    const id = consultationId?.trim();
    if (!id) return;
    void ensureEncounterContextBound(id).catch(() => undefined);
  }, [consultationId]);
}
