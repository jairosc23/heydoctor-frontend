import {
  GOVERNED_CLINICAL_INTELLIGENCE_RUNTIME_GOVERNANCE,
  type GovernedClinicalIntelligenceRuntimeResult,
} from "./governed-clinical-intelligence-runtime";

export function mapGovernedClinicalIntelligenceRuntimeEnvelope(
  payload: unknown,
): GovernedClinicalIntelligenceRuntimeResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.foundation !== undefined ||
    root.providerExecution !== undefined ||
    root.processedResponse !== undefined ||
    root.clinicalOutput !== undefined ||
    root.physicianReview !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const hasPackage =
    data.foundation != null ||
    data.providerExecution != null ||
    data.processedResponse != null ||
    data.clinicalOutput != null ||
    data.physicianReview != null;
  if (!hasPackage && data.governance == null) return null;

  return {
    foundation: data.foundation ?? null,
    providerExecution: data.providerExecution ?? null,
    processedResponse: data.processedResponse ?? null,
    clinicalOutput: data.clinicalOutput ?? null,
    physicianReview: data.physicianReview ?? null,
    governance: { ...GOVERNED_CLINICAL_INTELLIGENCE_RUNTIME_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
