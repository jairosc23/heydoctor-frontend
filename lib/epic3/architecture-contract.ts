/**
 * EPIC-3 Architecture Contract — frontend SSOT (E3-0b / E3-0c / Final Remediation).
 *
 * Daily product: Clinical Copilot Daily Hub = ClinicalCopilotDrawer on
 * `/panel/consultas/[id]`. Medical Copilot page is optional LAB surface,
 * outside the Daily Hub allowlist.
 *
 * HITL acts (never synonyms):
 *   H1 Review AI → POST /ai/runs/:id/approve|reject (no EMR)
 *   H2 Approve Action → POST /medical-copilot/actions/:id/approve|reject (no EMR)
 *   H3 Governed Persistence → POST …/governed-soap-persistence-execution (EMR)
 *       Daily Hub calls via lib wrapper `postMedicalCopilotGovernedSoapPersistenceExecution`
 *       (lib/medical-copilot/api.ts) from lib/epic3/close-hitl-execution.ts — not from surfaces.
 *   H4 Sign Consultation → POST /consultations/:id/sign
 */

/** Surfaces that constitute the Clinical Copilot Daily Hub (E3-0B). */
export const EPIC3_DAILY_HUB_SURFACES = [
  "app/panel/consultas/[id]/_components/copilot/ClinicalCopilotDrawer.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotSuggestedInterviewQuestions.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotLiveClinicalInsights.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotClinicalReviewWorkspace.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotPreVisitContext.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotPreVisitClinicalSnapshot.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotPreVisitQualitySignals.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotLiveClinicalContextTimeline.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotLiveDocumentationQuality.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotReviewSelectionLayer.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotPersistencePreview.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotCloseExecution.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotGovernanceBoundary.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotActionSystem.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotContextEngine.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotDocumentationGaps.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotDocumentationQuality.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotInsightCards.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotRiskSignals.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotSourceStrip.tsx",
] as const;

/**
 * API prefixes allowed for Daily Hub product flow.
 * H3 SOAP execution is invoked only from lib/epic3 (not surface source).
 */
export const EPIC3_DAILY_HUB_API_ALLOWLIST = [
  "/clinical-foundation/consultation/",
  "/consultations/",
  "/appointments",
  "/ai/consultation-assist",
  "/ai/consultation-summary",
  "/api/ai/consultation-assist",
  "/ai/runs/",
  "/medical-copilot/runtime",
  "/medical-copilot/session",
  "/medical-copilot/actions/",
  "/medical-copilot/telemetry",
  "/medical-copilot/feedback",
] as const;

/**
 * Lib modules authorized to call H3 Governed SOAP Persistence Execution
 * (path contains "governed-" — must not appear in Daily Hub surface .tsx).
 */
export const EPIC3_H3_LIB_WRAPPER = [
  "lib/medical-copilot/api.ts",
  "lib/epic3/close-hitl-execution.ts",
] as const;

export const EPIC3_H3_SOAP_EXECUTION_PATH =
  "/medical-copilot/session/:sessionId/governed-soap-persistence-execution" as const;

/**
 * Patterns that Daily Hub *surface* source files must not embed.
 * H3 is allowed only via EPIC3_H3_LIB_WRAPPER modules.
 */
export const EPIC3_DAILY_HUB_FORBIDDEN_API_PATTERNS = [
  "governed-",
  "MedicalCopilotDeferredPanel",
] as const;

/** Lab / optional page — not part of Daily Hub product. */
export const EPIC3_MEDICAL_COPILOT_LAB_ROUTE =
  "app/panel/consultas/[id]/medical-copilot/page.tsx" as const;

/**
 * Lab surface visibility. Default ON to preserve current UX for visitors of
 * the optional Medical Copilot page. Daily Hub never mounts this route.
 *
 * Set NEXT_PUBLIC_MEDICAL_COPILOT_LAB_SURFACE=0 to render only HITL workspace.
 */
export function isMedicalCopilotLabSurfaceEnabled(
  env: { NEXT_PUBLIC_MEDICAL_COPILOT_LAB_SURFACE?: string } = {
    NEXT_PUBLIC_MEDICAL_COPILOT_LAB_SURFACE:
      typeof process !== "undefined"
        ? process.env.NEXT_PUBLIC_MEDICAL_COPILOT_LAB_SURFACE
        : undefined,
  },
): boolean {
  const raw = env.NEXT_PUBLIC_MEDICAL_COPILOT_LAB_SURFACE?.trim().toLowerCase();
  if (raw === "0" || raw === "false" || raw === "off") return false;
  return true;
}

export const EPIC3_HITL_ACTS = {
  H1_REVIEW_AI: "review_ai",
  H2_APPROVE_ACTION: "approve_action",
  H3_GOVERNED_PERSISTENCE: "governed_persistence",
  H4_SIGN_CONSULTATION: "sign_consultation",
} as const;

export const EPIC3_EMR_AI_WRITER =
  "governed_persistence_execution_post_hitl" as const;

/** Sole generative Daily Hub product surfaces (UC-02B / UC-03C). */
export const EPIC3_GENERATIVE_DAILY_SURFACES = [
  "app/panel/consultas/[id]/_components/copilot/CopilotSuggestedInterviewQuestions.tsx",
  "app/panel/consultas/[id]/_components/copilot/CopilotLiveClinicalInsights.tsx",
] as const;
