"use client";

/**
 * Shared Clinical Snapshot consumer — One Context for Encounter Shell.
 * Prefers EncounterClinicalSnapshotProvider (shell SSOT).
 * Optional local supplement only when provider is absent (tests / edge).
 */

import { useMemo } from "react";
import { useEncounterMemoryOptional } from "@/context/EncounterMemoryContext";
import { useEncounterClinicalSnapshotShared } from "@/context/EncounterClinicalSnapshotContext";
import { buildClinicalSnapshot } from "@/lib/clinical-context-engine";
import type {
  ClinicalContextSupplement,
  ClinicalSnapshot,
} from "@/lib/clinical-context-engine";

export function useClinicalSnapshot(
  supplement?: ClinicalContextSupplement,
): ClinicalSnapshot | null {
  const shared = useEncounterClinicalSnapshotShared();
  const memoryCtx = useEncounterMemoryOptional();

  return useMemo(() => {
    // Shell SSOT: exactly one snapshot for Insights / Continuity / Voice / Review / Evidence.
    if (shared !== undefined && supplement === undefined) {
      return shared;
    }
    if (!memoryCtx) return null;
    return buildClinicalSnapshot({
      memory: memoryCtx.memory,
      supplement,
    });
  }, [shared, memoryCtx, supplement]);
}
