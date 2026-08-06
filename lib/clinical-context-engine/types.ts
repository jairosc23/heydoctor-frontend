/**
 * Clinical Context Engine — Sprint 1 contracts.
 * Deterministic · NON_AUTHORITY · no EMR writes · no diagnosis generation.
 */

import type { EncounterMemorySnapshot } from "@/lib/encounter/memory/types";

export const CLINICAL_CONTEXT_ENGINE_VERSION = "cce-s1.0.0" as const;

export const CLINICAL_CONTEXT_ENGINE_GOVERNANCE = {
  authorityClass: "NON_AUTHORITY" as const,
  humanInTheLoop: true as const,
  generatesDiagnosis: false as const,
  writesEmr: false as const,
  autonomousDecisions: false as const,
};

/** Optional clinical signals not yet on Encounter Memory P0 contract. */
export type ClinicalContextSupplement = {
  allergies?: string[];
  medications?: string[];
  vitalSignsSummary?: string | null;
  consultationReason?: string | null;
};

export type ClinicalContextEngineInput = {
  memory: EncounterMemorySnapshot;
  supplement?: ClinicalContextSupplement;
};

export type ClinicalContextPriority = {
  id: string;
  label: string;
  reason: string;
  urgency: "routine" | "attention" | "critical";
};

export type ClinicalContextGap = {
  id: string;
  field: string;
  message: string;
  severity: "info" | "warning" | "critical";
};

/**
 * Shared clinical context for the encounter — One Context, many capabilities.
 */
export type ClinicalSnapshot = {
  version: typeof CLINICAL_CONTEXT_ENGINE_VERSION;
  authorityClass: typeof CLINICAL_CONTEXT_ENGINE_GOVERNANCE.authorityClass;
  generatedAt: string;
  consultationId: string;
  patientId: string;
  encounterSummary: string;
  patientContext: {
    name: string | null;
    age: string | number | null;
    sex: string | null;
    encounterStatus: string | null;
  };
  activeProblems: string[];
  medications: string[];
  allergies: string[];
  vitalSignsSummary: string | null;
  consultationReason: string | null;
  workflowPhase: string | null;
  priorities: ClinicalContextPriority[];
  pendingActions: Array<{ id: string; status: string }>;
  missingCritical: ClinicalContextGap[];
  encounterDecisions: Array<{
    id: string;
    summary: string;
    status: string;
  }>;
  sources: Array<
    | "encounter-memory"
    | "allergies"
    | "medications"
    | "vitals"
    | "consultation-reason"
  >;
};
