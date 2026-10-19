/**
 * Contrato HTTP del Clinical Rules Evaluator (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_RULE_TYPES = [
  "medication_rule",
  "allergy_rule",
  "laboratory_rule",
  "preventive_rule",
  "longitudinal_rule",
] as const;

export type ClinicalRuleType = (typeof CLINICAL_RULE_TYPES)[number];

export type ClinicalRuleGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalRuleGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalRuleGateIssue[] };

export type ClinicalRuleFactCitation = {
  artifactId: string;
  artifactType?: string | null;
};

export type ClinicalRuleRecordCitation = {
  recordId: string;
  recordType?: string | null;
};

export type ClinicalRuleEvaluationSourceRefs = {
  facts: ClinicalRuleFactCitation[];
  recordRefs: ClinicalRuleRecordCitation[];
};

export type ClinicalRuleEvaluationHttpView = {
  id: string;
  ruleType: string;
  title: string;
  description: string;
  status: string;
  countryCode: string;
  locale: string;
  consultationId: string | null;
  clinic: { id?: string; name: string; countryCode: string };
  doctor: {
    id?: string;
    name: string;
    specialty?: string | null;
    licenseNumber?: string | null;
  };
  patient: {
    id?: string;
    name: string;
    documentNumber?: string | null;
  };
  payload: {
    kind: string;
    facts?: ClinicalRuleFactCitation[] | null;
    recordRefs?: ClinicalRuleRecordCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; factsRegistered: true };
  sourceRefs: ClinicalRuleEvaluationSourceRefs;
  ruleSetId: null;
  evaluatedAt: string | Date;
  evaluationChannel: "clinical_rules_evaluator";
  supportsPreview: boolean;
  supportsEvaluation: boolean;
  supportsExplanation: false;
  supportsExecution: false;
  immutable: true;
  inClinicalRulesScope: boolean;
};

export type ClinicalRuleEvaluationViewProjectionResult =
  | { ok: true; view: ClinicalRuleEvaluationHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalRuleHttpCapability = {
  ruleType: string;
  title: string;
  supportsPreview: boolean;
  supportsEvaluation: boolean;
  supportsExplanation: false;
  supportsExecution: false;
  immutable: true;
  inClinicalRulesScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalRuleEvaluationPreviewResponse = {
  data: {
    ruleType: ClinicalRuleType | string;
    consultationId: string;
    view: ClinicalRuleEvaluationViewProjectionResult;
    gate: ClinicalRuleGateResult;
    capability: ClinicalRuleHttpCapability;
  };
};
