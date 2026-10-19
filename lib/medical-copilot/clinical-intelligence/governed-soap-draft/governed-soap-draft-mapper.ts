import {
  GOVERNED_SOAP_DRAFT_GOVERNANCE,
  type GovernedSoapDraftResult,
  type GovernedSoapDraftSection,
} from "./governed-soap-draft";

export function mapGovernedSoapDraftEnvelope(
  payload: unknown,
): GovernedSoapDraftResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.subjective !== undefined ||
    root.objective !== undefined ||
    root.assessment !== undefined ||
    root.plan !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const subjective = mapSection(data.subjective, "subjective");
  const objective = mapSection(data.objective, "objective");
  const assessment = mapSection(data.assessment, "assessment");
  const plan = mapSection(data.plan, "plan");
  if (!subjective || !objective || !assessment || !plan) return null;

  return {
    clinicalDraft: data.clinicalDraft ?? null,
    subjective,
    objective,
    assessment,
    plan,
    governance: { ...GOVERNED_SOAP_DRAFT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

function mapSection(
  raw: unknown,
  expected: GovernedSoapDraftSection["section"],
): GovernedSoapDraftSection | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (s.section !== expected) return null;
  return {
    section: expected,
    status: "empty_structural_slot",
    items: [],
    sourceRef: typeof s.sourceRef === "string" ? s.sourceRef : null,
    readOnly: true,
    persisted: false,
  };
}
