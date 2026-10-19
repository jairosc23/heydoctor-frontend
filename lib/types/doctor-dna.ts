export type DoctorDnaPatternItem = {
  id: string;
  label: string;
  code?: string | null;
  frequency: number;
  lastUsedAt: string;
  preferenceScore: number;
};

export type DoctorDnaFollowUp = {
  diagnosisCode: string | null;
  diagnosisLabel: string;
  intervalDays: number;
  frequency: number;
  lastUsedAt: string;
  preferenceScore: number;
};

export type DoctorDnaPracticeMetrics = {
  consultations30d: number;
  prescriptions30d: number;
  labOrders30d: number;
  uniquePatients30d: number;
  generatedAt: string;
};

export type DoctorDnaProfile = {
  doctorId: string;
  topDiagnoses: DoctorDnaPatternItem[];
  topMedications: DoctorDnaPatternItem[];
  topLabs: DoctorDnaPatternItem[];
  topFollowUps: DoctorDnaFollowUp[];
  practiceMetrics: DoctorDnaPracticeMetrics;
};
