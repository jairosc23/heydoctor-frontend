/**
 * Phase 4.8.3D — Assist / Insights Retirement Audit™
 * EPIC-3 E3-0c: ConsultationAssistPanel / AiInsightsPanel REMOVED from codebase.
 */

import fs from "node:fs";
import path from "node:path";

export type RetiredUiMount = {
  component: string;
  formerLocation: string;
  phase483dStatus: "unmounted" | "deprecated_export_only" | "removed";
  replacement: string;
};

export type DeprecatedAiComponent = {
  file: string;
  exportName: string;
  replacement: string;
  note?: string;
  status: "removed" | "retained_optional";
};

/** Componentes desmontados de producción [id] en 4.8.3D; E3-0c removed sources */
export const RETIRED_UI_MOUNTS: RetiredUiMount[] = [
  {
    component: "ConsultationAssistPanel",
    formerLocation: "EncounterLeftPane / MobileConsultationWorkspace tab Asistencia",
    phase483dStatus: "removed",
    replacement: "Clinical Copilot™ → Clinical AI Assistant™",
  },
  {
    component: "AiInsightsPanel",
    formerLocation: "EncounterLeftPane / MobileConsultationWorkspace tab Asistencia",
    phase483dStatus: "removed",
    replacement: "Clinical Copilot™ (insights determinísticos + generativo)",
  },
  {
    component: "Tab Asistencia",
    formerLocation: "LEFT_TABS / MAIN_TABS",
    phase483dStatus: "unmounted",
    replacement: "Tab Chat (solo mensajería) + Clinical Copilot™",
  },
];

/** E3-0c: Assist/Insights sources deleted; optional CTA retained */
export const DEPRECATED_AI_COMPONENTS: DeprecatedAiComponent[] = [
  {
    file: "components/clinical/ConsultationAssistPanel.tsx",
    exportName: "ConsultationAssistPanel",
    replacement: "CopilotGenerativeSection + getConsultationAssist",
    status: "removed",
  },
  {
    file: "components/clinical/AiInsightsPanel.tsx",
    exportName: "AiInsightsPanel",
    replacement: "Clinical Copilot™ + getConsultationInsights (facade)",
    note: "Removed E3-0c Debt Gate",
    status: "removed",
  },
  {
    file: "components/clinical/CopilotHubCta.tsx",
    exportName: "CopilotHubCta",
    replacement: "N/A — paneles legacy desmontados",
    note: "Conservado para imports opcionales",
    status: "retained_optional",
  },
];

/** Rutas IA vivas post-4.8.3D / E3-0c */
export const LIVE_AI_SURFACES = [
  "Clinical Copilot™ (determinístico + generativo)",
  "LiveAiNoteSuggestions™",
  "ClinicalRecordPanel autollenado",
  "ChatPanel (tab Chat — no IA)",
] as const;

export const ASSIST_INSIGHTS_RETIREMENT_RISKS = [
  "GET /consultations/:id/ai accesible vía facade pero sin UI dedicada post-retiro",
  "Legacy /panel/consultas inline sin Copilot drawer — solo LiveAiNotes + Chat",
  "Chat reubicado a tab «Chat»; destino futuro: teleconsulta o comunicaciones",
];

const REPO_ROOT = path.resolve(import.meta.dirname, "..");

const PRODUCTION_MOUNT_PATHS = [
  "app/panel/consultas/[id]/_components/EncounterLeftPane.tsx",
  "app/panel/consultas/[id]/_components/MobileConsultationWorkspace.tsx",
];

export type AssistInsightsRetirementAuditResult = {
  retiredMounts: number;
  deprecatedComponents: number;
  liveSurfaces: number;
  productionMountViolations: string[];
  removedSourceViolations: string[];
  passed: boolean;
  risks: string[];
};

export function scanProductionAssistInsightsMounts(): string[] {
  const violations: string[] = [];
  const forbidden = [
    "ConsultationAssistPanel",
    "AiInsightsPanel",
    'label: "Asistencia"',
    "label: 'Asistencia'",
  ];

  for (const rel of PRODUCTION_MOUNT_PATHS) {
    const src = fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
    for (const token of forbidden) {
      if (src.includes(token)) {
        violations.push(`${rel} contiene ${token}`);
      }
    }
  }
  return violations;
}

/** E3-0c: removed components must not exist on disk */
export function scanRemovedAssistInsightsSources(): string[] {
  const violations: string[] = [];
  for (const c of DEPRECATED_AI_COMPONENTS.filter((x) => x.status === "removed")) {
    if (fs.existsSync(path.join(REPO_ROOT, c.file))) {
      violations.push(`expected removed but still present: ${c.file}`);
    }
  }
  return violations;
}

export function runAssistInsightsRetirementAudit(): AssistInsightsRetirementAuditResult {
  const productionMountViolations = scanProductionAssistInsightsMounts();
  const removedSourceViolations = scanRemovedAssistInsightsSources();
  return {
    retiredMounts: RETIRED_UI_MOUNTS.length,
    deprecatedComponents: DEPRECATED_AI_COMPONENTS.length,
    liveSurfaces: LIVE_AI_SURFACES.length,
    productionMountViolations,
    removedSourceViolations,
    passed:
      productionMountViolations.length === 0 &&
      removedSourceViolations.length === 0,
    risks: [...ASSIST_INSIGHTS_RETIREMENT_RISKS],
  };
}
