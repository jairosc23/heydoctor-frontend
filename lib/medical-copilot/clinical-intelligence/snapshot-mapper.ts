/**
 * CI-6 — Frontend mapper for Clinical Copilot Snapshot.
 */

import {
  CLINICAL_COPILOT_SNAPSHOT_GOVERNANCE,
  type ClinicalCopilotSnapshot,
  type ClinicalCopilotSnapshotItem,
  type ClinicalCopilotSnapshotResult,
} from "./snapshot";

/**
 * Accepts API envelope data shapes:
 * - { snapshot: ClinicalCopilotSnapshotResult }
 * - ClinicalCopilotSnapshotResult
 */
export function mapSnapshotEnvelope(
  payload: unknown,
): ClinicalCopilotSnapshotResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "clinical_copilot_snapshot_orchestrator"
      ? root
      : root.snapshot &&
          typeof root.snapshot === "object" &&
          (root.snapshot as { source?: string }).source ===
            "clinical_copilot_snapshot_orchestrator"
        ? (root.snapshot as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const snapshot = mapSnapshot(resultObj.snapshot);
  if (!snapshot) return null;

  return {
    source: "clinical_copilot_snapshot_orchestrator",
    orchestratorVersion: "1.0.0",
    snapshot,
    governance: { ...CLINICAL_COPILOT_SNAPSHOT_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapSnapshot(raw: unknown): ClinicalCopilotSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (!s.metadata || typeof s.metadata !== "object") return null;
  const meta = s.metadata as Record<string, unknown>;
  const countsRaw =
    meta.counts && typeof meta.counts === "object"
      ? (meta.counts as Record<string, unknown>)
      : {};

  return {
    findings: mapItems(s.findings),
    insights: mapItems(s.insights),
    recommendations: mapItems(s.recommendations),
    decisions: mapItems(s.decisions),
    reasoning: mapItems(s.reasoning),
    governance: { ...CLINICAL_COPILOT_SNAPSHOT_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      generatedAt:
        typeof meta.generatedAt === "string"
          ? meta.generatedAt
          : new Date().toISOString(),
      orchestratorVersion: "1.0.0",
      status:
        meta.status === "ok" ||
        meta.status === "empty" ||
        meta.status === "partial"
          ? meta.status
          : "empty",
      counts: {
        findings: Number(countsRaw.findings ?? 0),
        insights: Number(countsRaw.insights ?? 0),
        recommendations: Number(countsRaw.recommendations ?? 0),
        decisions: Number(countsRaw.decisions ?? 0),
        reasoning: Number(countsRaw.reasoning ?? 0),
      },
    },
  };
}

function mapItems(raw: unknown): ClinicalCopilotSnapshotItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const i = item as Record<string, unknown>;
      if (typeof i.id !== "string" || typeof i.summary !== "string") return null;
      return {
        id: i.id,
        category: typeof i.category === "string" ? i.category : undefined,
        summary: i.summary,
        confidence:
          typeof i.confidence === "number" && Number.isFinite(i.confidence)
            ? i.confidence
            : undefined,
      };
    })
    .filter(Boolean) as ClinicalCopilotSnapshotItem[];
}
