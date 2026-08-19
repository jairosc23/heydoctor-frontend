import { ApiError, heydoctorApi } from "../heydoctor-api";
import {
  evidenceCapabilityFromPreview,
  isClinicalEvidencePreviewEnabled,
} from "./capability";
import {
  CLINICAL_EVIDENCE_TYPES,
  type ClinicalEvidenceHttpCapability,
  type ClinicalEvidencePreviewResponse,
  type ClinicalEvidenceType,
} from "./types";

export type ClinicalEvidenceListItem = {
  evidenceType: ClinicalEvidenceType;
  preview: ClinicalEvidencePreviewResponse;
  capability: ClinicalEvidenceHttpCapability;
};

export function previewPath(
  evidenceType: ClinicalEvidenceType,
  consultationId: string,
  previewId?: string,
): string {
  const query = new URLSearchParams({ consultationId });
  if (previewId) query.set("previewId", previewId);
  return `/clinical-evidence/${evidenceType}/preview?${query.toString()}`;
}

export async function previewClinicalEvidence(
  evidenceType: ClinicalEvidenceType,
  consultationId: string,
  previewId?: string,
): Promise<ClinicalEvidencePreviewResponse> {
  return heydoctorApi.get<ClinicalEvidencePreviewResponse>(
    previewPath(evidenceType, consultationId, previewId),
  );
}

export async function listEnabledClinicalEvidenceTypes(
  consultationId: string,
): Promise<ClinicalEvidenceListItem[]> {
  const evidences = await Promise.allSettled(
    CLINICAL_EVIDENCE_TYPES.map(async (evidenceType) => {
      const preview = await previewClinicalEvidence(evidenceType, consultationId);
      const capability = evidenceCapabilityFromPreview(preview);
      if (!isClinicalEvidencePreviewEnabled(capability)) {
        return null;
      }
      return { evidenceType, preview, capability } satisfies ClinicalEvidenceListItem;
    }),
  );

  const items: ClinicalEvidenceListItem[] = [];
  const errors: Error[] = [];
  let missingConsultation = false;

  for (const evidence of evidences) {
    if (evidence.status === "fulfilled") {
      if (evidence.value) items.push(evidence.value);
      continue;
    }
    const error = evidence.reason;
    if (error instanceof ApiError && error.status === 403) continue;
    if (error instanceof ApiError && error.status === 404) {
      missingConsultation = true;
      continue;
    }
    errors.push(error instanceof Error ? error : new Error(String(error)));
  }

  if (missingConsultation && items.length === 0) {
    throw new ApiError("Consulta no encontrada", 404);
  }
  if (items.length === 0 && errors.length > 0) {
    throw errors[0];
  }
  return items;
}
