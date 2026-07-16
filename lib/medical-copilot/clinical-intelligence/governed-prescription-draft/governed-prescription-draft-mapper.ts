import {
  GOVERNED_PRESCRIPTION_DRAFT_GOVERNANCE,
  type GovernedPrescriptionDraftItem,
  type GovernedPrescriptionDraftResult,
  type GovernedPrescriptionDraftSlotKey,
  type GovernedPrescriptionDraftView,
} from "./governed-prescription-draft";

const SLOT_KEYS: GovernedPrescriptionDraftSlotKey[] = [
  "medication_slot",
  "dosage_slot",
  "frequency_slot",
  "duration_slot",
  "route_slot",
  "indication_slot",
];

export function mapGovernedPrescriptionDraftEnvelope(
  payload: unknown,
): GovernedPrescriptionDraftResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.prescriptionDraft !== undefined || root.soapDraft !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const prescriptionDraft = mapPrescriptionDraft(data.prescriptionDraft);
  if (!prescriptionDraft) return null;

  return {
    soapDraft: data.soapDraft ?? null,
    prescriptionDraft,
    governance: { ...GOVERNED_PRESCRIPTION_DRAFT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

function mapPrescriptionDraft(raw: unknown): GovernedPrescriptionDraftView | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const itemsRaw = Array.isArray(d.prescriptionItems) ? d.prescriptionItems : [];
  const items = itemsRaw
    .map(mapItem)
    .filter((item): item is GovernedPrescriptionDraftItem => item !== null);

  const byKey = new Map(items.map((item) => [item.slotKey, item]));
  const prescriptionItems = SLOT_KEYS.map(
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
    prescriptionItems,
    generatedAt:
      typeof d.generatedAt === "string"
        ? d.generatedAt
        : new Date().toISOString(),
  };
}

function mapItem(raw: unknown): GovernedPrescriptionDraftItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (
    item.slotKey !== "medication_slot" &&
    item.slotKey !== "dosage_slot" &&
    item.slotKey !== "frequency_slot" &&
    item.slotKey !== "duration_slot" &&
    item.slotKey !== "route_slot" &&
    item.slotKey !== "indication_slot"
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
