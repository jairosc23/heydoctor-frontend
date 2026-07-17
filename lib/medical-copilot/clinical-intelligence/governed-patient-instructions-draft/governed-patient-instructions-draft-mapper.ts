import {
  GOVERNED_PATIENT_INSTRUCTIONS_DRAFT_GOVERNANCE,
  type GovernedPatientInstructionsDraftItem,
  type GovernedPatientInstructionsDraftResult,
  type GovernedPatientInstructionsDraftSlotKey,
  type GovernedPatientInstructionsDraftView,
} from "./governed-patient-instructions-draft";

const SLOT_KEYS: GovernedPatientInstructionsDraftSlotKey[] = [
  "medication_instructions_slot",
  "activity_recommendations_slot",
  "diet_recommendations_slot",
  "warning_signs_slot",
  "home_care_slot",
  "followup_instructions_slot",
];

export function mapGovernedPatientInstructionsDraftEnvelope(
  payload: unknown,
): GovernedPatientInstructionsDraftResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.patientInstructionsDraft !== undefined ||
    root.medicalLeaveDraft !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const patientInstructionsDraft = mapInstructionsDraft(
    data.patientInstructionsDraft,
  );
  if (!patientInstructionsDraft) return null;

  return {
    medicalLeaveDraft: data.medicalLeaveDraft ?? null,
    patientInstructionsDraft,
    governance: { ...GOVERNED_PATIENT_INSTRUCTIONS_DRAFT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

function mapInstructionsDraft(
  raw: unknown,
): GovernedPatientInstructionsDraftView | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const itemsRaw = Array.isArray(d.patientInstructionItems)
    ? d.patientInstructionItems
    : [];
  const items = itemsRaw
    .map(mapItem)
    .filter(
      (item): item is GovernedPatientInstructionsDraftItem => item !== null,
    );

  const byKey = new Map(items.map((item) => [item.slotKey, item]));
  const patientInstructionItems = SLOT_KEYS.map(
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
    patientInstructionItems,
    generatedAt:
      typeof d.generatedAt === "string"
        ? d.generatedAt
        : new Date().toISOString(),
  };
}

function mapItem(
  raw: unknown,
): GovernedPatientInstructionsDraftItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (
    item.slotKey !== "medication_instructions_slot" &&
    item.slotKey !== "activity_recommendations_slot" &&
    item.slotKey !== "diet_recommendations_slot" &&
    item.slotKey !== "warning_signs_slot" &&
    item.slotKey !== "home_care_slot" &&
    item.slotKey !== "followup_instructions_slot"
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
