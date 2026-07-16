import {
  GOVERNED_PATIENT_EDUCATION_DRAFT_GOVERNANCE,
  type GovernedPatientEducationDraftItem,
  type GovernedPatientEducationDraftResult,
  type GovernedPatientEducationDraftSlotKey,
  type GovernedPatientEducationDraftView,
} from "./governed-patient-education-draft";

const SLOT_KEYS: GovernedPatientEducationDraftSlotKey[] = [
  "diagnosis_education_slot",
  "medication_education_slot",
  "lifestyle_education_slot",
  "warning_signs_education_slot",
  "prevention_education_slot",
  "educational_notes_slot",
];

export function mapGovernedPatientEducationDraftEnvelope(
  payload: unknown,
): GovernedPatientEducationDraftResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.patientEducationDraft !== undefined ||
    root.carePlanDraft !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const patientEducationDraft = mapEducationDraft(data.patientEducationDraft);
  if (!patientEducationDraft) return null;

  return {
    carePlanDraft: data.carePlanDraft ?? null,
    patientEducationDraft,
    governance: { ...GOVERNED_PATIENT_EDUCATION_DRAFT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

function mapEducationDraft(
  raw: unknown,
): GovernedPatientEducationDraftView | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const itemsRaw = Array.isArray(d.patientEducationItems)
    ? d.patientEducationItems
    : [];
  const items = itemsRaw
    .map(mapItem)
    .filter((item): item is GovernedPatientEducationDraftItem => item !== null);

  const byKey = new Map(items.map((item) => [item.slotKey, item]));
  const patientEducationItems = SLOT_KEYS.map(
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
    patientEducationItems,
    generatedAt:
      typeof d.generatedAt === "string"
        ? d.generatedAt
        : new Date().toISOString(),
  };
}

function mapItem(raw: unknown): GovernedPatientEducationDraftItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (
    item.slotKey !== "diagnosis_education_slot" &&
    item.slotKey !== "medication_education_slot" &&
    item.slotKey !== "lifestyle_education_slot" &&
    item.slotKey !== "warning_signs_education_slot" &&
    item.slotKey !== "prevention_education_slot" &&
    item.slotKey !== "educational_notes_slot"
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
