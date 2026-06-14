/**
 * Phase 4.8.3D — Assist / Insights Retirement Audit™
 */

import fs from "node:fs";
import path from "node:path";

export type RetiredUiMount = {
  component: string;
  formerLocation: string;
  phase483dStatus: "unmounted" | "deprecated_export_only";
  replacement: string;
};

export type DeprecatedAiComponent = {
  file: string;
  exportName: string;
  replacement: string;
  note?: string;
};

/** Componentes desmontados de producción [id] en 4.8.3D */
export const RETIRED_UI_MOUNTS: RetiredUiMount[] = [
  {
    component: "ConsultationAssistPanel",
    formerLocation: "EncounterLeftPane / MobileConsultationWorkspace tab Asistencia",
    phase483dStatus: "unmounted",
    replacement: "Clinical Copilot™ → Clinical AI Assistant™",
  },
  {
    component: "AiInsightsPanel",
    formerLocation: "EncounterLeftPane / MobileConsultationWorkspace tab Asistencia",
    phase483dStatus: "unmounted",
    replacement: "Clinical Copilot™ (insights determinísticos + generativo)",
  },
  {
    component: "Tab Asistencia",
    formerLocation: "LEFT_TABS / MAIN_TABS",
    phase483dStatus: "unmounted",
    replacement: "Tab Chat (solo mensajería) + Clinical Copilot™",
  },
];

/** Código conservado — deprecated, no montado en [id] */
export const DEPRECATED_AI_COMPONENTS: DeprecatedAiComponent[] = [
  {
    file: "components/clinical/ConsultationAssistPanel.tsx",
    exportName: "ConsultationAssistPanel",
    replacement: "CopilotGenerativeSection + getConsultationAssist",
  },
  {
    file: "components/clinical/AiInsightsPanel.tsx",
    exportName: "AiInsightsPanel",
    replacement: "Clinical Copilot™ + getConsultationInsights (facade)",
    note: "appendNotesFromAi legacy en ConsultationContext — ver 4.8.3E",
  },
  {
    file: "components/clinical/CopilotHubCta.tsx",
    exportName: "CopilotHubCta",
    replacement: "N/A — paneles legacy desmontados",
    note: "Conservado para imports opcionales",
  },
];

/** Rutas IA vivas post-4.8.3D (sin backend changes) */
export const LIVE_AI_SURFACES = [
  "Clinical Copilot™ (determinístico + generativo)",
  "LiveAiNoteSuggestions™",
  "ClinicalRecordPanel autollenado",
  "ChatPanel (tab Chat — no IA)",
] as const;

export const ASSIST_INSIGHTS_RETIREMENT_RISKS = [
  "AiInsightsPanel permitía appendNotesFromAi — no replicado en Copilot UI (4.8.3E)",
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

export function runAssistInsightsRetirementAudit(): AssistInsightsRetirementAuditResult {
  const productionMountViolations = scanProductionAssistInsightsMounts();
  return {
    retiredMounts: RETIRED_UI_MOUNTS.length,
    deprecatedComponents: DEPRECATED_AI_COMPONENTS.length,
    liveSurfaces: LIVE_AI_SURFACES.length,
    productionMountViolations,
    passed: productionMountViolations.length === 0,
    risks: ASSIST_INSIGHTS_RETIREMENT_RISKS,
  };
}
