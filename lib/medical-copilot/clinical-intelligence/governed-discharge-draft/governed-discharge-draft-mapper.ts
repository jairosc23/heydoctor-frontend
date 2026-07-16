import {
  GOVERNED_DISCHARGE_DRAFT_GOVERNANCE,
  type GovernedDischargeDraftItem,
  type GovernedDischargeDraftResult,
  type GovernedDischargeDraftSlotKey,
  type GovernedDischargeDraftView,
} from "./governed-discharge-draft";

const SLOT_KEYS: GovernedDischargeDraftSlotKey[] = [
  "discharge_condition_slot",
  "discharge_destination_slot",
  "discharge_medications_slot",
  "discharge_followup_slot",
  "discharge_precautions_slot",
  "discharge_notes_slot",
];

export function mapGovernedDischargeDraftEnvelope(
  payload: unknown,
): GovernedDischargeDraftResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.dischargeDraft !== undefined ||
    root.patientEducationDraft !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const dischargeDraft = mapDischargeDraft(data.dischargeDraft);
  if (!dischargeDraft) return null;

  return {
    patientEducationDraft: data.patientEducationDraft ?? null,
    dischargeDraft,
    governance: { ...GOVERNED_DISCHARGE_DRAFT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

function mapDischargeDraft(raw: unknown): GovernedDischargeDraftView | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const itemsRaw = Array.isArray(d.dischargeItems) ? d.dischargeItems : [];
  const items = itemsRaw
    .map(mapItem)
    .filter((item): item is GovernedDischargeDraftItem => item !== null);

  const byKey = new Map(items.map((item) => [item.slotKey, item]));
  const dischargeItems = SLOT_KEYS.map(
    (slotKey) =>
      byKey.get(slotKey) ?? {
        slotKey,
        status: "empty_structural_slot" as const,
        value: null,
        readOnly: true as const,
        persisted: false as const,
      },
  );

  return {
    status: "pending_physician_review",
    draftApproved: false,
    readOnly: true,
    persisted: false,
    dischargeItems,
    generatedAt:
      typeof d.generatedAt === "string"
        ? d.generatedAt
        : new Date().toISOString(),
  };
}

function mapItem(raw: unknown): GovernedDischargeDraftItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (
    item.slotKey !== "discharge_condition_slot" &&
    item.slotKey !== "discharge_destination_slot" &&
    item.slotKey !== "discharge_medications_slot" &&
    item.slotKey !== "discharge_followup_slot" &&
    item.slotKey !== "discharge_precautions_slot" &&
    item.slotKey !== "discharge_notes_slot"
  ) {
    return null;
  }
  return {
    slotKey: item.slotKey,
    status: "empty_structural_slot",
    value: null,
    readOnly: true,
    persisted: false,
  };
}
