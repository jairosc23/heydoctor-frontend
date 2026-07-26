/**
 * PR-9 CCP Wave C0 — Continuity contracts (mirror BE ccp.types).
 */

export const CCP_CONTEXT_API_VERSION_V1 = "pr9-ccp-v1" as const;
export type ContinuityContextApiVersion = typeof CCP_CONTEXT_API_VERSION_V1;

export type PassiveHintSourceKind =
  | "continuity_active"
  | "continuity_timeline"
  | "clinical_protocol"
  | "therapeutic_knowledge"
  | "manual"
  | "reserved_future";

export type ContinuityStructuralMedication = {
  name: string;
  drugPresentationId?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  instructions?: string;
};

/** T2 closed allowlist */
export type ContinuityStructuralPayload = {
  medications?: ContinuityStructuralMedication[];
  diagnosis?: string | null;
  notes?: string | null;
  sourceChainId?: string;
  sourceVersionId?: string;
};

type ProvenanceBase = {
  provenanceApiVersion: "pr9-ccp-v1";
  occurredAt: string;
  actorClinicId: string;
  assembledBy: "continuity_context_builder";
};

export type ContinuityActiveProvenance = ProvenanceBase & {
  kind: "continuity_active_medication";
  chainId: string;
  versionId: string;
  patientId: string;
};

export type ContinuityTimelineProvenance = ProvenanceBase & {
  kind: "continuity_timeline_event";
  chainId: string;
  versionId: string;
  eventType: "issued" | "amended" | "renewed" | "cancelled";
  patientId: string;
};

export type ProtocolHintProvenance = ProvenanceBase & {
  kind: "protocol_assisted_hint";
  protocolId: string;
  protocolVersionId: string;
  contentHash: string;
  assistanceApiVersion: "pr8-pacp-v1";
};

export type TherapeuticHintProvenance = ProvenanceBase & {
  kind: "therapeutic_assisted_hint";
  tkAssetId: string;
  revisionId: string;
  assistanceApiVersion: "pr8-pacp-v1";
};

export type ManualHintProvenance = ProvenanceBase & {
  kind: "manual_composer_seed";
  seedLabel: string;
};

/** Authoritative provenance (S1) — not wire sourceAssetType */
export type HintProvenance =
  | ContinuityActiveProvenance
  | ContinuityTimelineProvenance
  | ProtocolHintProvenance
  | TherapeuticHintProvenance
  | ManualHintProvenance;

export type PassiveContinuityHint = {
  hintId: string;
  apiVersion: ContinuityContextApiVersion;
  sourceKind: PassiveHintSourceKind;
  priorityRank: number;
  title: string;
  summary?: string;
  structuralPayload?: ContinuityStructuralPayload;
  provenance: HintProvenance;
  actionableWithoutConfirmation: false;
};

export type ContinuityActiveMedication = {
  chainId: string;
  versionId: string;
  medicationName: string;
  drugPresentationId?: string | null;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  status: "active";
  issuedAt: string;
};

export type ContinuityTimelineSummary = {
  window: { from: string; to: string };
  events: Array<{
    eventType: "issued" | "amended" | "renewed" | "cancelled";
    chainId: string;
    versionId: string;
    occurredAt: string;
    medicationNames: string[];
    renewedFromVersionId?: string | null;
  }>;
};

export type ContinuityContext = {
  apiVersion: ContinuityContextApiVersion;
  patientId: string;
  clinicId: string;
  assembledAt: string;
  encounterId?: string | null;
  activeMedications: ContinuityActiveMedication[];
  timelineSummary: ContinuityTimelineSummary;
  hints: PassiveContinuityHint[];
  assemblyNotes?: {
    truncatedTimeline: boolean;
    omittedHintCount: number;
  };
};

export const CCP_BAND: Record<PassiveHintSourceKind, number> = {
  manual: 1,
  continuity_active: 2,
  continuity_timeline: 3,
  clinical_protocol: 4,
  therapeutic_knowledge: 5,
  reserved_future: 6,
};
