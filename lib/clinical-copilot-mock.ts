/**
 * Phase 4.0 — Copilot shell: governance, acciones UI y re-exports.
 * Contexto e insights reales: clinical-copilot-intelligence.ts (Phase 4.6).
 */

import type { ClinicalMemoryView } from "@/lib/clinical-memory";
import {
  buildCopilotContextV2,
  type CopilotContextSource,
  type CopilotContextView,
  type CopilotInsight,
  type CopilotInsightKind,
} from "./clinical-copilot-intelligence";

export type {
  CopilotContextSource,
  CopilotContextView,
  CopilotInsight,
  CopilotInsightKind,
} from "./clinical-copilot-intelligence";

export type CopilotActionId =
  | "add-to-soap"
  | "create-prescription"
  | "create-lab"
  | "create-referral";

export type CopilotAction = {
  id: CopilotActionId;
  label: string;
  icon: string;
  description: string;
};

export const COPILOT_CONTEXT_SOURCE_LABELS: Record<
  CopilotContextSource,
  { label: string; icon: string }
> = {
  soap: { label: "SOAP", icon: "📝" },
  timeline: { label: "Clinical Timeline™", icon: "📅" },
  "doctor-dna": { label: "Doctor DNA™", icon: "🧠" },
  orders: { label: "Orders Command Center™", icon: "📋" },
  "patient-snapshot": { label: "Patient Snapshot™", icon: "👤" },
  "clinical-memory": { label: "Clinical Memory™", icon: "🧬" },
  vitals: { label: "Vital Signs Context™", icon: "🫀" },
  "physical-exam": { label: "Physical Exam Framework™", icon: "🩺" },
  longitudinal: { label: "Longitudinal Summary™", icon: "📊" },
};

export const COPILOT_GOVERNANCE_LINES = [
  "Asistencia clínica informativa",
  "No reemplaza criterio médico",
  "No realiza diagnósticos",
  "No realiza indicaciones automáticas",
] as const;

export const MOCK_COPILOT_ACTIONS: CopilotAction[] = [
  {
    id: "add-to-soap",
    label: "Agregar al SOAP",
    icon: "📝",
    description: "Insertar texto sugerido en la nota clínica",
  },
  {
    id: "create-prescription",
    label: "Crear receta",
    icon: "💊",
    description: "Abrir flujo de prescripción con borrador",
  },
  {
    id: "create-lab",
    label: "Crear laboratorio",
    icon: "🧪",
    description: "Preparar orden de laboratorio",
  },
  {
    id: "create-referral",
    label: "Crear interconsulta",
    icon: "🔄",
    description: "Derivación a especialidad",
  },
];

export type BuildCopilotContextInput = {
  consultationId?: string | null;
  diagnosis?: string | null;
  diagnosisCode?: string | null;
  diagnosisDescription?: string | null;
  chiefComplaint?: string | null;
  treatment?: string | null;
  notes?: string | null;
  patientName?: string | null;
  clinicalMemory?: ClinicalMemoryView | null;
};

/** @deprecated Use buildCopilotContextV2 via buildClinicalCopilotIntelligence */
export function buildCopilotContextFromEncounter(
  input: BuildCopilotContextInput,
): CopilotContextView {
  return buildCopilotContextV2({
    ...input,
    clinicalMemoryRaw: null,
  });
}

export { getCopilotInsightIcon } from "./clinical-copilot-intelligence";

/** Removed Phase 4.6 — use buildClinicalInsightCards */
export const MOCK_COPILOT_INSIGHTS: CopilotInsight[] = [];
