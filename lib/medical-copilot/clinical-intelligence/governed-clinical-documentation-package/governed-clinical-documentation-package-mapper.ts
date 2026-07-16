import {
  GOVERNED_CLINICAL_DOCUMENTATION_PACKAGE_GOVERNANCE,
  type GovernedClinicalDocumentationPackageDocumentKey,
  type GovernedClinicalDocumentationPackageDocumentPresence,
  type GovernedClinicalDocumentationPackageResult,
} from "./governed-clinical-documentation-package";

const DOCUMENT_DEFS: Array<{
  key: GovernedClinicalDocumentationPackageDocumentKey;
  label: string;
}> = [
  { key: "clinicalDraft", label: "Clinical Draft" },
  { key: "soapDraft", label: "SOAP Draft" },
  { key: "prescriptionDraft", label: "Prescription Draft" },
  { key: "ordersDraft", label: "Orders Draft" },
  { key: "referralDraft", label: "Referral Draft" },
  { key: "medicalCertificateDraft", label: "Medical Certificate Draft" },
  { key: "medicalLeaveDraft", label: "Medical Leave Draft" },
  { key: "patientInstructionsDraft", label: "Patient Instructions Draft" },
  { key: "followUpDraft", label: "Follow-up Draft" },
  { key: "clinicalVisitSummaryDraft", label: "Clinical Visit Summary Draft" },
  { key: "carePlanDraft", label: "Care Plan Draft" },
  { key: "patientEducationDraft", label: "Patient Education Draft" },
  { key: "dischargeDraft", label: "Discharge Draft" },
];

export function mapGovernedClinicalDocumentationPackageEnvelope(
  payload: unknown,
): GovernedClinicalDocumentationPackageResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalDraft !== undefined ||
    root.soapDraft !== undefined ||
    root.dischargeDraft !== undefined ||
    root.governance !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const documents: GovernedClinicalDocumentationPackageDocumentPresence[] =
    DOCUMENT_DEFS.map(({ key, label }) => ({
      key,
      label,
      present: data[key] != null,
      readOnly: true as const,
      persisted: false as const,
    }));

  return {
    clinicalDraft: data.clinicalDraft ?? null,
    soapDraft: data.soapDraft ?? null,
    prescriptionDraft: data.prescriptionDraft ?? null,
    ordersDraft: data.ordersDraft ?? null,
    referralDraft: data.referralDraft ?? null,
    medicalCertificateDraft: data.medicalCertificateDraft ?? null,
    medicalLeaveDraft: data.medicalLeaveDraft ?? null,
    patientInstructionsDraft: data.patientInstructionsDraft ?? null,
    followUpDraft: data.followUpDraft ?? null,
    clinicalVisitSummaryDraft: data.clinicalVisitSummaryDraft ?? null,
    carePlanDraft: data.carePlanDraft ?? null,
    patientEducationDraft: data.patientEducationDraft ?? null,
    dischargeDraft: data.dischargeDraft ?? null,
    documents,
    governance: { ...GOVERNED_CLINICAL_DOCUMENTATION_PACKAGE_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}
