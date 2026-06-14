/**
 * Phase 4.8.4 — Clinical Close Flow Wizard™
 * Orquestación visual del cierre de consulta — sin bloqueos ni reglas nuevas.
 */

import type {
  DocumentationGap,
  DocumentationQuality,
} from "./clinical-copilot-intelligence";
import type { AutosaveStatus } from "./hooks/useConsultationAutosave";

export type CloseFlowItemStatus = "complete" | "attention" | "pending" | "na";

export type CloseFlowPhaseId = "document" | "review" | "sign" | "deliver";

export type CloseFlowItem = {
  id: string;
  label: string;
  status: CloseFlowItemStatus;
  detail?: string;
};

export type CloseFlowPhase = {
  id: CloseFlowPhaseId;
  label: string;
  status: CloseFlowItemStatus;
  items: CloseFlowItem[];
};

export type ClinicalCloseFlowInput = {
  consultationStatus: string;
  chiefComplaint?: string | null;
  notes?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  autosaveStatus?: AutosaveStatus;
  documentationGaps: DocumentationGap[];
  documentationQuality: DocumentationQuality;
  isSigned: boolean;
  isLocked: boolean;
  canPay: boolean;
  hasPatient: boolean;
  pendingLabsCount?: number;
};

export type ClinicalCloseFlowView = {
  phases: CloseFlowPhase[];
  consultationStatusLabel: string;
  gapCount: number;
  qualityScore: number;
  qualityLabel: DocumentationQuality["label"];
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Borrador",
  in_progress: "En progreso",
  completed: "Completada",
  signed: "Firmada",
  locked: "Bloqueada",
};

export function closeFlowStatusIcon(status: CloseFlowItemStatus): string {
  switch (status) {
    case "complete":
      return "✓";
    case "attention":
      return "⚠";
    case "pending":
      return "○";
    default:
      return "—";
  }
}

export function rollupCloseFlowPhaseStatus(
  items: CloseFlowItem[],
): CloseFlowItemStatus {
  const visible = items.filter((i) => i.status !== "na");
  if (visible.length === 0) return "na";
  if (visible.some((i) => i.status === "pending")) return "pending";
  if (visible.some((i) => i.status === "attention")) return "attention";
  return "complete";
}

function hasSoapBaseline(input: ClinicalCloseFlowInput): boolean {
  const notesLen = input.notes?.trim().length ?? 0;
  return Boolean(
    input.chiefComplaint?.trim() ||
      notesLen >= 20 ||
      (input.diagnosis?.trim() && notesLen >= 8),
  );
}

/** Construye vista del wizard — solo reutiliza estados ya calculados en frontend. */
export function buildClinicalCloseFlowView(
  input: ClinicalCloseFlowInput,
): ClinicalCloseFlowView {
  const soapOk = hasSoapBaseline(input);
  const autosaveOk = input.autosaveStatus !== "error";
  const gapCount = input.documentationGaps.length;

  const documentItems: CloseFlowItem[] = [
    {
      id: "soap",
      label: "Documentación SOAP",
      status:
        soapOk && autosaveOk
          ? "complete"
          : input.autosaveStatus === "error"
            ? "attention"
            : "pending",
      detail:
        input.autosaveStatus === "error"
          ? "Error al guardar borrador — revise conexión"
          : soapOk
            ? "Motivo, notas o diagnóstico documentados"
            : "Complete motivo y notas clínicas",
    },
    {
      id: "quality",
      label: "Documentation Quality™",
      status:
        input.documentationQuality.label === "Incompleto"
          ? "attention"
          : "complete",
      detail: `${input.documentationQuality.score}/100 · ${input.documentationQuality.label} (informativo)`,
    },
  ];

  const reviewItems: CloseFlowItem[] = [
    {
      id: "gaps",
      label: "Gaps documentales",
      status: gapCount === 0 ? "complete" : "attention",
      detail:
        gapCount === 0
          ? "Sin gaps relevantes detectados"
          : `${gapCount} oportunidad${gapCount === 1 ? "" : "es"} — ver Copilot`,
    },
    {
      id: "orders",
      label: "Órdenes y plan",
      status:
        input.treatment?.trim() || input.consultationStatus !== "draft"
          ? "complete"
          : "pending",
      detail:
        (input.pendingLabsCount ?? 0) > 0
          ? `${input.pendingLabsCount} lab(s) pendientes en memoria`
          : "Revise recetas y órdenes en el panel",
    },
  ];

  const signItems: CloseFlowItem[] = [
    {
      id: "signature",
      label: "Firma de consulta",
      status: input.isSigned ? "complete" : "pending",
      detail: input.isSigned
        ? "Consulta firmada"
        : "Use «Firmar consulta» en la cabecera",
    },
  ];

  const deliverItems: CloseFlowItem[] = [
    {
      id: "documents",
      label: "Documentos clínicos",
      status: input.isLocked
        ? "complete"
        : input.isSigned
          ? "attention"
          : "pending",
      detail: input.isLocked
        ? "Consulta entregada y bloqueada"
        : input.isSigned
          ? "Genere PDF, receta o certificado si aplica"
          : "Disponible tras firmar",
    },
  ];

  if (input.canPay) {
    deliverItems.push({
      id: "payment",
      label: "Pago",
      status: input.isLocked ? "complete" : input.isSigned ? "attention" : "pending",
      detail: input.isLocked
        ? "Pago confirmado"
        : input.isSigned
          ? "Puede cobrar desde la cabecera"
          : "Disponible tras firmar",
    });
  }

  deliverItems.push({
    id: "delivery",
    label: "Entrega al paciente",
    status: !input.hasPatient
      ? "na"
      : input.isLocked
        ? "complete"
        : input.isSigned
          ? "attention"
          : "pending",
    detail: input.hasPatient
      ? "Use «Compartir consulta» en la cabecera"
      : undefined,
  });

  const phases: CloseFlowPhase[] = [
    {
      id: "document",
      label: "Documentar",
      items: documentItems,
      status: rollupCloseFlowPhaseStatus(documentItems),
    },
    {
      id: "review",
      label: "Revisar",
      items: reviewItems,
      status: rollupCloseFlowPhaseStatus(reviewItems),
    },
    {
      id: "sign",
      label: "Firmar",
      items: signItems,
      status: rollupCloseFlowPhaseStatus(signItems),
    },
    {
      id: "deliver",
      label: "Entregar",
      items: deliverItems,
      status: rollupCloseFlowPhaseStatus(deliverItems),
    },
  ];

  return {
    phases,
    consultationStatusLabel:
      STATUS_LABELS[input.consultationStatus] ?? input.consultationStatus,
    gapCount,
    qualityScore: input.documentationQuality.score,
    qualityLabel: input.documentationQuality.label,
  };
}
