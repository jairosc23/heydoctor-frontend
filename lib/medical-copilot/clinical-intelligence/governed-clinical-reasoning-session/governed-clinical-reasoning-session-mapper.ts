import { GOVERNED_CLINICAL_REASONING_SESSION_GOVERNANCE, type GovernedClinicalReasoningSession, type GovernedClinicalReasoningSessionBuilderResult, type GovernedClinicalReasoningSessionSlot, type AiLayerProviderId } from "./governed-clinical-reasoning-session";
export function mapGovernedClinicalReasoningSessionEnvelope(payload: unknown): GovernedClinicalReasoningSessionBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "governed_clinical_reasoning_session" ? root : root.governedClinicalReasoningSession && typeof root.governedClinicalReasoningSession === "object" && (root.governedClinicalReasoningSession as { source?: string }).source === "governed_clinical_reasoning_session" ? (root.governedClinicalReasoningSession as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapGovernedClinicalReasoningSession(resultObj.governedClinicalReasoningSession);
  if (!mapped) return null;
  return { source: "governed_clinical_reasoning_session", builderVersion: "1.0.0", governedClinicalReasoningSession: mapped, governance: { ...GOVERNED_CLINICAL_REASONING_SESSION_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapGovernedClinicalReasoningSession(raw: unknown): GovernedClinicalReasoningSession | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.governedClinicalReasoningSessionId !== "string" || !String(r.governedClinicalReasoningSessionId).trim()) return null;
  if (!Array.isArray(r.sessionSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.sessionSlots.map(mapSlot).filter((s): s is GovernedClinicalReasoningSessionSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { governedClinicalReasoningSessionId: String(r.governedClinicalReasoningSessionId).trim(), providerId, sessionSlots: slots, governance: { ...GOVERNED_CLINICAL_REASONING_SESSION_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalReasoningTraceId: String(meta.clinicalReasoningTraceId ?? ""),
      governedReasoningSessionId: String(meta.governedReasoningSessionId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): GovernedClinicalReasoningSessionSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "clinical_reasoning_session_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "clinical_reasoning_session_slot", status: slot.status, slotKey: slot.slotKey };
}
