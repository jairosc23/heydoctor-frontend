import { createLabOrder } from "./services/lab-orders";
import { createPrescription } from "./services/prescriptions";
import type { UnifiedClinicalPlan, UnifiedPlanApplyResult } from "./types/unified-clinical-plan";

export async function applyUnifiedClinicalPlan(input: {
  plan: UnifiedClinicalPlan;
  patientId: string;
  consultationId?: string;
  cie10CodeId?: string;
  diagnosisLabel?: string;
}): Promise<UnifiedPlanApplyResult> {
  const { plan, patientId, consultationId, diagnosisLabel } = input;
  const meds = plan.medications.filter((i) => i.enabled);
  const labs = plan.labs.filter((i) => i.enabled);
  const education = plan.education.filter((i) => i.enabled);
  const followUp = plan.followUp.filter((i) => i.enabled);

  let prescriptionCreated = false;
  let labOrderCreated = false;

  if (meds.length > 0) {
    await createPrescription({
      patientId,
      consultationId,
      diagnosis:
        diagnosisLabel ??
        (plan.diagnosisCode
          ? `${plan.diagnosisCode} — ${plan.diagnosisLabel ?? plan.diagnosisCode}`
          : undefined),
      medications: meds.map((m) => ({ name: m.label })),
    });
    prescriptionCreated = true;
  }

  if (labs.length > 0) {
    await createLabOrder({
      patientId,
      consultationId,
      exams: labs.map((l) => ({
        exam: l.label,
        reason: plan.diagnosisCode ?? l.reason,
      })),
    });
    labOrderCreated = true;
  }

  return {
    prescriptionCreated,
    labOrderCreated,
    educationCount: education.length,
    followUpCount: followUp.length,
  };
}
