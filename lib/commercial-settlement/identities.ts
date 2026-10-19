/**
 * Official identity table — commercial and clinical domains.
 *
 * These four names are the only canonical identities. Do not invent aliases
 * (for example treating CorrelationId as SettlementId or ClinicalActId).
 */

export const OFFICIAL_IDENTITIES = {
  EncounterId: {
    name: "EncounterId",
    domain: "Encounter",
    role: "Canonical identity of one Encounter (consultation.id).",
    not: "Not ClinicalActId, SettlementId, or CorrelationId.",
  },
  ClinicalActId: {
    name: "ClinicalActId",
    domain: "Clinical Completion",
    role: "Canonical identity of one clinical act.",
    not: "Independent of SettlementId. Frozen with Clinical Completion.",
  },
  SettlementId: {
    name: "SettlementId",
    domain: "Commercial Settlement",
    role: "Canonical identity of one commercial settlement. Bound to exactly one Encounter.",
    not: "Independent of ClinicalActId. Never CorrelationId.",
  },
  CorrelationId: {
    name: "CorrelationId",
    domain: "Observability",
    role: "Tracing and request correlation only.",
    not: "Never the identity of an Encounter, ClinicalAct, or Settlement.",
  },
} as const;

export type OfficialIdentityName = keyof typeof OFFICIAL_IDENTITIES;

export const OFFICIAL_IDENTITY_NAMES = [
  "EncounterId",
  "ClinicalActId",
  "SettlementId",
  "CorrelationId",
] as const satisfies readonly OfficialIdentityName[];
