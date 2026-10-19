import {
  GOVERNED_MEDICAL_LEAVE_DRAFT_GOVERNANCE,
  type GovernedMedicalLeaveDraftItem,
  type GovernedMedicalLeaveDraftResult,
  type GovernedMedicalLeaveDraftSlotKey,
  type GovernedMedicalLeaveDraftView,
} from "./governed-medical-leave-draft";

const SLOT_KEYS: GovernedMedicalLeaveDraftSlotKey[] = [
  "leave_type_slot",
  "diagnosis_reference_slot",
  "start_date_slot",
  "end_date_slot",
  "duration_slot",
  "work_restrictions_slot",
];

export function mapGovernedMedicalLeaveDraftEnvelope(
  payload: unknown,
): GovernedMedicalLeaveDraftResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.medicalLeaveDraft !== undefined ||
    root.medicalCertificateDraft !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const medicalLeaveDraft = mapLeaveDraft(data.medicalLeaveDraft);
  if (!medicalLeaveDraft) return null;

  return {
    medicalCertificateDraft: data.medicalCertificateDraft ?? null,
    medicalLeaveDraft,
    governance: { ...GOVERNED_MEDICAL_LEAVE_DRAFT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

function mapLeaveDraft(raw: unknown): GovernedMedicalLeaveDraftView | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const itemsRaw = Array.isArray(d.medicalLeaveItems)
    ? d.medicalLeaveItems
    : [];
  const items = itemsRaw
    .map(mapItem)
    .filter((item): item is GovernedMedicalLeaveDraftItem => item !== null);

  const byKey = new Map(items.map((item) => [item.slotKey, item]));
  const medicalLeaveItems = SLOT_KEYS.map(
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
    medicalLeaveItems,
    generatedAt:
      typeof d.generatedAt === "string"
        ? d.generatedAt
        : new Date().toISOString(),
  };
}

function mapItem(raw: unknown): GovernedMedicalLeaveDraftItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (
    item.slotKey !== "leave_type_slot" &&
    item.slotKey !== "diagnosis_reference_slot" &&
    item.slotKey !== "start_date_slot" &&
    item.slotKey !== "end_date_slot" &&
    item.slotKey !== "duration_slot" &&
    item.slotKey !== "work_restrictions_slot"
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
