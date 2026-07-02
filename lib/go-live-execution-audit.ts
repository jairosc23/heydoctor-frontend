/**
 * Phase 4.9.3 — GO-Live Execution Audit™
 *
 * Consolidación readiness 4.8.6 → 4.9.2 + estado GO-LIVE CHECK.
 * Sin modificar código clínico, prod, UX ni flags.
 */

import { CODE_AUDIT_FINDINGS } from "./clinical-e2e-production-readiness-audit";
import { BLOCKER_RESOLUTIONS, REMAINING_RISKS } from "./production-blockers-resolution-audit";
import { GO_LIVE_CHECK } from "./go-live-preparation-audit";
import { RUNTIME_E2E_SESSION } from "./staging-activation-runtime-e2e-audit";

export type GoLiveCheckStatus = "COMPLETADO" | "PENDIENTE" | "NO VERIFICABLE";

export type GoLiveCheckExecution = {
  id: string;
  phase: "preview" | "e2e" | "smoke" | "prod";
  label: string;
  status: GoLiveCheckStatus;
  evidence: string;
};

/** Evidencia sesión 4.9.3 — sin .env.e2e, sin acceso Vercel, E2E 10 skipped en 4.9.1. */
export const SESSION_EVIDENCE = {
  frontendCommit: "5eb09cef",
  backendCommit: "c10e284",
  envE2ePresent: false,
  vercelDashboardAccess: false,
  lastE2eRun: RUNTIME_E2E_SESSION,
  codeBlockersF1F4Resolved: true,
} as const;

export type TechnicalBlocker = {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  category: "code" | "operational" | "residual";
  description: string;
  open: boolean;
  resolvedIn?: string;
};

/** PARTE A — Bloqueadores técnicos acumulados 4.8.6 → 4.9.2 */
export const TECHNICAL_BLOCKERS_INVENTORY: TechnicalBlocker[] = [
  {
    id: "F1-canPay-completed",
    severity: "critical",
    category: "code",
    description: "canPay permitía pago antes de firma",
    open: false,
    resolvedIn: "4.9.0 — resolveCanPay(status) === signed",
  },
  {
    id: "F2-autosave-no-flush-sign",
    severity: "high",
    category: "code",
    description: "handleSign sin flushNow()",
    open: false,
    resolvedIn: "4.9.0 — await flushNow() pre-firma",
  },
  {
    id: "F3-signed-rx-pre-signature",
    severity: "high",
    category: "code",
    description: "documentos firmados habilitados pre-firma",
    open: false,
    resolvedIn: "4.9.0 — buildConsultationDocumentDisabled",
  },
  {
    id: "F4-legacy-consultas-page",
    severity: "high",
    category: "code",
    description: "workspace inline legacy divergente",
    open: false,
    resolvedIn: "4.9.0 — LEGACY_INLINE_CONSULTATION_WORKSPACE=false",
  },
  {
    id: "F5-flags-default-off",
    severity: "high",
    category: "operational",
    description: "Flags compile-time default false; prod env no verificado",
    open: true,
    resolvedIn: undefined,
  },
  {
    id: "F6-chiefComplaint-autosave",
    severity: "low",
    category: "residual",
    description: "chiefComplaint fuera de buildSoapDraftKey",
    open: true,
    resolvedIn: undefined,
  },
  {
    id: "F7-close-flow-orders-proxy",
    severity: "low",
    category: "residual",
    description: "Close Flow no valida órdenes vía API",
    open: true,
    resolvedIn: undefined,
  },
  {
    id: "e2e-runtime-not-executed",
    severity: "high",
    category: "operational",
    description: "Casos P0 Playwright no ejecutados contra staging/preview",
    open: true,
    resolvedIn: undefined,
  },
];

export function listOpenTechnicalBlockers(): TechnicalBlocker[] {
  return TECHNICAL_BLOCKERS_INVENTORY.filter((b) => b.open);
}

export function listOpenCodeBlockers(): TechnicalBlocker[] {
  return TECHNICAL_BLOCKERS_INVENTORY.filter(
    (b) => b.open && b.category === "code",
  );
}

/** Histórico CODE_AUDIT_FINDINGS 4.8.6 — referencia; F1–F4 resueltos en código. */
export const PHASE_486_FINDINGS_STATUS = CODE_AUDIT_FINDINGS.map((f) => ({
  id: f.id,
  blocksGoIn486: f.blocksGo,
  codeResolved:
    f.id.startsWith("F1") ||
    f.id.startsWith("F2") ||
    f.id.startsWith("F3") ||
    f.id.startsWith("F4"),
  note:
    f.id.startsWith("F1") ||
    f.id.startsWith("F2") ||
    f.id.startsWith("F3") ||
    f.id.startsWith("F4")
      ? "Resuelto 4.9.0"
      : f.blocksGo
        ? "Operacional/residual"
        : "Residual documentado",
}));

/** PARTE B — GO-LIVE CHECK gl-01..gl-18 */
export const GO_LIVE_CHECK_EXECUTION: GoLiveCheckExecution[] = GO_LIVE_CHECK.map(
  (item) => {
    let status: GoLiveCheckStatus = "PENDIENTE";
    let evidence =
      "No ejecutado en sesión 4.9.3 — sin acceso Vercel ni .env.e2e";

    if (item.id === "gl-14" || item.id === "gl-15") {
      status = "NO VERIFICABLE";
      evidence =
        "Fix código 4.9.0 + unit tests PASS (consultation-production-gates.test.ts); smoke runtime staging no ejecutado";
    }

    return {
      id: item.id,
      phase: item.phase,
      label: item.label,
      status,
      evidence,
    };
  },
);

export function summarizeGoLiveCheckExecution() {
  const counts = {
    COMPLETADO: 0,
    PENDIENTE: 0,
    NO_VERIFICABLE: 0,
  };
  for (const item of GO_LIVE_CHECK_EXECUTION) {
    if (item.status === "COMPLETADO") counts.COMPLETADO += 1;
    else if (item.status === "PENDIENTE") counts.PENDIENTE += 1;
    else counts.NO_VERIFICABLE += 1;
  }
  return {
    total: GO_LIVE_CHECK_EXECUTION.length,
    ...counts,
    allComplete: counts.COMPLETADO === GO_LIVE_CHECK_EXECUTION.length,
  };
}

export type HypotheticalActivationReview = {
  assumption: string;
  technicalBlockersRemaining: string[];
  recommendation: "GO" | "NO_GO";
  rationale: string;
};

/** PARTE C — Decisión técnica bajo supuestos ops cumplidos */
export const HYPOTHETICAL_ACTIVATION_REVIEW: HypotheticalActivationReview = {
  assumption:
    "Flags Preview activadas + redeploy OK + E2E P0 PASS + Smoke PASS (gl-01..gl-15)",
  technicalBlockersRemaining: [
    "Ningún bloqueador de código crítico/alto abierto post-4.9.0",
    "F6/F7 residual bajo — no impiden activación workspace layout",
    "F5 se resuelve al setear flags prod (gl-16..17) — no es defecto código",
  ],
  recommendation: "GO",
  rationale:
    "Con evidencia runtime positiva en preview, no existe razón técnica en frontend a0804dd6+/5eb09cef para impedir Clinical Action Workspace™ + Smart Clinical Workspace™ como experiencia oficial. Backend c10e284 sin cambios requeridos. Residuales F6/F7 son mejoras futuras, no gates de prod.",
};

export type Phase493FinalVerdict = {
  currentProdActivation: "GO" | "NO_GO";
  hypotheticalAfterOps: "GO" | "NO_GO";
  openCodeBlockers: number;
  openOperationalBlockers: number;
  goLiveCheckCompleted: number;
  summary: string;
  blocksProdActivation: string[];
};

/** PARTE D — Veredicto final producto */
export function evaluatePhase493FinalVerdict(): Phase493FinalVerdict {
  const openCode = listOpenCodeBlockers();
  const openAll = listOpenTechnicalBlockers();
  const openOps = openAll.filter((b) => b.category === "operational");
  const checkSummary = summarizeGoLiveCheckExecution();

  return {
    currentProdActivation: "NO_GO",
    hypotheticalAfterOps: "GO",
    openCodeBlockers: openCode.length,
    openOperationalBlockers: openOps.length,
    goLiveCheckCompleted: checkSummary.COMPLETADO,
    summary:
      "Estado actual: NO GO prod — 0/18 GO-LIVE CHECK completados, 0 bloqueadores código abiertos. Tras ejecución ops exitosa (preview E2E + smoke), activación permanente workspace es técnicamente viable (GO hipotético).",
    blocksProdActivation: [
      "gl-01..gl-18 sin completar (17 PENDIENTE, 2 NO VERIFICABLE runtime)",
      "F5: flags prod no activados",
      "E2E runtime: 0/4 P0 ejecutados (evidencia 4.9.1)",
      "Sin verificación Vercel Preview en sesión 4.9.3",
    ],
  };
}

export const PHASE_ACCUMULATED_SUMMARY = {
  "4.8.6": "Pre-flight FAIL F1–F5; E2E spec creada; NO GO",
  "4.9.0": "F1–F4 código resuelto; F5 documentado; NO GO ops",
  "4.9.1": "E2E 10 skipped; NO GO ops",
  "4.9.2": "Runbook + GO-LIVE CHECK entregado; PENDING_OPS",
  "4.9.3": "Execution audit — estado real documentado",
} as const;

export function runGoLiveExecutionAuditSummary() {
  const verdict = evaluatePhase493FinalVerdict();
  const check = summarizeGoLiveCheckExecution();
  return {
    phasesReviewed: Object.keys(PHASE_ACCUMULATED_SUMMARY).length,
    openCodeBlockers: verdict.openCodeBlockers,
    openBlockersTotal: listOpenTechnicalBlockers().length,
    blockerResolutions490: BLOCKER_RESOLUTIONS.filter((b) => b.status === "resolved")
      .length,
    goLiveCheckTotal: check.total,
    goLiveCheckCompletado: check.COMPLETADO,
    goLiveCheckPendiente: check.PENDIENTE,
    goLiveCheckNoVerificable: check.NO_VERIFICABLE,
    currentProdActivation: verdict.currentProdActivation,
    hypotheticalAfterOps: verdict.hypotheticalAfterOps,
    remainingRisksLow: REMAINING_RISKS.filter((r) => r.severity === "low").length,
  };
}
