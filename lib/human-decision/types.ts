/**
 * Contrato HTTP del Human Decision (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const HUMAN_DECISION_TYPES = [
  "therapeutic_decision",
  "investigation_decision",
  "precaution_decision",
] as const;

export type HumanDecisionType = (typeof HUMAN_DECISION_TYPES)[number];

export type HumanDecisionGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type HumanDecisionGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: HumanDecisionGateIssue[] };

export type HumanDecisionGovernanceCitation = {
  governanceId: string;
  governanceType?: string | null;
  governancePosture?: string | null;
};

export type HumanDecisionSourceRefs = {
  governances: HumanDecisionGovernanceCitation[];
};

export type HumanDecisionHttpView = {
  id: string;
  decisionType: string;
  title: string;
  description: string;
  status: string;
  disposition: string;
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
    governances?: HumanDecisionGovernanceCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; governanceConstituted: true };
  sourceRefs: HumanDecisionSourceRefs;
  decisionSetId: null;
  decidedAt: string | Date;
  decisionChannel: "human_decision";
  supportsPreview: boolean;
  supportsDecision: boolean;
  supportsDiagnosis: false;
  supportsGovernance: false;
  supportsAuthorization: false;
  supportsExecution: false;
  supportsEmission: false;
  immutable: true;
  inHumanDecisionScope: boolean;
};

export type HumanDecisionViewProjectionResult =
  | { ok: true; view: HumanDecisionHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type HumanDecisionHttpCapability = {
  decisionType: string;
  title: string;
  supportsPreview: boolean;
  supportsDecision: boolean;
  supportsDiagnosis: false;
  supportsGovernance: false;
  supportsAuthorization: false;
  supportsExecution: false;
  supportsEmission: false;
  immutable: true;
  inHumanDecisionScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type HumanDecisionPreviewResponse = {
  data: {
    decisionType: HumanDecisionType | string;
    consultationId: string;
    view: HumanDecisionViewProjectionResult;
    gate: HumanDecisionGateResult;
    capability: HumanDecisionHttpCapability;
  };
};
