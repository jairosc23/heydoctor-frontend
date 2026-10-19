/**
 * Phase 4.8.4 — Clinical Close Flow Audit™
 */

export type CloseFlowStateSource = {
  id: string;
  label: string;
  module: string;
  reused: boolean;
  note?: string;
};

export const CLOSE_FLOW_REUSED_STATES: CloseFlowStateSource[] = [
  {
    id: "consultation-status",
    label: "draft | in_progress | completed | signed | locked",
    module: "page.tsx → consultation.status",
    reused: true,
  },
  {
    id: "is-signed-locked",
    label: "isSigned / isLocked / canPay",
    module: "page.tsx derivados de status",
    reused: true,
  },
  {
    id: "documentation-gaps",
    label: "documentationGaps[]",
    module: "buildClinicalCopilotIntelligence → buildDocumentationGaps",
    reused: true,
  },
  {
    id: "documentation-quality",
    label: "documentationQuality score/label",
    module: "buildClinicalCopilotIntelligence → buildDocumentationQuality",
    reused: true,
  },
  {
    id: "autosave",
    label: "autosaveStatus",
    module: "useConsultationAutosave",
    reused: true,
  },
  {
    id: "soap-fields",
    label: "chiefComplaint, notes, diagnosis, treatment",
    module: "page.tsx state",
    reused: true,
  },
  {
    id: "pending-labs",
    label: "pendingLabsCount",
    module: "CopilotContextView.pendingLabs (memoria clínica)",
    reused: true,
  },
];

export const CLOSE_FLOW_MISSING_STATES = [
  {
    id: "documents-generated",
    label: "Flag «PDF/receta generada»",
    impact: "Wizard infiere por isSigned/isLocked, no por generación real",
  },
  {
    id: "delivery-confirmed",
    label: "Flag «consulta compartida/entregada»",
    impact: "Entrega orienta a Compartir — sin confirmación backend",
  },
  {
    id: "orders-emitted",
    label: "Conteo órdenes activas en consulta",
    impact: "Proxy: treatment + status; no query a OrdersTab",
  },
  {
    id: "payment-pending-explicit",
    label: "Estado pago intermedio",
    impact: "canPay ambiguo en signed/completed (audit 4.8.1)",
  },
] as const;

export const CLOSE_FLOW_RISKS = [
  "Quality Score nunca bloquea firma — solo orientación (requisito 4.8.4)",
  "Gaps Copilot pueden diferir de criterio médico individual",
  "Órdenes no verificadas vía API — revisión manual sugerida",
  "Completada ≠ Firmada ≠ Entregada — wizard aclara pero no unifica backend",
];

export function runClinicalCloseFlowAuditSummary() {
  return {
    reusedStates: CLOSE_FLOW_REUSED_STATES.length,
    missingStates: CLOSE_FLOW_MISSING_STATES.length,
    risks: CLOSE_FLOW_RISKS.length,
  };
}
