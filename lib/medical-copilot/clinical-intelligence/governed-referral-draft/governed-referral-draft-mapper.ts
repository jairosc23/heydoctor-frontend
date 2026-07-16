import {
  GOVERNED_REFERRAL_DRAFT_GOVERNANCE,
  type GovernedReferralDraftItem,
  type GovernedReferralDraftResult,
  type GovernedReferralDraftSlotKey,
  type GovernedReferralDraftView,
} from "./governed-referral-draft";

const SLOT_KEYS: GovernedReferralDraftSlotKey[] = [
  "specialty_slot",
  "priority_slot",
  "reason_slot",
  "clinical_summary_slot",
  "attached_documents_slot",
  "destination_slot",
];

export function mapGovernedReferralDraftEnvelope(
  payload: unknown,
): GovernedReferralDraftResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.referralDraft !== undefined || root.ordersDraft !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const referralDraft = mapReferralDraft(data.referralDraft);
  if (!referralDraft) return null;

  return {
    ordersDraft: data.ordersDraft ?? null,
    referralDraft,
    governance: { ...GOVERNED_REFERRAL_DRAFT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

function mapReferralDraft(raw: unknown): GovernedReferralDraftView | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const itemsRaw = Array.isArray(d.referralItems) ? d.referralItems : [];
  const items = itemsRaw
    .map(mapItem)
    .filter((item): item is GovernedReferralDraftItem => item !== null);

  const byKey = new Map(items.map((item) => [item.slotKey, item]));
  const referralItems = SLOT_KEYS.map(
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
    referralItems,
    generatedAt:
      typeof d.generatedAt === "string"
        ? d.generatedAt
        : new Date().toISOString(),
  };
}

function mapItem(raw: unknown): GovernedReferralDraftItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (
    item.slotKey !== "specialty_slot" &&
    item.slotKey !== "priority_slot" &&
    item.slotKey !== "reason_slot" &&
    item.slotKey !== "clinical_summary_slot" &&
    item.slotKey !== "attached_documents_slot" &&
    item.slotKey !== "destination_slot"
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
