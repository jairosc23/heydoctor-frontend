import { GOVERNED_DIAGNOSTIC_INTELLIGENCE_UI_GOVERNANCE, type GovernedDiagnosticLearningDiagnosticIntelEngineEntryView, type GovernedDiagnosticLearningDiagnosticIntelEngineResult } from "./governed-diagnostic-learning-diagnostic-intel-engine";
function mapEntry(raw: unknown): GovernedDiagnosticLearningDiagnosticIntelEngineEntryView | null {
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
    diagnosticRole: typeof e.diagnosticRole === "string" ? (e.diagnosticRole as string) : "",
    applicability: typeof e.applicability === "string" ? e.applicability : "REFERENCE_ONLY",
    confidence: typeof e.confidence === "string" ? e.confidence : "low",
  };
}
export function mapGovernedDiagnosticLearningDiagnosticIntelEngineEnvelope(payload: unknown): GovernedDiagnosticLearningDiagnosticIntelEngineResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data = root.governance !== undefined || root.entries !== undefined || root.enginesPresent !== undefined || root.diagnosticRuntimeDiagnosticIntelEngine !== undefined
    ? root : root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : null;
  if (!data) return null;
  let entriesRaw: unknown[] = [];
  if (Array.isArray(data.entries)) entriesRaw = data.entries;
  else if (data.enginesPresent || data.diagnosticRuntimeDiagnosticIntelEngine) {
    for (const [, v] of Object.entries(data)) {
      if (v && typeof v === "object" && Array.isArray((v as { entries?: unknown[] }).entries)) {
        entriesRaw.push(...((v as { entries: unknown[] }).entries));
      }
    }
  }
  const entries = entriesRaw.map(mapEntry).filter((e): e is GovernedDiagnosticLearningDiagnosticIntelEngineEntryView => e !== null);
  const applicableCount = typeof data.applicableCount === "number" ? data.applicableCount : entries.filter((e) => e.applicability === "APPLICABLE").length;
  return {
    payload: data, status: typeof data.status === "string" ? data.status : null, title: typeof data.title === "string" ? data.title : null,
    applicableCount, entries, enginesPresent: Array.isArray(data.enginesPresent) ? data.enginesPresent.map(String) : [],
    governance: { ...GOVERNED_DIAGNOSTIC_INTELLIGENCE_UI_GOVERNANCE }, reason: typeof data.reason === "string" ? data.reason : null,
    readOnly: true, persisted: false, writesEmr: false, repositoryInvoked: false, executesAction: false,
    draftApproved: false, automaticDecision: false, usesLlm: false,
  };
}
