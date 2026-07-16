import {
  GOVERNED_ORDERS_DRAFT_GOVERNANCE,
  type GovernedOrdersDraftItem,
  type GovernedOrdersDraftResult,
  type GovernedOrdersDraftSlotKey,
  type GovernedOrdersDraftView,
} from "./governed-orders-draft";

const SLOT_KEYS: GovernedOrdersDraftSlotKey[] = [
  "laboratory_slot",
  "imaging_slot",
  "procedure_slot",
  "referral_slot",
  "monitoring_slot",
  "followup_slot",
];

export function mapGovernedOrdersDraftEnvelope(
  payload: unknown,
): GovernedOrdersDraftResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.ordersDraft !== undefined || root.prescriptionDraft !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const ordersDraft = mapOrdersDraft(data.ordersDraft);
  if (!ordersDraft) return null;

  return {
    prescriptionDraft: data.prescriptionDraft ?? null,
    ordersDraft,
    governance: { ...GOVERNED_ORDERS_DRAFT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

function mapOrdersDraft(raw: unknown): GovernedOrdersDraftView | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const itemsRaw = Array.isArray(d.orderItems) ? d.orderItems : [];
  const items = itemsRaw
    .map(mapItem)
    .filter((item): item is GovernedOrdersDraftItem => item !== null);

  const byKey = new Map(items.map((item) => [item.slotKey, item]));
  const orderItems = SLOT_KEYS.map(
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
    orderItems,
    generatedAt:
      typeof d.generatedAt === "string"
        ? d.generatedAt
        : new Date().toISOString(),
  };
}

function mapItem(raw: unknown): GovernedOrdersDraftItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (
    item.slotKey !== "laboratory_slot" &&
    item.slotKey !== "imaging_slot" &&
    item.slotKey !== "procedure_slot" &&
    item.slotKey !== "referral_slot" &&
    item.slotKey !== "monitoring_slot" &&
    item.slotKey !== "followup_slot"
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
