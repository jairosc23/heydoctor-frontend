"use client";

/**
 * Encounter Shell SSOT — one Clinical Snapshot for all capabilities.
 * Built once from Encounter Memory + shared supplements. No local copies.
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useEncounterMemoryOptional } from "@/context/EncounterMemoryContext";
import { buildClinicalSnapshot } from "@/lib/clinical-context-engine";
import type {
  ClinicalContextSupplement,
  ClinicalSnapshot,
} from "@/lib/clinical-context-engine";

const EncounterClinicalSnapshotContext = createContext<
  ClinicalSnapshot | null | undefined
>(undefined);

export function EncounterClinicalSnapshotProvider({
  supplement,
  children,
}: {
  supplement?: ClinicalContextSupplement;
  children: ReactNode;
}) {
  const memoryCtx = useEncounterMemoryOptional();

  const snapshot = useMemo(() => {
    if (!memoryCtx) return null;
    return buildClinicalSnapshot({
      memory: memoryCtx.memory,
      supplement,
    });
  }, [memoryCtx, supplement]);

  return (
    <EncounterClinicalSnapshotContext.Provider value={snapshot}>
      {children}
    </EncounterClinicalSnapshotContext.Provider>
  );
}

/** undefined = provider not mounted; null = mounted but no memory yet. */
export function useEncounterClinicalSnapshotShared():
  | ClinicalSnapshot
  | null
  | undefined {
  return useContext(EncounterClinicalSnapshotContext);
}
