/** Workspace Regression Suite — frozen architecture contract. */

export const WORKSPACE_REGRESSION_VIEWPORTS = ["desktop", "mobile"] as const;

export const WORKSPACE_REGRESSION_SURFACES = [
  "menu",
  "back",
  "copilot",
  "doctor-dna",
  "module-sheet",
  "continuity",
  "share",
  "full-record",
  "unsaved",
  "feedback",
  "teleconsulta",
] as const;

export const WORKSPACE_REGRESSION_INVARIANTS = [
  "single-blocking-overlay",
  "single-backdrop",
  "single-escape",
  "single-scroll-root",
  "live-navigation",
  "chrome-never-covered",
  "sidebar-always-operative",
] as const;

export type WorkspaceRegressionViewport =
  (typeof WORKSPACE_REGRESSION_VIEWPORTS)[number];
export type WorkspaceRegressionSurface =
  (typeof WORKSPACE_REGRESSION_SURFACES)[number];
export type WorkspaceRegressionInvariant =
  (typeof WORKSPACE_REGRESSION_INVARIANTS)[number];

export type WorkspaceRegressionScenario =
  | {
      kind: "surface";
      surface: WorkspaceRegressionSurface;
      viewport: WorkspaceRegressionViewport;
      id: string;
    }
  | {
      kind: "invariant";
      invariant: WorkspaceRegressionInvariant;
      viewport: WorkspaceRegressionViewport;
      id: string;
    };

export const WORKSPACE_REGRESSION_SCENARIOS: readonly WorkspaceRegressionScenario[] =
  Object.freeze([
    ...WORKSPACE_REGRESSION_SURFACES.flatMap((surface) =>
      WORKSPACE_REGRESSION_VIEWPORTS.map((viewport) => ({
        kind: "surface" as const,
        surface,
        viewport,
        id: `${surface}:${viewport}`,
      })),
    ),
    ...WORKSPACE_REGRESSION_INVARIANTS.flatMap((invariant) =>
      WORKSPACE_REGRESSION_VIEWPORTS.map((viewport) => ({
        kind: "invariant" as const,
        invariant,
        viewport,
        id: `${invariant}:${viewport}`,
      })),
    ),
  ]);

/** Frozen architecture contract. New scenarios require explicit approval. */
export const WORKSPACE_REGRESSION_SCENARIO_CONTRACT = {
  count: 36,
  frozen: true,
} as const;

export type WorkspaceStabilityIndex = {
  pass: number;
  total: number;
  ratio: number;
};

export function workspaceStabilityIndex(
  pass: number,
  total: number,
): WorkspaceStabilityIndex {
  const safeTotal = Math.max(0, total);
  const safePass = Math.min(Math.max(0, pass), safeTotal);
  return {
    pass: safePass,
    total: safeTotal,
    ratio: safeTotal === 0 ? 0 : safePass / safeTotal,
  };
}

export function formatWorkspaceStabilityIndex(
  index: WorkspaceStabilityIndex,
): string {
  return `Workspace Stability Index: ${index.pass}/${index.total} (${Math.round(index.ratio * 100)}%)`;
}

export const WORKSPACE_KERNEL_ENTRY =
  "lib/clinical-workspace/kernel.ts" as const;

export const WORKSPACE_FOUNDATION_ENTRY =
  "lib/clinical-workspace/foundation" as const;

export const WORKSPACE_FOUNDATION_FILE =
  "lib/clinical-workspace/foundation/index.ts" as const;

export const WORKSPACE_VIEWPORT_FILE =
  "lib/clinical-workspace/foundation/viewport.ts" as const;

export const WORKSPACE_CHROME_FILE =
  "lib/clinical-workspace/foundation/chrome.ts" as const;

export const WORKSPACE_REGRESSION_SOURCES = {
  encounterPage: "app/panel/consultas/[id]/page.tsx",
  panelLayout: "components/PanelLayout.tsx",
  copilot: "app/panel/consultas/[id]/_components/copilot/ClinicalCopilotDrawer.tsx",
  doctorDna: "app/panel/consultas/[id]/_components/DoctorDnaDrawer.tsx",
  moduleSheet:
    "app/panel/consultas/[id]/_components/action-workspace/ClinicalModuleSheet.tsx",
  continuity: "components/clinical/continuity/ContinuityPanelShell.tsx",
  share: "components/clinical/ShareConsultationDialog.tsx",
  fullRecord: "components/encounter/EncounterFullRecordOverlay.tsx",
  unsaved: "components/unsaved-changes/UnsavedChangesDialog.tsx",
  feedback: "components/clinical-beta/ClinicalBetaFeedbackWidget.tsx",
  encounterHeader: "app/panel/consultas/[id]/_components/EncounterHeader.tsx",
  rail: "app/panel/consultas/[id]/_components/ClinicalNavigationRail.tsx",
  patientRail: "app/panel/consultas/[id]/_components/PatientContextRail.tsx",
  soapNav: "app/panel/consultas/[id]/_components/SoapStickyNav.tsx",
  safetyStrip: "app/panel/consultas/[id]/_components/SafetyStrip.tsx",
  chromeHook: "lib/hooks/useEncounterChromeHeight.ts",
  chromeMetrics: "lib/encounter/navigation/chrome-metrics.ts",
  globals: "app/globals.css",
} as const;
