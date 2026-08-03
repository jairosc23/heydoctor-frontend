/**
 * Phase 4.9.1 — Staging Activation & Runtime E2E Audit™
 *
 * Validación operacional — sin modificar prod, sin nuevas features.
 */

import { isClinicalActionWorkspaceEnabled } from "./clinical-action-workspace";
import { isSmartClinicalWorkspaceEnabled } from "./smart-clinical-workspace";
import { P0_CLINICAL_CASES } from "./clinical-e2e-production-readiness-audit";

export type EnvFlagAudit = {
  env: string;
  expectedValue: string;
  defaultInCode: boolean;
  documentedInEnvExample: boolean;
  committedInRepo: string;
  vercelProdModified: false;
};

export const ENVIRONMENT_AUDIT: EnvFlagAudit[] = [
  {
    env: "NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE",
    expectedValue: "1",
    defaultInCode: isClinicalActionWorkspaceEnabled(undefined),
    documentedInEnvExample: true,
    committedInRepo: "comentado en .env.example (# NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE=1)",
    vercelProdModified: false,
  },
  {
    env: "NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE",
    expectedValue: "1",
    defaultInCode: isSmartClinicalWorkspaceEnabled(undefined),
    documentedInEnvExample: true,
    committedInRepo: "comentado en .env.example (# NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE=1)",
    vercelProdModified: false,
  },
];

/** Pasos exactos Vercel — staging/preview únicamente (NO prod en 4.9.1). */
export const VERCEL_STAGING_ACTIVATION_STEPS = [
  "1. Vercel Dashboard → proyecto heydoctor-frontend (o app.heydoctor.health)",
  "2. Settings → Environment Variables",
  "3. Añadir NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE = 1 → scope Preview (y Staging si existe)",
  "4. Añadir NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE = 1 → scope Preview",
  "5. NO modificar Production en esta fase (4.9.1)",
  "6. Deployments → último preview → Redeploy (o push a rama preview)",
  "7. Esperar build Next.js completo (flags compile-time)",
  "8. Abrir /panel/consultas/[id] en preview URL",
  "9. DevTools: [data-testid=encounter-split-layout] data-clinical-action-workspace=true data-columns=1 (ADR-019)",
  "10. DevTools: [data-smart-workspace=true] en SOAP section",
  "11. Configurar e2e/.env.e2e desde e2e/.env.e2e.example",
  "12. npm run test:e2e contra preview URL",
] as const;

export const WORKSPACE_ACTIVATION_CHECKLIST = {
  vercel: [
    "Variables Preview/Staging seteadas (ambos flags = 1)",
    "Production sin cambios en 4.9.1",
    "Redeploy completado sin errores build",
  ],
  postDeployValidation: [
    "Layout workstation generación B (data-columns=1, ADR-019)",
    "ClinicalActionBar visible con patientId",
    "SoapStickyNav / data-smart-workspace en SOAP",
    "ClinicalModuleSheet abre desde Action Bar",
    "Legacy inline /panel/consultas bloqueado (banner redirect)",
  ],
  actionWorkspaceOn: "NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE=1 en build preview",
  smartWorkspaceOn: "NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE=1 en build preview",
} as const;

export type RuntimeE2eResult = {
  caseId: string;
  name: string;
  status: "pass" | "fail" | "skipped" | "not_executed";
  blockers: string[];
};

export type E2eSessionReport = {
  executedAt: string;
  baseUrl: string | null;
  credentialsPresent: boolean;
  consultationSeedsPresent: boolean;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  cases: RuntimeE2eResult[];
};

/** Reporte sesión 4.9.1 — E2E no ejecutado (sin .env.e2e ni acceso Vercel). */
export const RUNTIME_E2E_SESSION: E2eSessionReport = {
  executedAt: "2026-06-10",
  baseUrl: null,
  credentialsPresent: false,
  consultationSeedsPresent: false,
  totalTests: 10,
  passed: 0,
  failed: 0,
  skipped: 10,
  cases: P0_CLINICAL_CASES.map((c) => ({
    caseId: c.id,
    name: c.name,
    status: "skipped" as const,
    blockers: [
      "E2E_BASE_URL no configurado",
      "E2E_DOCTOR_EMAIL / E2E_DOCTOR_PASSWORD ausentes",
      `Seed consultation env ausente (ver e2e/.env.e2e.example)`,
    ],
  })),
};

export type SmokeTestItem = {
  id: string;
  surface: string;
  method: "e2e" | "manual" | "static";
  status: "pass" | "fail" | "skipped" | "static_pass";
  note: string;
};

/** Part D — smoke post-deploy (runtime skipped; gates 4.9.0 verificados estáticamente). */
export const POST_DEPLOY_SMOKE_TESTS: SmokeTestItem[] = [
  {
    id: "smoke-copilot",
    surface: "HeyDoctor Copilot",
    method: "e2e",
    status: "skipped",
    note: "P0-3 incluye apertura drawer — pendiente runtime",
  },
  {
    id: "smoke-live-ai-notes",
    surface: "LiveAiNoteSuggestions",
    method: "e2e",
    status: "skipped",
    note: "Montado en SoapSection — pendiente runtime",
  },
  {
    id: "smoke-orders",
    surface: "Orders Workspace",
    method: "e2e",
    status: "skipped",
    note: "P0-1/P0-2 — pendiente runtime",
  },
  {
    id: "smoke-close-flow",
    surface: "Clinical Close Flow",
    method: "e2e",
    status: "skipped",
    note: "P0-1 assert wizard — pendiente runtime",
  },
  {
    id: "smoke-doc-gen",
    surface: "Document Generation",
    method: "e2e",
    status: "skipped",
    note: "P0-3 documents module — pendiente runtime",
  },
  {
    id: "smoke-payment-gate",
    surface: "Payment Gate (F1)",
    method: "static",
    status: "static_pass",
    note: "resolveCanPay solo signed — lib/consultation-production-gates.ts",
  },
  {
    id: "smoke-signed-docs-gate",
    surface: "Signed Documents Gate (F3)",
    method: "static",
    status: "static_pass",
    note: "buildConsultationDocumentDisabled — tests unitarios PASS",
  },
  {
    id: "smoke-legacy-guard",
    surface: "Legacy Route Guard (F4)",
    method: "static",
    status: "static_pass",
    note: "LEGACY_INLINE_CONSULTATION_WORKSPACE=false en page.tsx",
  },
];

export const OPERATIONAL_RISKS_491 = [
  {
    id: "no-vercel-access",
    severity: "critical" as const,
    risk: "No se pudo verificar ni activar flags en Vercel staging en sesión 4.9.1",
    blocks: "Workspace activation confirmada + E2E runtime",
  },
  {
    id: "no-e2e-credentials",
    severity: "critical" as const,
    risk: "Sin .env.e2e — 10/10 tests Playwright skipped",
    blocks: "Runtime E2E P0 validation",
  },
  {
    id: "no-consultation-seeds",
    severity: "high" as const,
    risk: "UUIDs HTA/DM2/Aguda/Pago no provisionados para staging",
    blocks: "P0-1 a P0-4 ejecución completa",
  },
  {
    id: "payku-sandbox",
    severity: "high" as const,
    risk: "P0-4 requiere Payku sandbox configurado en staging backend",
    blocks: "P0-4 pass",
  },
  {
    id: "flags-compile-time",
    severity: "medium" as const,
    risk: "Activar flags sin redeploy no surte efecto",
    blocks: "Validación layout oficial",
  },
];

export type Phase491Verdict = {
  workspaceProdActivation: "GO" | "NO_GO";
  summary: string;
  blockers: string[];
};

export function evaluatePhase491WorkspaceActivation(): Phase491Verdict {
  const e2ePassed = RUNTIME_E2E_SESSION.passed >= 4;
  const e2eExecuted = RUNTIME_E2E_SESSION.skipped < RUNTIME_E2E_SESSION.totalTests;
  const stagingFlagsActivated = false; // no verificado en sesión

  const blockers: string[] = [];

  if (!stagingFlagsActivated) {
    blockers.push(
      "Flags workspace NO activados/verificados en Vercel Preview/Staging",
    );
  }
  if (!e2eExecuted) {
    blockers.push(
      "Runtime E2E no ejecutado — faltan E2E_BASE_URL, credenciales médico y seeds",
    );
  }
  if (!e2ePassed) {
    blockers.push(
      `Casos P0: ${RUNTIME_E2E_SESSION.passed}/4 PASS (0 ejecutados, ${RUNTIME_E2E_SESSION.skipped} skipped)`,
    );
  }

  const smokeRuntimeSkipped = POST_DEPLOY_SMOKE_TESTS.filter(
    (s) => s.method === "e2e" && s.status === "skipped",
  ).length;

  if (smokeRuntimeSkipped > 0) {
    blockers.push(
      `Smoke test runtime: ${smokeRuntimeSkipped} superficies sin validar en staging`,
    );
  }

  return {
    workspaceProdActivation: "NO_GO",
    summary:
      "NO GO para activación permanente en producción. Bloqueadores operacionales: staging flags sin confirmar, E2E runtime 0/4, smoke clínico pendiente.",
    blockers,
  };
}

export function runStagingActivationRuntimeE2eSummary() {
  const verdict = evaluatePhase491WorkspaceActivation();
  return {
    envFlags: ENVIRONMENT_AUDIT.length,
    defaultOffInCode: ENVIRONMENT_AUDIT.every((f) => f.defaultInCode === false),
    vercelProdModified: false,
    activationSteps: VERCEL_STAGING_ACTIVATION_STEPS.length,
    e2eTotal: RUNTIME_E2E_SESSION.totalTests,
    e2ePassed: RUNTIME_E2E_SESSION.passed,
    e2eSkipped: RUNTIME_E2E_SESSION.skipped,
    p0Cases: RUNTIME_E2E_SESSION.cases.length,
    smokeTests: POST_DEPLOY_SMOKE_TESTS.length,
    smokeStaticPass: POST_DEPLOY_SMOKE_TESTS.filter(
      (s) => s.status === "static_pass",
    ).length,
    operationalRisks: OPERATIONAL_RISKS_491.length,
    workspaceProdActivation: verdict.workspaceProdActivation,
    blockerCount: verdict.blockers.length,
  };
}
