/**
 * CP-34 — Maps governed ClinicalAnalysisResponse → ClinicalSuggestion (CP-32 UI).
 * Presentation bridge only — no new public contracts, no clinical interpretation.
 */

import type { ClinicalSuggestion } from "../voice-intelligence/types";
import type {
  ClinicalAnalysisActionItem,
  ClinicalAnalysisFinding,
  ClinicalAnalysisResponse,
} from "./types";

function severityForPriority(
  priority: string | null,
): ClinicalSuggestion["severity"] {
  const p = (priority ?? "").toLowerCase();
  if (p === "high" || p === "critical" || p === "urgent") return "review";
  if (p === "medium" || p === "normal") return "attention";
  return "info";
}

function findingToSuggestion(
  finding: ClinicalAnalysisFinding,
): ClinicalSuggestion {
  return {
    suggestionId: `governed_${finding.findingId}`,
    type: "manual_review",
    severity:
      finding.kind === "action"
        ? "attention"
        : finding.kind === "workspace"
          ? "info"
          : "info",
    title: finding.title,
    detail: `[Gobernado · ${finding.kind}] ${finding.summary}`,
    requiresPhysicianReview: true,
    autoAppliesToDictation: false,
  };
}

function actionToSuggestion(
  action: ClinicalAnalysisActionItem,
): ClinicalSuggestion {
  return {
    suggestionId: `governed_action_${action.actionId}`,
    type: "manual_review",
    severity: severityForPriority(action.priority),
    title: action.actionType || "Acción clínica",
    detail: `[Gobernado · action · ${action.status}] ${action.summary}`,
    requiresPhysicianReview: true,
    autoAppliesToDictation: false,
  };
}

/**
 * Converts a governed Facade analysis into Voice Suggestions Panel items.
 * Deduplicates action findings that already appear as actions.
 */
export function mapGovernedAnalysisToSuggestions(
  analysis: ClinicalAnalysisResponse,
): ClinicalSuggestion[] {
  const actionIds = new Set(analysis.actions.map((a) => a.actionId));
  const fromActions = analysis.actions.map(actionToSuggestion);
  const fromFindings = analysis.findings
    .filter((f) => {
      if (f.kind !== "action") return true;
      return !f.sourceId || !actionIds.has(f.sourceId);
    })
    .map(findingToSuggestion);

  return [...fromActions, ...fromFindings];
}
