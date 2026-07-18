/**
 * W4 — PHI-safe HITL decision trail (mirrors BE MedicalCopilotHitlGovernanceService).
 */

export type HitlDecisionKind = "approved" | "rejected";

export type HitlDecisionRecord = {
  actionId: string;
  sessionId: string;
  decision: HitlDecisionKind;
  actorUserId: string;
  decidedAt: string;
  hasReason: boolean;
  auditRecorded: boolean;
};

export type HitlDecisionTrail = {
  sessionId: string;
  decisions: HitlDecisionRecord[];
  approvedCount: number;
  rejectedCount: number;
  pendingActionCount: number;
  persistGate: "allow" | "require_approval" | "allow_no_actions";
  requiresPhysicianReview: true;
  executesAction: false;
  autoPersistedToEmr: false;
};

export function mapHitlDecisionTrail(raw: unknown): HitlDecisionTrail | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.sessionId !== "string") return null;
  if (r.requiresPhysicianReview !== true) return null;
  if (r.executesAction !== false || r.autoPersistedToEmr !== false) return null;
  const persistGate =
    r.persistGate === "allow" ||
    r.persistGate === "require_approval" ||
    r.persistGate === "allow_no_actions"
      ? r.persistGate
      : "allow_no_actions";
  const decisions = Array.isArray(r.decisions)
    ? r.decisions
        .map((d) => mapDecision(d))
        .filter((d): d is HitlDecisionRecord => d !== null)
    : [];
  return {
    sessionId: r.sessionId,
    decisions,
    approvedCount: Number(r.approvedCount ?? 0),
    rejectedCount: Number(r.rejectedCount ?? 0),
    pendingActionCount: Number(r.pendingActionCount ?? 0),
    persistGate,
    requiresPhysicianReview: true,
    executesAction: false,
    autoPersistedToEmr: false,
  };
}

function mapDecision(raw: unknown): HitlDecisionRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  if (d.decision !== "approved" && d.decision !== "rejected") return null;
  if (typeof d.actionId !== "string" || typeof d.sessionId !== "string") {
    return null;
  }
  return {
    actionId: d.actionId,
    sessionId: d.sessionId,
    decision: d.decision,
    actorUserId: typeof d.actorUserId === "string" ? d.actorUserId : "",
    decidedAt: typeof d.decidedAt === "string" ? d.decidedAt : "",
    hasReason: Boolean(d.hasReason),
    auditRecorded: Boolean(d.auditRecorded),
  };
}
