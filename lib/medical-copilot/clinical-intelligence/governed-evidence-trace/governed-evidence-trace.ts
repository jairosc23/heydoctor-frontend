export const GOVERNED_CLINICAL_EVIDENCE_UI_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
  writesEmr: false as const,
  repositoryInvoked: false as const,
  automaticDecision: false as const,
};

export type GovernedEvidenceTraceGovernance = typeof GOVERNED_CLINICAL_EVIDENCE_UI_GOVERNANCE;

export type GovernedEvidenceTraceComponentKey = "trace" | "evidence" | "governance" | "hitl";

export type GovernedEvidenceTraceComponentPresence = {
  key: GovernedEvidenceTraceComponentKey;
  label: string;
  present: boolean;
  readOnly: true;
  persisted: false;
};

export type GovernedEvidenceTraceResult = {
  payload: unknown;
  status: string | null;
  title: string | null;
  itemCount: number;
  components: GovernedEvidenceTraceComponentPresence[];
  governance: GovernedEvidenceTraceGovernance;
  reason: string | null;
  readOnly: true;
  persisted: false;
  writesEmr: false;
  repositoryInvoked: false;
  executesAction: false;
  draftApproved: false;
  automaticDecision: false;
};
