import type { PatientClinicalMemory } from "./clinical-memory";

export type ClinicalFoundationMeta = {
  version: "Clinical Foundation v1";
  schemaVersion: "1.0.0";
  generatedAt: string;
};

export type ClinicalFoundationBundleHealth = {
  memoryLoaded: boolean;
  intelligenceLoaded: boolean;
  prescriptionsLoaded: boolean;
  labsLoaded: boolean;
  referralsLoaded: boolean;
};

export type ClinicalFoundationBundleHealthErrors = {
  memory: string | null;
  intelligence: string | null;
  prescriptions: string | null;
  labs: string | null;
  referrals: string | null;
};

export type ClinicalFoundationDiagnosis = {
  code: string | null;
  description: string | null;
  cie10CodeId: string | null;
};

export type ClinicalFoundationPatient = {
  id: string;
  displayName: string;
  documentType: string | null;
  documentNumber: string | null;
  birthDate: string | null;
  sex: string | null;
  email: string | null;
};

export type ClinicalFoundationConsultation = {
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
};

export type ClinicalFoundationEncounter = {
  chiefComplaint: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  vitalSigns: Record<string, unknown> | null;
  physicalExam: Record<string, unknown> | null;
  clinicalSummary: Record<string, unknown> | null;
};

export type ClinicalFoundationMedication = {
  name: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  duration?: string;
  instructions?: string;
  drugPresentationId?: string;
};

export type ClinicalFoundationPrescriptionOrder = {
  id: string;
  status: string;
  validationCode: string | null;
  diagnosis: string | null;
  medications: ClinicalFoundationMedication[];
  createdAt: string;
};

export type ClinicalFoundationLabExam = {
  exam: string;
  priority?: string;
  reason?: string;
  observations?: string;
};

export type ClinicalFoundationLabOrder = {
  id: string;
  status: string;
  templateName: string | null;
  validationCode: string | null;
  exams: ClinicalFoundationLabExam[];
  createdAt: string;
};

export type ClinicalFoundationReferralOrder = {
  id: string;
  status: string;
  specialty: string;
  receivingDoctorName: string;
  reason: string;
  validationCode: string | null;
  createdAt: string;
};

export type ClinicalFoundationOrders = {
  prescriptions: ClinicalFoundationPrescriptionOrder[];
  labs: ClinicalFoundationLabOrder[];
  referrals: ClinicalFoundationReferralOrder[];
};

export type ClinicalFoundationIntelligence = {
  memory: PatientClinicalMemory | null;
  clinical: unknown | null;
};

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

export type ClinicalFoundationProvenance = {
  id: string;
  kind: ClinicalFoundationProvenanceKind;
  entityId?: string | null;
  field?: string | null;
  label: string;
  valuePreview?: string | null;
  observedAt?: string | null;
};

export type ClinicalFoundationDrafts = {
  certificate: null;
  referral: null;
  prescription: null;
  clinicalReport: null;
};

export type ClinicalFoundationBundle = {
  meta: ClinicalFoundationMeta;
  bundleHealth: ClinicalFoundationBundleHealth;
  bundleHealthErrors?: ClinicalFoundationBundleHealthErrors;
  patient: ClinicalFoundationPatient;
  consultation: ClinicalFoundationConsultation;
  encounter: ClinicalFoundationEncounter;
  memory: PatientClinicalMemory | null;
  orders: ClinicalFoundationOrders;
  intelligence: ClinicalFoundationIntelligence;
  provenance: ClinicalFoundationProvenance[];
  drafts: ClinicalFoundationDrafts;
};
