import { GOVERNED_CLINICAL_KNOWLEDGE_UI_GOVERNANCE, type GovernedProcedureKnowledgeEngineEntryView, type GovernedProcedureKnowledgeEngineResult } from "./governed-procedure-knowledge-engine";

function mapEntry(raw: unknown): GovernedProcedureKnowledgeEngineEntryView | null {
  if (!raw || typeof raw !== "object") return null;
  const e = raw as Record<string, unknown>;
  if (typeof e.entryId !== "string") return null;
  return {
    entryId: e.entryId,
    entryTitle: typeof e.entryTitle === "string" ? e.entryTitle : e.entryId,
    domain: typeof e.domain === "string" ? e.domain : "",
    topic: typeof e.topic === "string" ? e.topic : "",
    summary: typeof e.summary === "string" ? e.summary : "",
    explanation: typeof e.explanation === "string" ? e.explanation : "",
    evidenceRefs: Array.isArray(e.evidenceRefs) ? e.evidenceRefs.map(String) : [],
    applicability: typeof e.applicability === "string" ? e.applicability : "REFERENCE_ONLY",
    confidence: typeof e.confidence === "string" ? e.confidence : "low",
  };
}

export function mapGovernedProcedureKnowledgeEngineEnvelope(payload: unknown): GovernedProcedureKnowledgeEngineResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.governance !== undefined || root.entries !== undefined || root.enginesPresent !== undefined || root.diseaseKnowledgeEngine !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  let entriesRaw: unknown[] = [];
  if (Array.isArray(data.entries)) {
    entriesRaw = data.entries;
  } else if (data.enginesPresent || data.diseaseKnowledgeEngine) {
    for (const [k, v] of Object.entries(data)) {
      if (v && typeof v === "object" && Array.isArray((v as { entries?: unknown[] }).entries)) {
        entriesRaw.push(...((v as { entries: unknown[] }).entries));
      }
    }
  }

  const entries = entriesRaw.map(mapEntry).filter((e): e is GovernedProcedureKnowledgeEngineEntryView => e !== null);
  const applicableCount =
    typeof data.applicableCount === "number"
      ? data.applicableCount
      : entries.filter((e) => e.applicability === "APPLICABLE").length;
  const enginesPresent = Array.isArray(data.enginesPresent)
    ? data.enginesPresent.map(String)
    : [];

  return {
    payload: data,
    status: typeof data.status === "string" ? data.status : null,
    title: typeof data.title === "string" ? data.title : null,
    applicableCount,
    entries,
    enginesPresent,
    governance: { ...GOVERNED_CLINICAL_KNOWLEDGE_UI_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true,
    persisted: false,
    writesEmr: false,
    repositoryInvoked: false,
    executesAction: false,
    draftApproved: false,
    automaticDecision: false,
    usesLlm: false,
  };
}
