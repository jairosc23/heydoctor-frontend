import type { PatientClinicalMemory } from "./clinical-memory";

export type ClinicalFoundationProblemPriority = "high" | "medium" | "low";

export type ClinicalFoundationFindingCategory =
  | "encounter"
  | "diagnosis"
  | "alert"
  | "vital_sign"
  | "physical_exam"
  | "memory"
  | "medication"
  | "order";

export type ClinicalFoundationDocumentationGapCode =
  | "missing_diagnosis"
  | "missing_anamnesis"
  | "missing_plan"
  | "missing_vital_signs"
  | "missing_physical_exam"
  | "missing_follow_up";

export type ClinicalFoundationProvenanceKind =
  | "consultation"
  | "patient"
  | "patient_profile"
  | "clinical_memory"
  | "clinical_intelligence"
  | "prescription"
  | "lab_order"
  | "referral"
  | "cie10"
  | "derived_rule";

export interface ClinicalFoundationMeta {
  version: "Clinical Foundation v1";
  schemaVersion: "1.0.0";
  generatedAt: string;
}

export interface ClinicalFoundationBundleHealth {
  memoryLoaded: boolean;
  intelligenceLoaded: boolean;
  prescriptionsLoaded: boolean;
  labsLoaded: boolean;
  referralsLoaded: boolean;
}

export interface ClinicalFoundationBundleHealthErrors {
  memory: string | null;
  intelligence: string | null;
  prescriptions: string | null;
  labs: string | null;
  referrals: string | null;
}

export interface ClinicalFoundationDiagnosis {
  code: string | null;
  description: string | null;
  cie10CodeId: string | null;
}

export interface ClinicalFoundationPatient {
  id: string;
  displayName: string;
  documentType: string | null;
  documentNumber: string | null;
  birthDate: string | null;
  sex: string | null;
  email: string | null;
}

export interface ClinicalFoundationConsultation {
  id: string;
  status: string;
  reason: string | null;
  diagnosisText: string | null;
  cie10: ClinicalFoundationDiagnosis | null;
  treatment: string | null;
  notes: string | null;
  doctorId: string;
  signedAt: string | null;
  isSigned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalFoundationEncounter {
  chiefComplaint: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  vitalSigns: Record<string, unknown> | null;
  physicalExam: Record<string, unknown> | null;
  clinicalSummary: Record<string, unknown> | null;
}

export interface ClinicalFoundationMedication {
  name: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  duration?: string;
  instructions?: string;
  drugPresentationId?: string;
}

export interface ClinicalFoundationPrescriptionOrder {
  id: string;
  status: string;
  validationCode: string | null;
  diagnosis: string | null;
  medications: ClinicalFoundationMedication[];
  createdAt: string;
}

export interface ClinicalFoundationLabExam {
  exam: string;
  priority?: string;
  reason?: string;
  observations?: string;
}

export interface ClinicalFoundationLabOrder {
  id: string;
  status: string;
  templateName: string | null;
  validationCode: string | null;
  exams: ClinicalFoundationLabExam[];
  createdAt: string;
}

export interface ClinicalFoundationReferralOrder {
  id: string;
  status: string;
  specialty: string;
  receivingDoctorName: string;
  reason: string;
  validationCode: string | null;
  createdAt: string;
}

export interface ClinicalFoundationOrders {
  prescriptions: ClinicalFoundationPrescriptionOrder[];
  labs: ClinicalFoundationLabOrder[];
  referrals: ClinicalFoundationReferralOrder[];
}

export interface ClinicalFoundationProvenance {
  id: string;
  kind: ClinicalFoundationProvenanceKind;
  entityId?: string | null;
  field?: string | null;
  label: string;
  valuePreview?: string | null;
  observedAt?: string | null;
}

export interface ClinicalFoundationOutputProvenance {
  kind: ClinicalFoundationProvenanceKind;
  entityId: string | null;
  field: string | null;
  label: string;
}

export interface ClinicalFoundationOutputLine {
  id: string;
  text: string;
  source: string;
  provenance: ClinicalFoundationOutputProvenance[];
}

export interface ClinicalFoundationOutputField {
  text: string;
  source: string;
  provenance: ClinicalFoundationOutputProvenance[];
}

export interface ClinicalFoundationClinicalSummary {
  title: string;
  lines: ClinicalFoundationOutputLine[];
  provenance: ClinicalFoundationOutputProvenance[];
  generatedAt: string;
}

export interface ClinicalFoundationSoapDraft {
  subjective: ClinicalFoundationOutputField | null;
  objective: ClinicalFoundationOutputField | null;
  assessment: ClinicalFoundationOutputField | null;
  plan: ClinicalFoundationOutputField | null;
  provenance: ClinicalFoundationOutputProvenance[];
  generatedAt: string;
}

export interface ClinicalFoundationProblem {
  id: string;
  label: string;
  code: string | null;
  source: "current_diagnosis" | "active_condition" | "recent_diagnosis" | "alert";
  priority: ClinicalFoundationProblemPriority;
  provenance: ClinicalFoundationOutputProvenance[];
  generatedAt: string;
}

export interface ClinicalFoundationFinding {
  id: string;
  category: ClinicalFoundationFindingCategory;
  label: string;
  value: string;
  source: string;
  provenance: ClinicalFoundationOutputProvenance[];
  generatedAt: string;
}

export interface ClinicalFoundationDocumentationGap {
  id: string;
  code: ClinicalFoundationDocumentationGapCode;
  label: string;
  priority: ClinicalFoundationProblemPriority;
  source: "encounter" | "consultation" | "orders" | "derived_rule";
  provenance: ClinicalFoundationOutputProvenance[];
  generatedAt: string;
}

export interface ClinicalFoundationOutputs {
  clinicalSummary: ClinicalFoundationClinicalSummary;
  soapDraft: ClinicalFoundationSoapDraft;
  problemList: ClinicalFoundationProblem[];
  clinicalFindings: ClinicalFoundationFinding[];
  documentationGaps: ClinicalFoundationDocumentationGap[];
}

export interface ClinicalFoundationIntelligence {
  memory: PatientClinicalMemory | null;
  clinical: unknown | null;
}

export interface ClinicalFoundationDrafts {
  certificate: null;
  referral: null;
  prescription: null;
  clinicalReport: null;
}

export interface ClinicalFoundationBundle {
  meta: ClinicalFoundationMeta;
  bundleHealth: ClinicalFoundationBundleHealth;
  bundleHealthErrors?: ClinicalFoundationBundleHealthErrors;
  patient: ClinicalFoundationPatient;
  consultation: ClinicalFoundationConsultation;
  encounter: ClinicalFoundationEncounter;
  memory: PatientClinicalMemory | null;
  orders: ClinicalFoundationOrders;
  intelligence: ClinicalFoundationIntelligence | null;
  provenance: ClinicalFoundationProvenance[];
  outputs: ClinicalFoundationOutputs | null;
  drafts: ClinicalFoundationDrafts;
}
