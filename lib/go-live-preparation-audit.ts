/**
 * Phase 4.9.2 — GO-Live Preparation Audit™
 *
 * Runbook ops + guía E2E + checklist GO-LIVE.
 * Sin modificar prod, UX, flags en código ni nuevas features.
 */

import { P0_CLINICAL_CASES } from "./clinical-e2e-production-readiness-audit";

export type RunbookStep = {
  order: number;
  action: string;
  verify: string;
  rollback?: string;
};

/** PARTE A — Operations Runbook Vercel Preview */
export const VERCEL_PREVIEW_RUNBOOK: RunbookStep[] = [
  {
    order: 1,
    action:
      "Acceder Vercel Dashboard → Team SAVAC → proyecto heydoctor-frontend",
    verify: "Proyecto visible con último deploy de main/d2cc61a9+",
  },
  {
    order: 2,
    action: "Settings → Environment Variables → Add New",
    verify: "Panel de variables abierto",
  },
  {
    order: 3,
    action:
      "Nombre: NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE | Value: 1 | Environments: Preview ✓ (Production ✗ en esta fase)",
    verify: "Variable listada con scope Preview únicamente",
  },
  {
    order: 4,
    action:
      "Nombre: NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE | Value: 1 | Environments: Preview ✓",
    verify: "Variable listada con scope Preview únicamente",
  },
  {
    order: 5,
    action:
      "Deployments → seleccionar último preview (o push vacío a rama con PR) → Redeploy",
    verify: "Build Next.js completa sin error; SHA incluye flags en compile",
    rollback: "Eliminar variables Preview y redeploy",
  },
  {
    order: 6,
    action:
      "Copiar URL preview (ej. heydoctor-frontend-xxx.vercel.app) — NO usar prod",
    verify: "URL responde 200 en /login",
  },
  {
    order: 7,
    action:
      "Login médico → /panel/consultas/[uuid-con-paciente] (viewport ≥1280px)",
    verify: "Ver checklist VISUAL_VALIDATIONS",
  },
  {
    order: 8,
    action: "Completar GO_LIVE_CHECK.preview antes de E2E",
    verify: "Todos los ítems preview marcados",
  },
];

export const VISUAL_VALIDATIONS = [
  {
    id: "v-layout-2col",
    selector: '[data-testid="encounter-split-layout"]',
    expected: 'data-columns="1" AND data-clinical-action-workspace="true" (ADR-019)',
    failMeans: "Flags OFF en build preview — redeploy con vars Preview",
  },
  {
    id: "v-smart-soap",
    selector: '[data-smart-workspace="true"]',
    expected: "Presente en SOAP Command Center",
    failMeans: "NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE no aplicado en build",
  },
  {
    id: "v-action-bar",
    selector: '[data-testid="clinical-action-bar"]',
    expected: "Visible bajo chrome cuando hay patientId",
    failMeans: "Action Workspace OFF o consulta sin paciente",
  },
  {
    id: "v-module-sheet",
    selector: '[data-testid="clinical-module-sheet"]',
    expected: "Abre al clic chip Recetas/Lab/Documentos",
    failMeans: "ClinicalModuleSheet no montado",
  },
  {
    id: "v-close-flow",
    selector: "text=/Documentar|Revisar|Firmar|Entregar/",
    expected: "Clinical Close Flow visible bajo PatientSnapshot",
    failMeans: "Regresión chrome encounter",
  },
  {
    id: "v-legacy-blocked",
    url: "/panel/consultas",
    expected: "Banner «Workspace clínico oficial» + botón Abrir consulta (sin workspace inline Rx/Lab)",
    failMeans: "F4 guard-rail roto — revisar LEGACY_INLINE_CONSULTATION_WORKSPACE",
  },
  {
    id: "v-no-3col",
    selector: '[data-testid="encounter-split-layout"][data-columns="3"]',
    expected: "NO debe existir en preview oficial",
    failMeans: "Layout legacy activo — flags incorrectos",
  },
] as const;

export type E2eEnvVar = {
  name: string;
  required: boolean;
  scope: "auth" | "case" | "infra";
  description: string;
  example: string;
};

/** PARTE B — Variables E2E auditadas desde e2e/.env.e2e.example + playwright.config.ts */
export const E2E_ENV_VARS: E2eEnvVar[] = [
  {
    name: "E2E_BASE_URL",
    required: true,
    scope: "infra",
    description: "URL preview Vercel SIN trailing slash. Build debe tener flags ON.",
    example: "https://heydoctor-frontend-abc123.vercel.app",
  },
  {
    name: "E2E_DOCTOR_EMAIL",
    required: true,
    scope: "auth",
    description: "Email médico con acceso panel staging/preview",
    example: "medico.staging@heydoctor.health",
  },
  {
    name: "E2E_DOCTOR_PASSWORD",
    required: true,
    scope: "auth",
    description: "Contraseña médico staging — NO commitear",
    example: "(secreto)",
  },
  {
    name: "E2E_CONSULTATION_HTA",
    required: true,
    scope: "case",
    description: "UUID consulta P0-1: paciente con memoria I10, status draft/in_progress",
    example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  },
  {
    name: "E2E_CONSULTATION_DM2",
    required: true,
    scope: "case",
    description: "UUID consulta P0-2: paciente E11, in_progress",
    example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  },
  {
    name: "E2E_CONSULTATION_ACUTE",
    required: true,
    scope: "case",
    description: "UUID consulta P0-3: paciente nuevo/sin memoria crónica, draft",
    example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  },
  {
    name: "E2E_CONSULTATION_PAYMENT",
    required: true,
    scope: "case",
    description: "UUID consulta P0-4: status signed, Payku sandbox configurado en backend",
    example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  },
];

export const E2E_DEPENDENCIES = [
  { name: "@playwright/test", install: "npm install --include=dev", inPackageJson: true },
  {
    name: "chromium",
    install: "npx playwright install chromium",
    inPackageJson: false,
  },
  {
    name: "NEXT_PUBLIC_HEYDOCTOR_API_URL",
    install: "Configurado en Vercel Preview apuntando a API staging",
    inPackageJson: false,
  },
  {
    name: "Backend c10e284",
    install: "API staging accesible desde preview (CORS + auth)",
    inPackageJson: false,
  },
  {
    name: "Payku sandbox",
    install: "Solo P0-4 — backend staging con create-payment-session",
    inPackageJson: false,
  },
] as const;

export const E2E_EXECUTION_STEPS = [
  "cd heydoctor-frontend",
  "git checkout main && git pull  # commit d2cc61a9 o posterior",
  "npm install --include=dev",
  "npx playwright install chromium",
  "cp e2e/.env.e2e.example .env.e2e",
  "# Editar .env.e2e — completar E2E_BASE_URL (preview), credenciales y 4 UUIDs",
  "set -a && source .env.e2e && set +a   # macOS/Linux",
  "npm run test:e2e",
  "# Resultado esperado: 10 tests — 0 skipped, ≥8 pass (P0-4 puede skip Payku manual)",
  "open playwright-report/index.html  # si falla algún test",
] as const;

export const PLAYWRIGHT_CONFIG_AUDIT = {
  configPath: "e2e/playwright.config.ts",
  specPath: "e2e/clinical-p0.spec.ts",
  testDir: "e2e/",
  workers: 1,
  timeoutMs: 120_000,
  projects: ["chromium-desktop-official-ws (1440×900)", "chromium-mobile-official-ws (Pixel 7)"],
  totalTestsPerRun: 10,
  skipCondition: "!E2E_BASE_URL || !E2E_DOCTOR_EMAIL || !E2E_DOCTOR_PASSWORD",
  perCaseSkip: "E2E_CONSULTATION_* ausente → ese caso skipped en ambos projects",
} as const;

export type GoLiveCheckItem = {
  id: string;
  phase: "preview" | "e2e" | "smoke" | "prod";
  label: string;
  required: boolean;
  automated: boolean;
};

/** PARTE C — GO-LIVE CHECK (criterios antes de activar prod) */
export const GO_LIVE_CHECK: GoLiveCheckItem[] = [
  { id: "gl-01", phase: "preview", label: "Flags Preview seteados (Action=1, Smart=1)", required: true, automated: false },
  { id: "gl-02", phase: "preview", label: "Redeploy preview OK sin errores build", required: true, automated: false },
  { id: "gl-03", phase: "preview", label: "Validación visual v-layout-2col PASS", required: true, automated: true },
  { id: "gl-04", phase: "preview", label: "Validación visual v-smart-soap PASS", required: true, automated: true },
  { id: "gl-05", phase: "preview", label: "Validación visual v-action-bar PASS", required: true, automated: true },
  { id: "gl-06", phase: "preview", label: "Validación visual v-legacy-blocked PASS", required: true, automated: false },
  { id: "gl-07", phase: "e2e", label: ".env.e2e completo (7 variables)", required: true, automated: false },
  { id: "gl-08", phase: "e2e", label: "P0-1 HTA PASS (desktop)", required: true, automated: true },
  { id: "gl-09", phase: "e2e", label: "P0-2 DM2 PASS (desktop)", required: true, automated: true },
  { id: "gl-10", phase: "e2e", label: "P0-3 Aguda PASS (desktop)", required: true, automated: true },
  { id: "gl-11", phase: "e2e", label: "P0-4 Pago PASS o documentado skip Payku", required: true, automated: true },
  { id: "gl-12", phase: "smoke", label: "HeyDoctor Copilot abre sin error", required: true, automated: true },
  { id: "gl-13", phase: "smoke", label: "Autosave indicator saved tras edit SOAP", required: true, automated: true },
  { id: "gl-14", phase: "smoke", label: "Payment gate: botón pago NO visible en completed", required: true, automated: false },
  { id: "gl-15", phase: "smoke", label: "Signed docs gate: PDF disabled pre-firma", required: true, automated: false },
  { id: "gl-16", phase: "prod", label: "Repetir gl-01/gl-02 en scope Production", required: true, automated: false },
  { id: "gl-17", phase: "prod", label: "Redeploy prod con flags ON", required: true, automated: false },
  { id: "gl-18", phase: "prod", label: "Smoke post-prod 24h sin incidentes Sentry", required: true, automated: false },
];

export const GO_LIVE_DECISION_MATRIX = {
  previewReady: "gl-01..gl-06 completados",
  e2eReady: "gl-07..gl-11 completados — 0 skipped en suite desktop mínimo",
  prodGo: "previewReady + e2eReady + gl-16..gl-18",
  currentPhase492Status: "PREPARATION_ONLY — checklist entregado, ejecución pendiente ops",
} as const;

export type GoLiveVerdict = {
  workspaceProdActivation: "GO" | "NO_GO" | "PENDING_OPS";
  summary: string;
  nextSteps: string[];
};

export function evaluateGoLiveVerdict(): GoLiveVerdict {
  return {
    workspaceProdActivation: "PENDING_OPS",
    summary:
      "Phase 4.9.2 entrega runbook + guía E2E + GO-LIVE CHECK. Activación prod permanece PENDING hasta que ops complete checklist gl-01..gl-18.",
    nextSteps: [
      "Ejecutar VERCEL_PREVIEW_RUNBOOK pasos 1–8",
      "Completar .env.e2e y E2E_EXECUTION_STEPS",
      "Marcar GO_LIVE_CHECK preview + e2e",
      "Solo entonces: gl-16 prod flags + redeploy",
    ],
  };
}

export function runGoLivePreparationSummary() {
  const verdict = evaluateGoLiveVerdict();
  return {
    runbookSteps: VERCEL_PREVIEW_RUNBOOK.length,
    visualValidations: VISUAL_VALIDATIONS.length,
    e2eEnvVars: E2E_ENV_VARS.length,
    e2eRequiredVars: E2E_ENV_VARS.filter((v) => v.required).length,
    p0Cases: P0_CLINICAL_CASES.length,
    goLiveCheckItems: GO_LIVE_CHECK.length,
    goLiveRequired: GO_LIVE_CHECK.filter((i) => i.required).length,
    playwrightTestsPerRun: PLAYWRIGHT_CONFIG_AUDIT.totalTestsPerRun,
    verdict: verdict.workspaceProdActivation,
  };
}
