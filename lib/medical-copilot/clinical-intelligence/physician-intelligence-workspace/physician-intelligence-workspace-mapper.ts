import { PHYSICIAN_INTELLIGENCE_WORKSPACE_GOVERNANCE, type PhysicianIntelligenceWorkspace, type PhysicianIntelligenceWorkspaceBuilderResult, type PhysicianIntelligenceWorkspaceSlot, type AiLayerProviderId } from "./physician-intelligence-workspace";
export function mapPhysicianIntelligenceWorkspaceEnvelope(payload: unknown): PhysicianIntelligenceWorkspaceBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj = root.source === "physician_intelligence_workspace" ? root : root.physicianIntelligenceWorkspace && typeof root.physicianIntelligenceWorkspace === "object" && (root.physicianIntelligenceWorkspace as { source?: string }).source === "physician_intelligence_workspace" ? (root.physicianIntelligenceWorkspace as Record<string, unknown>) : null;
  if (!resultObj) return null;
  const mapped = mapPhysicianIntelligenceWorkspace(resultObj.physicianIntelligenceWorkspace);
  if (!mapped) return null;
  return { source: "physician_intelligence_workspace", builderVersion: "1.0.0", physicianIntelligenceWorkspace: mapped, governance: { ...PHYSICIAN_INTELLIGENCE_WORKSPACE_GOVERNANCE }, reason: typeof resultObj.reason === "string" ? resultObj.reason : null, generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString() };
}
export function mapPhysicianIntelligenceWorkspace(raw: unknown): PhysicianIntelligenceWorkspace | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.physicianIntelligenceWorkspaceId !== "string" || !String(r.physicianIntelligenceWorkspaceId).trim()) return null;
  if (!Array.isArray(r.workspaceSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.workspaceSlots.map(mapSlot).filter((s): s is PhysicianIntelligenceWorkspaceSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return { physicianIntelligenceWorkspaceId: String(r.physicianIntelligenceWorkspaceId).trim(), providerId, workspaceSlots: slots, governance: { ...PHYSICIAN_INTELLIGENCE_WORKSPACE_GOVERNANCE }, metadata: {
    sessionId: String(meta.sessionId ?? ""), consultationId: String(meta.consultationId ?? ""), patientId: String(meta.patientId ?? ""), planId: String(meta.planId ?? ""),
      clinicalIntelligenceRuntimeId: String(meta.clinicalIntelligenceRuntimeId ?? ""),
      physicianReasoningReviewId: String(meta.physicianReasoningReviewId ?? ""),
    generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(), builderVersion: "1.0.0", status, slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length, selectedProviderId: selected,
  }};
}
function mapSlot(raw: unknown): PhysicianIntelligenceWorkspaceSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "physician_intelligence_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return { id: slot.id.trim(), sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null, order: slot.order, kind: "physician_intelligence_slot", status: slot.status, slotKey: slot.slotKey };
}
