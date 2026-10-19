"use client";

/**
 * P0 — Encounter Memory SSOT (minimal lifecycle).
 * In-memory for the Encounter only. Capabilities must read from here.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useClinicalDictation } from "@/context/ClinicalDictationContext";
import {
  useClinicalActions,
  useMedicalCopilot,
} from "@/context/MedicalCopilotContext";
import { useClinicalWorkflow } from "@/context/ClinicalWorkflowContext";
import {
  applyEncounterMemoryPatch,
  createEmptyEncounterMemory,
} from "@/lib/encounter/memory/create-encounter-memory";
import type {
  EncounterMemoryPatch,
  EncounterMemorySnapshot,
} from "@/lib/encounter/memory/types";
import { actionableActions } from "@/lib/medical-copilot/view-model";

export type EncounterMemoryContextValue = {
  memory: EncounterMemorySnapshot;
  patchMemory: (patch: EncounterMemoryPatch) => void;
};

const EncounterMemoryContext =
  createContext<EncounterMemoryContextValue | null>(null);

export type EncounterMemoryProviderProps = {
  children: ReactNode;
  consultationId: string;
  patientId: string;
  encounterStatus?: string | null;
  patientName?: string | null;
  patientAge?: string | number | null;
  patientSex?: string | null;
  activeProblems?: string[];
};

export function EncounterMemoryProvider({
  children,
  consultationId,
  patientId,
  encounterStatus = null,
  patientName = null,
  patientAge = null,
  patientSex = null,
  activeProblems = [],
}: EncounterMemoryProviderProps) {
  const [memory, setMemory] = useState(() =>
    createEmptyEncounterMemory({ consultationId, patientId }),
  );

  const patchMemory = useCallback((patch: EncounterMemoryPatch) => {
    setMemory((prev) => applyEncounterMemoryPatch(prev, patch));
  }, []);

  useEffect(() => {
    setMemory(createEmptyEncounterMemory({ consultationId, patientId }));
  }, [consultationId, patientId]);

  const { phase } = useClinicalWorkflow();
  const { status: dictationStatus, buffer, active } = useClinicalDictation();
  const { actions } = useClinicalActions();
  // Keep MedicalCopilot subscription alive for session readiness coupling.
  useMedicalCopilot();

  useEffect(() => {
    const pendingActions = actionableActions(actions).map((action) => ({
      id: action.actionId,
      status: action.status,
    }));
    const encounterDecisions = actions
      .filter((a) => a.status === "approved" || a.status === "rejected")
      .map((a) => ({
        id: a.actionId,
        summary: a.summary ?? a.actionType,
        status:
          a.status === "approved"
            ? ("accepted" as const)
            : ("rejected" as const),
      }));

    patchMemory({
      encounterStatus,
      patientContext: {
        name: patientName,
        age: patientAge,
        sex: patientSex,
      },
      activeProblems,
      workflowPhase: phase,
      dictationBufferRef: {
        status: dictationStatus,
        draftLength: buffer.draft?.length ?? 0,
        active,
      },
      pendingActions,
      encounterDecisions,
    });
  }, [
    actions,
    active,
    activeProblems,
    buffer.draft?.length,
    dictationStatus,
    encounterStatus,
    patchMemory,
    patientAge,
    patientName,
    patientSex,
    phase,
  ]);

  const value = useMemo(
    () => ({ memory, patchMemory }),
    [memory, patchMemory],
  );

  return (
    <EncounterMemoryContext.Provider value={value}>
      {children}
    </EncounterMemoryContext.Provider>
  );
}

export function useEncounterMemory(): EncounterMemoryContextValue {
  const ctx = useContext(EncounterMemoryContext);
  if (!ctx) {
    throw new Error(
      "useEncounterMemory must be used within EncounterMemoryProvider",
    );
  }
  return ctx;
}

export function useEncounterMemoryOptional(): EncounterMemoryContextValue | null {
  return useContext(EncounterMemoryContext);
}
