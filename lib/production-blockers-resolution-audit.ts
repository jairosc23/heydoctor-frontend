/**
 * Phase 4.9.0 — Production Blockers Resolution Audit™
 */

import { isClinicalActionWorkspaceEnabled } from "./clinical-action-workspace";
import { isSmartClinicalWorkspaceEnabled } from "./smart-clinical-workspace";

export type BlockerResolution = {
  id: string;
  name: string;
  status: "resolved" | "documented" | "partial";
  before: string;
  after: string;
  impact: string;
  files: string[];
};

export const BLOCKER_RESOLUTIONS: BlockerResolution[] = [
  {
    id: "F1",
    name: "Payment Gate Fix",
    status: "resolved",
    before: "canPay = status === 'signed' || status === 'completed'",
    after: "resolveCanPay(status) → status === 'signed' únicamente",
    impact:
      "Botón pago en EncounterHeader oculto en completed; solo visible post-firma legal.",
    files: [
      "lib/consultation-production-gates.ts",
      "app/panel/consultas/[id]/page.tsx",
    ],
  },
  {
    id: "F2",
    name: "Autosave Flush Before Sign",
    status: "resolved",
    before: "handleSign → signConsultation sin persistir borrador debounced",
    after: "if (isEditable) await flushNow(); luego signConsultation",
    impact:
      "SOAP debounced (900ms) se persiste antes de firma; evita pérdida de notas/plan.",
    files: [
      "app/panel/consultas/[id]/page.tsx",
      "lib/hooks/useConsultationAutosave.ts",
    ],
  },
  {
    id: "F3",
    name: "Signed Documents Gate",
    status: "resolved",
    before:
      "signedPrescription disabled solo si !canSign; certificado/referral/premium sin gate",
    after:
      "buildConsultationDocumentDisabled — pdf + docs firmados requieren isSigned || isLocked",
    impact:
      "PDF clínico, receta/certificado/interconsulta/premium no exportables pre-firma.",
    files: [
      "lib/consultation-production-gates.ts",
      "app/panel/consultas/[id]/page.tsx",
    ],
  },
  {
    id: "F4",
    name: "Legacy Consultation Route Guard",
    status: "resolved",
    before:
      "app/panel/consultas/page.tsx montaba workspace inline (Rx, Lab, IA) en paralelo a [id]",
    after:
      "LEGACY_INLINE_CONSULTATION_WORKSPACE=false — render bloqueado; banner redirect a [id]; código conservado",
    impact:
      "Imposible operar flujo clínico divergente en /panel/consultas; selector + lista intactos.",
    files: ["app/panel/consultas/page.tsx"],
  },
  {
    id: "F5",
    name: "Workspace Env Validation",
    status: "documented",
    before:
      "Flags default false; SMART no documentado en .env.example; prod env desconocido",
    after:
      "WORKSPACE_ENV_VALIDATION audit + .env.example actualizado; sin cambio vars prod",
    impact:
      "Activación prod sigue siendo decisión ops (rebuild); riesgos documentados.",
    files: ["lib/production-blockers-resolution-audit.ts", ".env.example"],
  },
];

export const WORKSPACE_ENV_VALIDATION = {
  flags: {
    clinicalActionWorkspace: {
      env: "NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE",
      defaultInCode: isClinicalActionWorkspaceEnabled(undefined),
      expectedForOfficialWorkspace: "1",
      documentedInEnvExample: true,
    },
    smartClinicalWorkspace: {
      env: "NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE",
      defaultInCode: isSmartClinicalWorkspaceEnabled(undefined),
      expectedForOfficialWorkspace: "1",
      documentedInEnvExample: true,
    },
  },
  repoState: {
    note: "Sin acceso Vercel/Railway en 4.9.0 — valores prod deben verificarse manualmente en dashboard.",
    compileTime: true,
    rebuildRequiredOnChange: true,
  },
  activationRisks: [
    "Cambio de flag requiere rebuild Next.js — no toggle runtime",
    "Staging debe usar ambos flags ON antes de E2E P0",
    "Prod sin flags = layout legacy 3-col hasta activación explícita",
  ],
  recommendedOpsSequence: [
    "Setear flags en preview/staging → rebuild → E2E P0",
    "QA smoke 24h staging",
    "Setear flags prod → rebuild → monitoreo",
  ],
} as const;

export const REMAINING_RISKS = [
  {
    id: "e2e-runtime",
    severity: "high" as const,
    risk: "Casos P0 Playwright aún no ejecutados contra staging",
    mitigation: "Correr npm run test:e2e con credenciales staging",
  },
  {
    id: "f5-env-prod",
    severity: "medium" as const,
    risk: "Flags workspace OFF en prod hasta activación ops manual",
    mitigation: "WORKSPACE_ENV_VALIDATION.recommendedOpsSequence",
  },
  {
    id: "chiefComplaint-autosave",
    severity: "low" as const,
    risk: "chiefComplaint fuera de buildSoapDraftKey (F6 residual 4.8.6)",
    mitigation: "Fase posterior — fuera alcance 4.9.0",
  },
  {
    id: "close-flow-orders-proxy",
    severity: "low" as const,
    risk: "Close Flow no query órdenes API (F7 residual)",
    mitigation: "Fase posterior",
  },
];

export type Phase490Verdict = {
  blockersResolved: boolean;
  workspaceActivationGo: "GO" | "NO_GO";
  summary: string;
};

export function evaluatePhase490Verdict(): Phase490Verdict {
  const codeBlockersResolved = BLOCKER_RESOLUTIONS.filter(
    (b) => b.id !== "F5" && b.status === "resolved",
  ).length;

  const allCodeFixed = codeBlockersResolved === 4;

  return {
    blockersResolved: allCodeFixed,
    workspaceActivationGo: "NO_GO",
    summary: allCodeFixed
      ? "Bloqueadores de código F1–F4 resueltos. F5 documentado (activación env pendiente ops). Activación permanente workspace requiere E2E runtime PASS en staging — NO GO operacional hasta entonces."
      : "Bloqueadores de código pendientes.",
  };
}

export function runProductionBlockersResolutionSummary() {
  const verdict = evaluatePhase490Verdict();
  return {
    resolutions: BLOCKER_RESOLUTIONS.length,
    resolved: BLOCKER_RESOLUTIONS.filter((b) => b.status === "resolved").length,
    documented: BLOCKER_RESOLUTIONS.filter((b) => b.status === "documented").length,
    remainingRisks: REMAINING_RISKS.length,
    blockersResolved: verdict.blockersResolved,
    workspaceActivationGo: verdict.workspaceActivationGo,
  };
}
