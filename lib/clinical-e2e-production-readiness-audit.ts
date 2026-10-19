/**
 * Phase 4.8.6 — Clinical E2E Production Readiness Audit™
 *
 * Especificación E2E ejecutable + pre-flight estático sobre código.
 * No modifica UX, backend, flags ni rollback.
 */

import { E2E_MINIMUM_SPEC } from "./production-consolidation-audit";
import { WORKSPACE_LAYOUT_MATRIX } from "./workspace-production-standardization-audit";

export type E2eExecutionStatus =
  | "not_executed"
  | "pass_static"
  | "fail_static"
  | "blocked";

export type E2eSurface =
  | "autosave"
  | "clinical-memory"
  | "timeline"
  | "copilot"
  | "orders"
  | "module-sheet"
  | "signature"
  | "documents"
  | "payment"
  | "close-flow";

export type P0CaseDefinition = {
  id: string;
  name: string;
  priority: "P0";
  flow: string[];
  mapsToSpec: string[];
  surfaces: E2eSurface[];
  preconditions: string[];
  steps: string[];
  assertions: string[];
  flagMatrix: "official" | "legacy" | "both";
};

/** Cuatro casos P0 obligatorios Phase 4.8.6 — alineados a E2E_MINIMUM_SPEC 4.8.1. */
export const P0_CLINICAL_CASES: P0CaseDefinition[] = [
  {
    id: "p0-hta-followup",
    name: "HTA seguimiento",
    priority: "P0",
    flow: [
      "Paciente",
      "Memory",
      "SOAP",
      "Plan",
      "Receta",
      "Firma",
      "Documento",
    ],
    mapsToSpec: ["e2e-hta-followup"],
    surfaces: [
      "clinical-memory",
      "timeline",
      "autosave",
      "orders",
      "module-sheet",
      "signature",
      "documents",
      "copilot",
      "close-flow",
    ],
    preconditions: [
      "Paciente seed con memoria I10 / HTA",
      "Consulta draft o in_progress",
      "NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE=1",
      "NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE=1",
    ],
    steps: [
      "Login médico → /panel/consultas/[id]",
      "Verificar PatientContextRail + ClinicalMemoryCard",
      "Documentar dx I10, PA en notas, plan antihipertensivo",
      "Esperar AutosaveIndicator saved",
      "UnifiedClinicalActionBar → aplicar plan → receta",
      "Abrir módulo Recetas (ClinicalActionBar o EncounterRightPane según flag)",
      "handleTransition in_progress → completed (opcional)",
      "Firmar vía SignatureCanvas en EncounterHeader",
      "Generar PDF consulta",
    ],
    assertions: [
      "status === signed",
      "Prescription visible en OrdersTab/OrdersOverview",
      "PDF descargable",
      "Clinical Memory sin regresión post-reload",
      "ClinicalCloseFlow fase Firmar complete",
    ],
    flagMatrix: "official",
  },
  {
    id: "p0-dm2-lab",
    name: "DM2 — laboratorio + plan + firma",
    priority: "P0",
    flow: ["Paciente", "SOAP", "Laboratorio", "Plan", "Firma"],
    mapsToSpec: ["e2e-orders-lab", "e2e-hta-followup"],
    surfaces: [
      "autosave",
      "orders",
      "module-sheet",
      "signature",
      "close-flow",
    ],
    preconditions: [
      "Paciente con memoria E11 / DM2",
      "Consulta in_progress",
      "Flags workspace ON (layout oficial)",
    ],
    steps: [
      "Documentar dx E11 en SmartDiagnosisPicker",
      "Abrir Orders → Lab → crear orden HbA1c",
      "Verificar OrdersOverview contadores pending += 1",
      "Completar plan en SOAP",
      "Firmar consulta",
    ],
    assertions: [
      "Lab order status pending en UI",
      "OrdersOverview refleja pendientes",
      "status === signed",
      "Close Flow fase Documentar/Revisar coherente",
    ],
    flagMatrix: "official",
  },
  {
    id: "p0-acute-new-patient",
    name: "Consulta aguda — paciente nuevo",
    priority: "P0",
    flow: ["Paciente nuevo", "SOAP", "Documento", "Cierre"],
    mapsToSpec: ["e2e-acute-cefalea", "e2e-ficha-autosave"],
    surfaces: [
      "autosave",
      "copilot",
      "documents",
      "signature",
      "close-flow",
    ],
    preconditions: [
      "Paciente sin memoria crónica previa",
      "Consulta draft",
      "Flags workspace ON",
    ],
    steps: [
      "Crear/iniciar consulta con paciente nuevo",
      "Dx R51 cefalea, notas breves, plan sintomático",
      "Verificar Copilot silence mode (sin falsos riesgos)",
      "Autosave + reload → datos intactos",
      "Completar y firmar",
      "Generar documento PDF",
    ],
    assertions: [
      "Notas SOAP intactas post-reload",
      "Copilot sin alertas inventadas",
      "Documentation quality ≥ Adecuado",
      "status === signed",
      "PDF generado",
    ],
    flagMatrix: "official",
  },
  {
    id: "p0-payment-lock",
    name: "Firma → pago → lock",
    priority: "P0",
    flow: ["Consulta", "Firma", "Pago", "Lock"],
    mapsToSpec: ["e2e-payment-lock"],
    surfaces: ["signature", "payment", "close-flow", "documents"],
    preconditions: [
      "Consulta signed",
      "Payku sandbox configurado",
      "Precio consulta disponible",
      "Flags workspace ON",
    ],
    steps: [
      "Firmar consulta si no está signed",
      "Clic botón pago en EncounterHeader",
      "Confirmar monto → redirect Payku",
      "Completar pago sandbox → retorno ?payment=success",
      "Verificar reload y status locked",
    ],
    assertions: [
      "status === locked",
      "SOAP no editable (isEditable false)",
      "Card «Consulta pagada y bloqueada» visible",
      "ClinicalCloseFlow fase Entregar complete",
    ],
    flagMatrix: "official",
  },
];

export type PlaywrightInfraStatus = {
  exists: boolean;
  configPath: string | null;
  specPath: string | null;
  packageInstalled: boolean;
  note: string;
};

export const PLAYWRIGHT_INFRA: PlaywrightInfraStatus = {
  exists: true,
  configPath: "e2e/playwright.config.ts",
  specPath: "e2e/clinical-p0.spec.ts",
  packageInstalled: true,
  note:
    "Phase 4.8.6 añade config + spec ejecutable. @playwright/test en devDependencies — correr contra staging con credenciales E2E.",
};

/** Combinación de flags que DEBE usarse en E2E (workspace oficial 4.8.5). */
export const E2E_FLAG_MATRIX = {
  required: {
    NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE: "1",
    NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE: "1",
  },
  rationale: [
    "Experiencia auditada 4.7–4.8.4 usa Action WS + Smart WS ON",
    "E2E contra layout legacy 3-col no valida prod target",
    "Flags compile-time — rebuild obligatorio al cambiar env",
  ],
  layoutUnderTest: WORKSPACE_LAYOUT_MATRIX.find((r) => r.auditedExperience)?.layout,
  legacyRegressionSuite: {
    description: "Opcional P1 — validar rollback paths antes de retiro flags",
    flags: { action: "0", smart: "0" },
  },
} as const;

export type CodeAuditFinding = {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  category:
    | "state"
    | "handler"
    | "legacy-route"
    | "autosave"
    | "payment"
    | "documents"
    | "flags"
    | "close-flow";
  file: string;
  description: string;
  affectsCases: string[];
  blocksGo: boolean;
};

/** Hallazgos reales del pre-flight estático (código fuente d525a5b6). */
export const CODE_AUDIT_FINDINGS: CodeAuditFinding[] = [
  {
    id: "F1-canPay-completed",
    severity: "critical",
    category: "payment",
    file: "app/panel/consultas/[id]/page.tsx",
    description:
      "canPay = signed || completed permite pago antes de firma legal — contradice audit 4.8.1 (canPay solo signed).",
    affectsCases: ["p0-payment-lock", "p0-hta-followup"],
    blocksGo: true,
  },
  {
    id: "F2-autosave-no-flush-sign",
    severity: "high",
    category: "autosave",
    file: "app/panel/consultas/[id]/page.tsx handleSign",
    description:
      "handleSign no invoca flushNow() del autosave — borrador debounced (900ms) puede perderse al firmar.",
    affectsCases: ["p0-hta-followup", "p0-acute-new-patient", "p0-dm2-lab"],
    blocksGo: true,
  },
  {
    id: "F3-signed-rx-pre-signature",
    severity: "high",
    category: "documents",
    file: "app/panel/consultas/[id]/page.tsx documentDisabled",
    description:
      "signedPrescription disabled solo cuando !canSign — habilitada en in_progress/completed sin firma.",
    affectsCases: ["p0-hta-followup", "p0-acute-new-patient"],
    blocksGo: true,
  },
  {
    id: "F4-legacy-consultas-page",
    severity: "high",
    category: "legacy-route",
    file: "app/panel/consultas/page.tsx",
    description:
      "Ruta activa con workspace inline (Rx, Lab, IA) sin firma/pago/Close Flow; redirect a [id] puede fallar en ventana inicial.",
    affectsCases: [
      "p0-hta-followup",
      "p0-dm2-lab",
      "p0-acute-new-patient",
      "p0-payment-lock",
    ],
    blocksGo: true,
  },
  {
    id: "F5-flags-default-off",
    severity: "high",
    category: "flags",
    file: "lib/clinical-action-workspace.ts, lib/smart-clinical-workspace.ts",
    description:
      "Flags default false — prod probablemente en layout legacy; E2E oficial requiere env ON + rebuild.",
    affectsCases: [
      "p0-hta-followup",
      "p0-dm2-lab",
      "p0-acute-new-patient",
      "p0-payment-lock",
    ],
    blocksGo: true,
  },
  {
    id: "F6-chiefComplaint-not-autosave",
    severity: "medium",
    category: "autosave",
    file: "lib/services/consultation-diagnosis.ts buildSoapDraftKey",
    description:
      "chiefComplaint excluido del draft key — solo persiste vía tab Ficha (handleSaveClinicalRecord).",
    affectsCases: ["p0-acute-new-patient", "p0-hta-followup"],
    blocksGo: false,
  },
  {
    id: "F7-close-flow-orders-proxy",
    severity: "medium",
    category: "close-flow",
    file: "lib/clinical-close-flow.ts",
    description:
      "Wizard infiere órdenes por treatment + status, no query real a Orders API.",
    affectsCases: ["p0-dm2-lab", "p0-hta-followup"],
    blocksGo: false,
  },
  {
    id: "F8-triple-orders-surface",
    severity: "medium",
    category: "handler",
    file: "page.tsx + EncounterRightPane + ClinicalModuleSheet + mobile tabs",
    description:
      "Tres entry points Rx/Lab: legacy page, right pane (flag OFF), module sheet (flag ON), más mobile tab.",
    affectsCases: ["p0-dm2-lab", "p0-hta-followup"],
    blocksGo: false,
  },
  {
    id: "F9-openClinicalModule-noop",
    severity: "medium",
    category: "handler",
    file: "app/panel/consultas/[id]/page.tsx openClinicalModule",
    description:
      "openClinicalModule no-op silencioso si Action WS OFF o ref no montada.",
    affectsCases: ["p0-dm2-lab", "p0-hta-followup"],
    blocksGo: false,
  },
  {
    id: "F10-endConsultation-legacy",
    severity: "medium",
    category: "legacy-route",
    file: "app/panel/consultas/page.tsx endConsultation",
    description:
      "«Cerrar consulta» en legacy page solo limpia contexto — no signConsultation ni lock.",
    affectsCases: ["p0-payment-lock"],
    blocksGo: false,
  },
  {
    id: "F11-document-disabled-partial",
    severity: "medium",
    category: "documents",
    file: "app/panel/consultas/[id]/page.tsx documentDisabled",
    description:
      "Certificado, interconsulta y premium no restringidos por isSigned/isLocked.",
    affectsCases: ["p0-acute-new-patient", "p0-hta-followup"],
    blocksGo: false,
  },
  {
    id: "F12-completed-editable-ambiguity",
    severity: "medium",
    category: "state",
    file: "app/panel/consultas/[id]/page.tsx",
    description:
      "completed: isEditable=false pero canSign=true — SOAP congelado pero firmable; orden completada→firma confuso.",
    affectsCases: ["p0-hta-followup", "p0-dm2-lab"],
    blocksGo: false,
  },
];

export type P0CaseResult = {
  caseId: string;
  name: string;
  runtimeStatus: E2eExecutionStatus;
  staticPreflight: "pass" | "fail" | "blocked";
  blockers: string[];
  surfacesValidated: E2eSurface[];
  notes: string;
};

/** Resultado pre-flight estático por caso P0 (runtime NOT_EXECUTED — requiere staging). */
export function evaluateP0CaseResults(): P0CaseResult[] {
  return P0_CLINICAL_CASES.map((c) => {
    const blockers = CODE_AUDIT_FINDINGS.filter(
      (f) => f.affectsCases.includes(c.id) && f.blocksGo,
    ).map((f) => f.id);

    const staticPreflight: P0CaseResult["staticPreflight"] =
      blockers.length > 0 ? "fail" : "pass";

    return {
      caseId: c.id,
      name: c.name,
      runtimeStatus: "not_executed" as const,
      staticPreflight,
      blockers,
      surfacesValidated: c.surfaces,
      notes:
        blockers.length > 0
          ? `Pre-flight FAIL — ${blockers.length} blocker(s). Runtime pendiente Playwright + staging.`
          : "Pre-flight PASS estático. Runtime pendiente Playwright + staging.",
    };
  });
}

export type OperationalRisk = {
  id: string;
  severity: "critical" | "high" | "medium";
  risk: string;
  mitigation: string;
};

export const OPERATIONAL_RISKS: OperationalRisk[] = [
  {
    id: "ops-no-staging-e2e",
    severity: "critical",
    risk: "Casos P0 no ejecutados contra backend real en sesión 4.8.6",
    mitigation: "Correr e2e/clinical-p0.spec.ts en staging con credenciales médico",
  },
  {
    id: "ops-payku-sandbox",
    severity: "high",
    risk: "Caso pago depende Payku sandbox y webhook/redirect configurado",
    mitigation: "Usar ?payment=mock solo en dev; validar flujo real en staging",
  },
  {
    id: "ops-flags-rebuild",
    severity: "high",
    risk: "Cambiar flags workspace requiere rebuild Next.js",
    mitigation: "Fijar env en Vercel preview antes de suite E2E",
  },
  {
    id: "ops-seed-data",
    severity: "medium",
    risk: "HTA/DM2 requieren pacientes seed con memoria clínica",
    mitigation: "Documentar IDs seed en e2e/README.md o .env.e2e.example",
  },
  {
    id: "ops-legacy-route",
    severity: "high",
    risk: "Entradas desde /panel/pacientes → /panel/consultas?patientId= pasan por legacy",
    mitigation: "E2E debe navegar directo a [id] o verificar redirect",
  },
];

export type E2eCoverage = {
  surfaces: { surface: E2eSurface; coveredByP0: boolean; cases: string[] }[];
  playwrightReady: boolean;
  runtimeExecuted: boolean;
  staticPreflightComplete: boolean;
};

export function computeE2eCoverage(): E2eCoverage {
  const allSurfaces: E2eSurface[] = [
    "autosave",
    "clinical-memory",
    "timeline",
    "copilot",
    "orders",
    "module-sheet",
    "signature",
    "documents",
    "payment",
    "close-flow",
  ];

  const surfaces = allSurfaces.map((surface) => {
    const cases = P0_CLINICAL_CASES.filter((c) =>
      c.surfaces.includes(surface),
    ).map((c) => c.id);
    return {
      surface,
      coveredByP0: cases.length > 0,
      cases,
    };
  });

  return {
    surfaces,
    playwrightReady: PLAYWRIGHT_INFRA.exists,
    runtimeExecuted: false,
    staticPreflightComplete: true,
  };
}

export type GoNoGoVerdict = {
  decision: "NO_GO" | "GO_WITH_CONDITIONS" | "GO";
  summary: string;
  blockers: string[];
  conditions: string[];
};

export function evaluateWorkspaceActivationGoNoGo(): GoNoGoVerdict {
  const blockingFindings = CODE_AUDIT_FINDINGS.filter((f) => f.blocksGo);
  const caseResults = evaluateP0CaseResults();
  const allCasesBlocked = caseResults.every((r) => r.staticPreflight === "fail");

  if (blockingFindings.length > 0 || allCasesBlocked) {
    return {
      decision: "NO_GO",
      summary:
        "NO GO para activación permanente del workspace oficial en producción hasta resolver blockers de pre-flight y ejecutar E2E runtime en staging.",
      blockers: [
        ...new Set(blockingFindings.map((f) => `${f.id}: ${f.description}`)),
        "Casos P0 runtime no ejecutados (Playwright + staging pendiente)",
      ],
      conditions: [
        "Instalar @playwright/test y ejecutar e2e/clinical-p0.spec.ts en staging",
        "Fijar NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE=1 y NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE=1",
        "Resolver F1 (canPay), F2 (autosave flush), F3 (documentDisabled) — fuera de alcance 4.8.6 o fase 4.9",
        "QA manual checklist P0 si E2E runtime pasa",
        "Verificar prod env flags actuales antes de activar",
      ],
    };
  }

  return {
    decision: "GO_WITH_CONDITIONS",
    summary: "GO condicionado a E2E runtime exitoso en staging.",
    blockers: [],
    conditions: ["Ejecutar suite Playwright P0 en staging"],
  };
}

export const E2E_RECOMMENDATIONS = [
  "Instalar Playwright: npm install -D @playwright/test && npx playwright install chromium",
  "Crear .env.e2e con E2E_BASE_URL, E2E_DOCTOR_EMAIL, E2E_DOCTOR_PASSWORD, flags workspace ON",
  "Ejecutar: npx playwright test --config e2e/playwright.config.ts",
  "Priorizar fixes F1–F3 antes de declarar GO en prod",
  "E2E debe usar layout oficial (ambos flags ON) — no validar solo legacy 3-col",
  "Documentar patient/consultation seed IDs por caso en e2e/fixtures/README.md",
  "Tras E2E runtime PASS en staging → proceder 4.9.1 activación prod flags",
  "Mantener suite legacy OFF como regression P1 hasta retiro flags 4.9.4",
] as const;

/** Referencia cruzada a spec 4.8.1 completa (7 casos). */
export const E2E_SPEC_REFERENCE = {
  totalCases: E2E_MINIMUM_SPEC.length,
  p0FromOriginal: E2E_MINIMUM_SPEC.filter((c) => c.priority === "P0").length,
  p0Phase486: P0_CLINICAL_CASES.length,
  originalSpec: E2E_MINIMUM_SPEC,
} as const;

export function runClinicalE2eProductionReadinessSummary() {
  const results = evaluateP0CaseResults();
  const verdict = evaluateWorkspaceActivationGoNoGo();
  const coverage = computeE2eCoverage();

  return {
    p0Cases: P0_CLINICAL_CASES.length,
    p0StaticFail: results.filter((r) => r.staticPreflight === "fail").length,
    p0RuntimeExecuted: results.filter((r) => r.runtimeStatus !== "not_executed")
      .length,
    codeFindings: CODE_AUDIT_FINDINGS.length,
    blockingFindings: CODE_AUDIT_FINDINGS.filter((f) => f.blocksGo).length,
    operationalRisks: OPERATIONAL_RISKS.length,
    surfacesCovered: coverage.surfaces.filter((s) => s.coveredByP0).length,
    playwrightReady: PLAYWRIGHT_INFRA.exists,
    goNoGo: verdict.decision,
  };
}
