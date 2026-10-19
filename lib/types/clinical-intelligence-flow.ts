export interface DiagnosisContext {
  cie10CodeId: string;
  code: string;
  description: string;
}

export interface SelectedDiagnosis {
  cie10CodeId: string;
  code: string;
  description: string;
}

export interface ClinicalFlowMedicationSuggestion {
  id: string;
  displayLabel: string;
  innName: string;
  jurisdictionCode: string;
  ruleType: string;
  priority: number;
  source: "diagnosis_rule";
}

export interface ClinicalFlowLabSuggestion {
  id: string;
  code: string;
  name: string;
  category: string;
  ruleType: string;
  priority: number;
  source: "diagnosis_rule";
}

export interface ClinicalFlowEducationSuggestion {
  id: string;
  code: string;
  title: string;
  content: string;
  category: string;
  ruleType: string;
  priority: number;
  source: "diagnosis_rule";
}

export interface ClinicalFlowFollowUpSuggestion {
  id: string;
  code: string;
  title: string;
  recommendation: string;
  intervalDays: number | null;
  category: string;
  ruleType: string;
  priority: number;
  source: "diagnosis_rule";
}

export interface ClinicalFlowSuggestionsResponse {
  diagnosis: DiagnosisContext;
  jurisdiction: string;
  medications: ClinicalFlowMedicationSuggestion[];
  labs: ClinicalFlowLabSuggestion[];
  education: ClinicalFlowEducationSuggestion[];
  followUp: ClinicalFlowFollowUpSuggestion[];
}
