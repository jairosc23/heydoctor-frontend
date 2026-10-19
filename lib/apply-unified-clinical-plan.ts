import type { UnifiedClinicalPlan, UnifiedPlanApplyResult } from "./types/unified-clinical-plan";

/**
 * W1.1 C2/C6 — direct prescription/lab writes without HAB are closed.
 * Plans become proposals/drafts only until HAB Confirm + owned emitters.
 */
export async function applyUnifiedClinicalPlan(_input: {
  plan: UnifiedClinicalPlan;
  patientId: string;
  consultationId?: string;
  cie10CodeId?: string;
  diagnosisLabel?: string;
}): Promise<UnifiedPlanApplyResult> {
  throw new Error(
    "LEGACY_UNIFIED_PLAN_APPLY_REMOVED: Direct createPrescription/createLabOrder bypasses Human Authority. Dispose suggestions via Copilot disposition; Confirm via HAB; emit via owned engines.",
  );
}
