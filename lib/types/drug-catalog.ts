/**
 * Prescription Engine PR-1 — Drug catalog contracts (FE).
 * Mirrors Nest clinical-catalog / smart-suggestions DTOs.
 * Country-independent: jurisdiction is a parameter, not a hard-coded locale.
 */

export type DrugRouteSummary = {
  code: string;
  nameEn?: string | null;
  nameEs?: string | null;
};

/** Presentation row from GET /clinical-catalog/drug-presentations */
export type DrugPresentationSummary = {
  id: string;
  substanceId: string;
  displayLabel: string;
  brandName: string | null;
  strengthDisplay: string;
  dosageForm: string;
  jurisdictionCode: string;
  isGeneric: boolean;
  route: DrugRouteSummary;
};

export type DrugPresentationDetail = {
  id: string;
  substance: {
    id: string;
    innName: string;
    atcCode: string | null;
  };
  route: DrugRouteSummary;
  jurisdictionCode: string;
  displayLabel: string;
  dosageForm: string;
  strengthDisplay: string;
  brandName: string | null;
  laboratory: string | null;
  isGeneric: boolean;
  regulatoryStatus: string;
  registrations: Array<{
    authority: string;
    registrationNumber: string | null;
    status: string;
  }>;
};

export type DrugSubstanceSummary = {
  id: string;
  innName: string;
  genericName: string;
  atcCode: string | null;
  therapeuticGroup: {
    code: string;
    nameEn: string;
    nameEs: string | null;
  } | null;
  pharmacologicClass: string | null;
};

export type SmartSuggestionSource =
  | "diagnosis_rule"
  | "personal_pattern"
  | "favorite"
  | "recent"
  | "frequent"
  | "search";

/** Row from GET /prescriptions/smart-suggestions */
export type SmartMedicationSuggestion = {
  id: string;
  substanceId: string;
  innName: string;
  displayLabel: string;
  genericName: string;
  brandName: string | null;
  strengthDisplay: string;
  dosageForm: string;
  route: { code: string; nameEs: string | null };
  jurisdictionCode: string;
  isGeneric: boolean;
  atcCode: string | null;
  source: SmartSuggestionSource;
  isFavorite: boolean;
  preferenceScore: number;
  ruleType?: string;
  useCount?: number;
  lastUsedAt?: string;
};

export type SmartSuggestionsResult = {
  diagnosisContext: {
    cie10CodeId: string;
    code: string;
    description: string;
  } | null;
  suggested: SmartMedicationSuggestion[];
  favorites: SmartMedicationSuggestion[];
  recent: SmartMedicationSuggestion[];
  frequent: SmartMedicationSuggestion[];
  personalPatterns: SmartMedicationSuggestion[];
  warnings: Array<{
    type: string;
    severity: "info" | "warning" | "critical";
    drugPresentationId: string;
    message: string;
    source: string;
  }>;
};

export type SearchPresentationsParams = {
  q?: string;
  substanceId?: string;
  jurisdictionCode?: string;
  routeCode?: string;
  limit?: number;
};

export type SmartSuggestionsParams = {
  q?: string;
  consultationId?: string;
  cie10CodeId?: string;
  patientId?: string;
  countryCode?: string;
  limit?: number;
};
