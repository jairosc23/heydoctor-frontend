import type { ClinicalMemoryView } from "@/lib/clinical-memory";
import { clinicalMemoryConfidenceLabel } from "@/lib/clinical-memory";

export type CopilotContextSource =
  | "soap"
  | "timeline"
  | "doctor-dna"
  | "orders"
  | "patient-snapshot"
  | "clinical-memory";

export type CopilotContextView = {
  activeDiagnosis: string | null;
  activeMedications: string[];
  recentTimeline: string[];
  pendingLabs: string[];
  soapSummary: {
    diagnosis: string;
    plan: string;
    notesPreview: string;
  };
  clinicalMemory: string[];
  clinicalMemoryConfidence: string | null;
  sources: CopilotContextSource[];
};

export type CopilotInsightKind =
  | "diagnosis"
  | "follow-up"
  | "lab"
  | "medication";

export type CopilotInsight = {
  id: string;
  kind: CopilotInsightKind;
  title: string;
  body: string;
};

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
};

export const COPILOT_GOVERNANCE_LINES = [
  "Asistencia clínica informativa",
  "No reemplaza criterio médico",
  "No realiza diagnósticos",
  "No realiza indicaciones automáticas",
] as const;

export const MOCK_COPILOT_INSIGHTS: CopilotInsight[] = [
  {
    id: "insight-dx",
    kind: "diagnosis",
    title: "Diagnóstico detectado",
    body: "Patrón compatible con seguimiento de enfermedad metabólica crónica (mock).",
  },
  {
    id: "insight-follow",
    kind: "follow-up",
    title: "Seguimiento sugerido",
    body: "Control ambulatorio en 8–12 semanas según continuidad registrada (mock).",
  },
  {
    id: "insight-lab",
    kind: "lab",
    title: "Laboratorio relacionado",
    body: "Hemoglobina glicosilada y perfil lipídico frecuentes en este contexto (mock).",
  },
  {
    id: "insight-rx",
    kind: "medication",
    title: "Medicamento asociado",
    body: "Metformina aparece como intervención recurrente en práctica similar (mock).",
  },
];

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

const MOCK_MEDICATIONS = ["Metformina 850 mg", "Losartán 50 mg"];
const MOCK_TIMELINE = [
  "Consulta de control — hace 3 semanas",
  "Diabetes mellitus tipo 2 — activa",
  "HbA1c solicitada — pendiente",
];
const MOCK_LABS = ["Hemoglobina glicosilada", "Perfil lipídico"];

function truncatePreview(text: string, max = 120): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}

export type BuildCopilotContextInput = {
  diagnosis?: string | null;
  diagnosisDescription?: string | null;
  treatment?: string | null;
  notes?: string | null;
  patientName?: string | null;
  clinicalMemory?: ClinicalMemoryView | null;
};

export function buildCopilotContextFromEncounter(
  input: BuildCopilotContextInput,
): CopilotContextView {
  const diagnosis =
    input.diagnosisDescription?.trim() ||
    input.diagnosis?.trim() ||
    null;

  const plan = input.treatment?.trim() ?? "";
  const notesPreview = truncatePreview(input.notes ?? "");

  const hasSoap = Boolean(diagnosis || plan || notesPreview);

  return {
    activeDiagnosis: diagnosis,
    activeMedications: hasSoap ? MOCK_MEDICATIONS : [],
    recentTimeline: MOCK_TIMELINE,
    pendingLabs: MOCK_LABS,
    soapSummary: {
      diagnosis: diagnosis ?? "Sin diagnóstico estructurado",
      plan: plan || "Sin plan registrado",
      notesPreview: notesPreview || "Sin notas en esta sesión",
    },
    clinicalMemory: input.clinicalMemory?.highlights ?? [],
    clinicalMemoryConfidence: input.clinicalMemory
      ? clinicalMemoryConfidenceLabel(input.clinicalMemory.confidence)
      : null,
    sources: [
      "patient-snapshot",
      "clinical-memory",
      "soap",
      "timeline",
      "doctor-dna",
      "orders",
    ],
  };
}

export function getCopilotInsightIcon(kind: CopilotInsightKind): string {
  switch (kind) {
    case "diagnosis":
      return "🩺";
    case "follow-up":
      return "📆";
    case "lab":
      return "🧪";
    case "medication":
      return "💊";
  }
}
