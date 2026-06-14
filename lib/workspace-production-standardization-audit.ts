/**
 * Phase 4.8.5 — Workspace Production Standardization Audit™
 *
 * Inventario técnico de flags Clinical Action Workspace™ y Smart Clinical Workspace™.
 * Solo auditoría — sin activar env vars ni retirar rollback en esta fase.
 */

import { ACTION_WORKSPACE_VALIDATION } from "./production-consolidation-audit";

export type WorkspaceFlagId = "clinicalActionWorkspace" | "smartClinicalWorkspace";

export type WorkspaceFlagDefinition = {
  id: WorkspaceFlagId;
  env: string;
  defaultInCode: boolean;
  documentedInEnvExample: boolean;
  phase: string;
  module: string;
};

export const WORKSPACE_FLAGS: WorkspaceFlagDefinition[] = [
  {
    id: "clinicalActionWorkspace",
    env: ACTION_WORKSPACE_VALIDATION.flags.clinicalActionWorkspace.env,
    defaultInCode:
      ACTION_WORKSPACE_VALIDATION.flags.clinicalActionWorkspace.defaultInCode,
    documentedInEnvExample:
      ACTION_WORKSPACE_VALIDATION.flags.clinicalActionWorkspace
        .documentedInEnvExample,
    phase: "4.2",
    module: "lib/clinical-action-workspace.ts",
  },
  {
    id: "smartClinicalWorkspace",
    env: ACTION_WORKSPACE_VALIDATION.flags.smartClinicalWorkspace.env,
    defaultInCode:
      ACTION_WORKSPACE_VALIDATION.flags.smartClinicalWorkspace.defaultInCode,
    documentedInEnvExample:
      ACTION_WORKSPACE_VALIDATION.flags.smartClinicalWorkspace
        .documentedInEnvExample,
    phase: "4.3",
    module: "lib/smart-clinical-workspace.ts",
  },
];

export type LayoutMatrixEntry = {
  actionWs: boolean;
  smartWs: boolean;
  layout: string;
  auditedExperience: boolean;
  productionLikely: boolean;
};

/** Matriz 2×2 — reutiliza ACTION_WORKSPACE_VALIDATION con marca de experiencia auditada. */
export const WORKSPACE_LAYOUT_MATRIX: LayoutMatrixEntry[] =
  ACTION_WORKSPACE_VALIDATION.layoutMatrix.map((row) => ({
    ...row,
    auditedExperience: row.actionWs && row.smartWs,
  }));

export type FlagDependency = {
  id: string;
  file: string;
  flags: WorkspaceFlagId[];
  behaviorWhenOn: string;
  behaviorWhenOff: string;
  rollbackOnly: boolean;
};

/** Dependencias directas de flags en código de producción. */
export const FLAG_DEPENDENCIES: FlagDependency[] = [
  {
    id: "page-compile-time",
    file: "app/panel/consultas/[id]/page.tsx",
    flags: ["clinicalActionWorkspace", "smartClinicalWorkspace"],
    behaviorWhenOn:
      "Constantes module-level; props a ConsultationWorkspace; handlers openClinicalModule",
    behaviorWhenOff:
      "setRightPaneTab/setWorkspaceTab/setOrdersSubTab; EncounterRightPane activo",
    rollbackOnly: false,
  },
  {
    id: "encounter-split-layout",
    file: "app/panel/consultas/[id]/_components/EncounterSplitLayout.tsx",
    flags: ["clinicalActionWorkspace"],
    behaviorWhenOn: "Grid 2 columnas (rail + SOAP); sin panel derecho",
    behaviorWhenOff: "Grid 3 columnas LEGACY_GRID + EncounterRightPane",
    rollbackOnly: true,
  },
  {
    id: "consultation-workspace-right-pane",
    file: "app/panel/consultas/[id]/_components/ConsultationWorkspace.tsx",
    flags: ["clinicalActionWorkspace"],
    behaviorWhenOn: "right=undefined — órdenes/docs solo vía sheet",
    behaviorWhenOff: "EncounterRightPane con tabs orders/documents",
    rollbackOnly: true,
  },
  {
    id: "clinical-action-bar",
    file: "app/panel/consultas/[id]/_components/action-workspace/ClinicalActionBar.tsx",
    flags: ["clinicalActionWorkspace"],
    behaviorWhenOn: "Barra módulos en chrome (Recetas, Lab, Docs…)",
    behaviorWhenOff: "Componente retorna null",
    rollbackOnly: false,
  },
  {
    id: "clinical-module-sheet",
    file: "app/panel/consultas/[id]/_components/action-workspace/ClinicalModuleSheet.tsx",
    flags: ["clinicalActionWorkspace"],
    behaviorWhenOn: "Overlay lateral módulos clínicos",
    behaviorWhenOff: "Sheet nunca renderiza (enabled=false)",
    rollbackOnly: false,
  },
  {
    id: "header-module-shortcuts",
    file: "app/panel/consultas/[id]/page.tsx → EncounterHeader",
    flags: ["clinicalActionWorkspace"],
    behaviorWhenOn: "hideModuleShortcuts=true — atajos Rx/Lab/Docs ocultos",
    behaviorWhenOff: "Atajos visibles en header",
    rollbackOnly: true,
  },
  {
    id: "patient-snapshot-compact",
    file: "app/panel/consultas/[id]/page.tsx → PatientSnapshot",
    flags: ["clinicalActionWorkspace"],
    behaviorWhenOn: "compact=true cuando hay patientId",
    behaviorWhenOff: "Snapshot expandido",
    rollbackOnly: false,
  },
  {
    id: "plan-applied-navigation",
    file: "app/panel/consultas/[id]/page.tsx handlePlanApplied",
    flags: ["clinicalActionWorkspace"],
    behaviorWhenOn: "openClinicalModule(prescriptions|lab|orders)",
    behaviorWhenOff: "setRightPaneTab orders + ordersSubTab",
    rollbackOnly: true,
  },
  {
    id: "open-prescription-lab-docs",
    file: "app/panel/consultas/[id]/page.tsx handlers",
    flags: ["clinicalActionWorkspace"],
    behaviorWhenOn: "openClinicalModule por módulo",
    behaviorWhenOff: "setWorkspaceTab + setRightPaneTab legacy",
    rollbackOnly: true,
  },
  {
    id: "soap-scroll-spy",
    file: "hooks/useSoapScrollSpy.ts",
    flags: ["smartClinicalWorkspace"],
    behaviorWhenOn: "Scroll spy activo; SoapStickyNav sincronizado",
    behaviorWhenOff: "Hook no-op; step fijo en 1",
    rollbackOnly: false,
  },
  {
    id: "soap-sticky-nav",
    file: "app/panel/consultas/[id]/_components/SoapStickyNav.tsx",
    flags: ["smartClinicalWorkspace"],
    behaviorWhenOn: "Navegación sticky SOAP 4 pasos",
    behaviorWhenOff: "No montado (enabled=false en padre)",
    rollbackOnly: false,
  },
  {
    id: "soap-section-layout",
    file: "app/panel/consultas/[id]/_components/SoapSection.tsx",
    flags: ["smartClinicalWorkspace"],
    behaviorWhenOn:
      "soap-focus-layout, previews compactos, UnifiedClinicalActionBar compact, rows=6",
    behaviorWhenOff: "Layout expandido, sin previews, rows=5, copy «panel derecho»",
    rollbackOnly: true,
  },
  {
    id: "patient-context-rail",
    file: "app/panel/consultas/[id]/_components/PatientContextRail.tsx",
    flags: ["smartClinicalWorkspace"],
    behaviorWhenOn: "ClinicalMemoryCard compact; timeline progressiveDisclosure",
    behaviorWhenOff: "Memoria y timeline expandidos",
    rollbackOnly: true,
  },
  {
    id: "globals-soap-focus-css",
    file: "app/globals.css",
    flags: ["smartClinicalWorkspace"],
    behaviorWhenOn: ".soap-focus-layout focus-within colapsa bloques inactivos",
    behaviorWhenOff: "CSS presente pero clase no aplicada",
    rollbackOnly: false,
  },
  {
    id: "mobile-workspace",
    file: "app/panel/consultas/[id]/_components/MobileConsultationWorkspace.tsx",
    flags: ["smartClinicalWorkspace"],
    behaviorWhenOn: "SoapStickyNav + scroll spy en viewport <xl",
    behaviorWhenOff: "Tabs móviles sin sticky nav",
    rollbackOnly: true,
  },
];

export type RollbackPath = {
  id: string;
  trigger: string;
  legacyBehavior: string;
  files: string[];
  removableWhen: string;
};

/** Rutas de rollback explícitas — código que solo sirve con flags OFF. */
export const ROLLBACK_PATHS: RollbackPath[] = [
  {
    id: "three-column-grid",
    trigger: "NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE unset/false",
    legacyBehavior: "EncounterSplitLayout LEGACY_GRID + EncounterRightPane",
    files: [
      "EncounterSplitLayout.tsx",
      "EncounterRightPane.tsx",
      "ConsultationWorkspace.tsx",
    ],
    removableWhen: "Action WS hardcoded ON en prod ≥2 sprints sin incidentes",
  },
  {
    id: "right-pane-tab-state",
    trigger: "Action WS OFF",
    legacyBehavior:
      "rightPaneTab, workspaceTab, ordersSubTab en page.tsx para navegación órdenes/docs",
    files: ["app/panel/consultas/[id]/page.tsx"],
    removableWhen: "Retirar state tabs derecho tras consolidar sheet como único hub",
  },
  {
    id: "header-shortcuts",
    trigger: "Action WS OFF",
    legacyBehavior: "EncounterHeader atajos Rx/Lab/Documentos",
    files: ["EncounterHeader.tsx", "page.tsx"],
    removableWhen: "ClinicalActionBar es único entry point módulos",
  },
  {
    id: "soap-legacy-copy",
    trigger: "Smart WS OFF",
    legacyBehavior: "Subtítulo «Centro de gravedad»; sin SoapCompactPreviews",
    files: ["SoapSection.tsx"],
    removableWhen: "Smart WS hardcoded ON",
  },
  {
    id: "expanded-rail-timeline",
    trigger: "Smart WS OFF",
    legacyBehavior: "PatientMemoryCard sin progressiveDisclosure",
    files: ["PatientContextRail.tsx"],
    removableWhen: "Smart WS hardcoded ON",
  },
];

export type LegacyLayoutComponent = {
  id: string;
  path: string;
  activeWhen: string;
  replacement: string;
  severity: "retirar" | "monitorear" | "mantener";
};

export const LEGACY_LAYOUT_COMPONENTS: LegacyLayoutComponent[] = [
  {
    id: "encounter-right-pane",
    path: "app/panel/consultas/[id]/_components/EncounterRightPane.tsx",
    activeWhen: "clinicalActionWorkspace OFF (desktop xl+)",
    replacement: "ClinicalModuleSheet + ClinicalActionBar",
    severity: "retirar",
  },
  {
    id: "consultation-action-bar-legacy-layout",
    path: "components/clinical/ConsultationActionBar.tsx",
    activeWhen: "Layout 3-col y mobile sin Action WS",
    replacement: "EncounterHeader + UnifiedClinicalActionBar + ClinicalActionBar",
    severity: "monitorear",
  },
  {
    id: "legacy-consultas-page",
    path: "app/panel/consultas/page.tsx",
    activeWhen: "Ruta lista consultas con workspace inline residual",
    replacement: "Redirect a [id] únicamente",
    severity: "retirar",
  },
];

/** Workspace oficial propuesto — experiencia auditada fases 4.7–4.8.4. */
export const OFFICIAL_WORKSPACE_PROPOSAL = {
  name: "HeyDoctor Clinical Workstation™",
  flags: {
    clinicalActionWorkspace: true,
    smartClinicalWorkspace: true,
  },
  layout: "2-column desktop + Clinical Module Sheet™ + SOAP Command Center compacto",
  chrome:
    "EncounterChromeShell + PatientSnapshot compact + ClinicalActionBar + ClinicalCloseFlow",
  ia: "Clinical Copilot™ hub único (4.8.3D) — independiente de flags workspace",
  mobile: "MobileConsultationWorkspace con Smart WS (sticky nav + tabs)",
  rationale: [
    "Experencia sobre la que corrieron auditorías 4.7C–4.8.4",
    "Reduce duplicación órdenes/docs (panel derecho vs sheet)",
    "Alinea QA staging/prod si flags se fijan igual",
    "Compatible con Close Flow Wizard sin cambios adicionales",
  ],
} as const;

export const PERMANENT_ACTIVATION_RISKS = [
  {
    id: "prod-env-unknown",
    severity: "alta" as const,
    risk: "Flags compile-time; prod puede seguir en layout legacy 3-col si env no está seteado",
    mitigation: "Verificar Vercel/Railway dashboard; documentar en runbook ops",
  },
  {
    id: "layout-change-training",
    severity: "media" as const,
    risk: "Médicos acostumbrados a panel derecho fijo pierden referencia visual",
    mitigation: "Release notes + tooltip ClinicalActionBar primera sesión",
  },
  {
    id: "smart-only-mismatch",
    severity: "media" as const,
    risk: "Activar solo Smart WS deja copy plan «panel derecho» válido pero panel sigue visible",
    mitigation: "Activar siempre ambos flags juntos; no combinar parcial en prod",
  },
  {
    id: "action-only-mismatch",
    severity: "baja" as const,
    risk: "Solo Action WS ON sin Smart: sheet OK pero SOAP expandido — más scroll",
    mitigation: "Bundle oficial = ambos ON",
  },
  {
    id: "compile-time-rollback",
    severity: "media" as const,
    risk: "Cambiar flag requiere rebuild/redeploy Next.js — no toggle runtime",
    mitigation: "Staging gate antes de prod; mantener rollback git revert",
  },
  {
    id: "e2e-gap",
    severity: "media" as const,
    risk: "Sin E2E P0 automatizado sobre layout 2-col + sheet (roadmap 4.8.6)",
    mitigation: "QA manual checklist P0 pre-activación prod",
  },
];

export const ROLLBACK_REMOVAL_RISKS = [
  {
    id: "incident-revert",
    severity: "alta" as const,
    risk: "Sin flag OFF no hay rollback rápido ante regresión layout",
    mitigation: "Retirar flags solo tras 4.8.6 E2E + 1 sprint estable en prod",
  },
  {
    id: "encounter-right-pane-deletion",
    severity: "media" as const,
    risk: "EncounterRightPane comparte handlers con sheet — divergencia si no se unifica antes",
    mitigation: "Fase 4.9: deprecar RightPane tras paridad sheet verificada",
  },
  {
    id: "tab-state-dead-code",
    severity: "baja" as const,
    risk: "rightPaneTab/workspaceTab quedan huérfanos si se elimina rollback sin limpieza",
    mitigation: "Refactor page.tsx en misma fase que retiro flags",
  },
  {
    id: "partial-env-staging",
    severity: "media" as const,
    risk: "Entornos con flags distintos invalidan auditorías futuras",
    mitigation: "Estandarizar staging = prod antes de retirar flags",
  },
];

export const FILES_AFFECTED = [
  "lib/clinical-action-workspace.ts",
  "lib/smart-clinical-workspace.ts",
  "lib/clinical-action-workspace.test.ts",
  "lib/smart-clinical-workspace.test.ts",
  "app/panel/consultas/[id]/page.tsx",
  "app/panel/consultas/[id]/_components/ConsultationWorkspace.tsx",
  "app/panel/consultas/[id]/_components/EncounterSplitLayout.tsx",
  "app/panel/consultas/[id]/_components/EncounterRightPane.tsx",
  "app/panel/consultas/[id]/_components/EncounterLeftPane.tsx",
  "app/panel/consultas/[id]/_components/MobileConsultationWorkspace.tsx",
  "app/panel/consultas/[id]/_components/PatientContextRail.tsx",
  "app/panel/consultas/[id]/_components/SoapSection.tsx",
  "app/panel/consultas/[id]/_components/SoapStickyNav.tsx",
  "app/panel/consultas/[id]/_components/SoapCompactPreviews.tsx",
  "app/panel/consultas/[id]/_components/EncounterHeader.tsx",
  "app/panel/consultas/[id]/_components/action-workspace/ClinicalActionWorkspaceProvider.tsx",
  "app/panel/consultas/[id]/_components/action-workspace/ClinicalActionBar.tsx",
  "app/panel/consultas/[id]/_components/action-workspace/ClinicalModuleSheet.tsx",
  "app/panel/consultas/[id]/_components/action-workspace/ClinicalModuleSheetContent.tsx",
  "hooks/useSoapScrollSpy.ts",
  "app/globals.css",
  ".env.example",
  "lib/production-consolidation-audit.ts",
] as const;

/** Roadmap retiro flags — siguiente fase; NO implementar en 4.8.5. */
export const FLAG_RETIREMENT_ROADMAP = [
  {
    phase: "4.8.6",
    name: "E2E P0 + Staging Gate",
    scope:
      "Activar NEXT_PUBLIC_*=1 en staging; ejecutar E2E_MINIMUM_SPEC P0 con layout oficial",
    blocks: "Retiro código legacy",
  },
  {
    phase: "4.9.1",
    name: "Prod Flag Activation",
    scope:
      "Setear ambos flags en Vercel prod; QA smoke 24h; monitoreo Sentry layout errors",
    blocks: "Hardcode defaults",
  },
  {
    phase: "4.9.2",
    name: "Hardcode Workspace Defaults",
    scope:
      "isClinicalActionWorkspaceEnabled() → true; isSmartClinicalWorkspaceEnabled() → true; mantener env override temporal",
    blocks: "Eliminación rollback",
  },
  {
    phase: "4.9.3",
    name: "Legacy Layout Retirement",
    scope:
      "Eliminar EncounterRightPane path; simplificar page.tsx tab state; retirar LEGACY_GRID",
    blocks: "Eliminación flags",
  },
  {
    phase: "4.9.4",
    name: "Flag Removal",
    scope:
      "Eliminar env vars, funciones is*Enabled, props actionWorkspaceEnabled/smartWorkspaceEnabled",
    blocks: "N/A",
  },
] as const;

export type OfficialWorkspaceVerdict = {
  canDeclare: boolean;
  summary: string;
  conditions: string[];
};

export function evaluateOfficialWorkspaceDeclaration(): OfficialWorkspaceVerdict {
  return {
    canDeclare: true,
    summary:
      "HeyDoctor puede declarar Clinical Action Workspace™ + Smart Clinical Workspace™ como experiencia oficial y permanente, condicionado a verificación de env prod y QA staging.",
    conditions: [
      "Confirmar valores reales NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE y NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE en Vercel/Railway",
      "Activar ambos flags en staging y ejecutar checklist P0 (sin combinar flags parciales)",
      "Comunicar cambio layout a usuarios antes de prod",
      "Completar E2E P0 (4.8.6) antes de retirar rollback paths",
      "Backend c10e284 sin cambios — flags son 100% frontend layout",
    ],
  };
}

export function runWorkspaceProductionStandardizationAuditSummary() {
  const rollbackDeps = FLAG_DEPENDENCIES.filter((d) => d.rollbackOnly).length;
  const verdict = evaluateOfficialWorkspaceDeclaration();

  return {
    flags: WORKSPACE_FLAGS.length,
    layoutCombinations: WORKSPACE_LAYOUT_MATRIX.length,
    auditedLayout: WORKSPACE_LAYOUT_MATRIX.filter((r) => r.auditedExperience)
      .length,
    dependencies: FLAG_DEPENDENCIES.length,
    rollbackDependencies: rollbackDeps,
    rollbackPaths: ROLLBACK_PATHS.length,
    legacyComponents: LEGACY_LAYOUT_COMPONENTS.length,
    filesAffected: FILES_AFFECTED.length,
    permanentActivationRisks: PERMANENT_ACTIVATION_RISKS.length,
    rollbackRemovalRisks: ROLLBACK_REMOVAL_RISKS.length,
    retirementPhases: FLAG_RETIREMENT_ROADMAP.length,
    canDeclareOfficial: verdict.canDeclare,
    officialConditions: verdict.conditions.length,
  };
}
