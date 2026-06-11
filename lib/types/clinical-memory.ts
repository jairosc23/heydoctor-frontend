export type ClinicalMemoryCondition = {
  code: string | null;
  label: string;
  source: "cie10" | "profile" | "diagnosis_text";
  lastSeenAt?: string;
};

export type ClinicalMemoryMedication = {
  name: string;
  drugPresentationId?: string;
  dosage?: string;
  frequency?: string;
  prescriptionId: string;
  since: string;
};

export type ClinicalMemoryPendingLab = {
  exam: string;
  labOrderId: string;
  orderedAt: string;
  status: string;
};

export type ClinicalMemoryAlert = {
  code: string;
  severity: "info" | "warning" | "critical";
  message: string;
  source: "rule" | "profile";
};

export type ClinicalMemoryConsultationSummary = {
  id: string;
  createdAt: string;
  status: string;
  diagnosisCode: string | null;
  diagnosisLabel: string | null;
};

export type PatientClinicalMemory = {
  patientId: string;
  activeConditions: ClinicalMemoryCondition[];
  recentDiagnoses: ClinicalMemoryCondition[];
  currentMedications: ClinicalMemoryMedication[];
  pendingLabs: ClinicalMemoryPendingLab[];
  alerts: ClinicalMemoryAlert[];
  recentConsultations: ClinicalMemoryConsultationSummary[];
};
