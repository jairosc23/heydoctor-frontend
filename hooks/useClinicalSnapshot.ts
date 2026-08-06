"use client";

/**
 * Shared Clinical Snapshot consumer — One Context for Workspace capabilities.
 * Reads Encounter Memory; does not mutate it.
 */

import { useMemo } from "react";
import { useEncounterMemoryOptional } from "@/context/EncounterMemoryContext";
import { buildClinicalSnapshot } from "@/lib/clinical-context-engine";
import type {
  ClinicalContextSupplement,
  ClinicalSnapshot,
} from "@/lib/clinical-context-engine";

export function useClinicalSnapshot(
  supplement?: ClinicalContextSupplement,
): ClinicalSnapshot | null {
  const memoryCtx = useEncounterMemoryOptional();

  return useMemo(() => {
    if (!memoryCtx) return null;
    return buildClinicalSnapshot({
      memory: memoryCtx.memory,
      supplement,
    });
  }, [memoryCtx, supplement]);
}
