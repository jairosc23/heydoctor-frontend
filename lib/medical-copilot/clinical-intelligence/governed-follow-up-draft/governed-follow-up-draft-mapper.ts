import {
  GOVERNED_FOLLOW_UP_DRAFT_GOVERNANCE,
  type GovernedFollowUpDraftItem,
  type GovernedFollowUpDraftResult,
  type GovernedFollowUpDraftSlotKey,
  type GovernedFollowUpDraftView,
} from "./governed-follow-up-draft";

const SLOT_KEYS: GovernedFollowUpDraftSlotKey[] = [
  "follow_up_type_slot",
  "recommended_interval_slot",
  "monitoring_items_slot",
  "reevaluation_goals_slot",
  "pending_results_slot",
  "follow_up_notes_slot",
];

export function mapGovernedFollowUpDraftEnvelope(
  payload: unknown,
): GovernedFollowUpDraftResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.followUpDraft !== undefined ||
    root.patientInstructionsDraft !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const followUpDraft = mapFollowUpDraft(data.followUpDraft);
  if (!followUpDraft) return null;

  return {
    patientInstructionsDraft: data.patientInstructionsDraft ?? null,
    followUpDraft,
    governance: { ...GOVERNED_FOLLOW_UP_DRAFT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

function mapFollowUpDraft(raw: unknown): GovernedFollowUpDraftView | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const itemsRaw = Array.isArray(d.followUpItems) ? d.followUpItems : [];
  const items = itemsRaw
    .map(mapItem)
    .filter((item): item is GovernedFollowUpDraftItem => item !== null);

  const byKey = new Map(items.map((item) => [item.slotKey, item]));
  const followUpItems = SLOT_KEYS.map(
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
    followUpItems,
    generatedAt:
      typeof d.generatedAt === "string"
        ? d.generatedAt
        : new Date().toISOString(),
  };
}

function mapItem(raw: unknown): GovernedFollowUpDraftItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (
    item.slotKey !== "follow_up_type_slot" &&
    item.slotKey !== "recommended_interval_slot" &&
    item.slotKey !== "monitoring_items_slot" &&
    item.slotKey !== "reevaluation_goals_slot" &&
    item.slotKey !== "pending_results_slot" &&
    item.slotKey !== "follow_up_notes_slot"
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
