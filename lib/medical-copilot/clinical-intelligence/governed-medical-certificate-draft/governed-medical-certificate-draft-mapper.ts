import {
  GOVERNED_MEDICAL_CERTIFICATE_DRAFT_GOVERNANCE,
  type GovernedMedicalCertificateDraftItem,
  type GovernedMedicalCertificateDraftResult,
  type GovernedMedicalCertificateDraftSlotKey,
  type GovernedMedicalCertificateDraftView,
} from "./governed-medical-certificate-draft";

const SLOT_KEYS: GovernedMedicalCertificateDraftSlotKey[] = [
  "certificate_type_slot",
  "diagnosis_reference_slot",
  "justification_slot",
  "restriction_slot",
  "validity_period_slot",
  "observations_slot",
];

export function mapGovernedMedicalCertificateDraftEnvelope(
  payload: unknown,
): GovernedMedicalCertificateDraftResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.medicalCertificateDraft !== undefined ||
    root.referralDraft !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const medicalCertificateDraft = mapCertificateDraft(
    data.medicalCertificateDraft,
  );
  if (!medicalCertificateDraft) return null;

  return {
    referralDraft: data.referralDraft ?? null,
    medicalCertificateDraft,
    governance: { ...GOVERNED_MEDICAL_CERTIFICATE_DRAFT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

function mapCertificateDraft(
  raw: unknown,
): GovernedMedicalCertificateDraftView | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const itemsRaw = Array.isArray(d.certificateItems) ? d.certificateItems : [];
  const items = itemsRaw
    .map(mapItem)
    .filter(
      (item): item is GovernedMedicalCertificateDraftItem => item !== null,
    );

  const byKey = new Map(items.map((item) => [item.slotKey, item]));
  const certificateItems = SLOT_KEYS.map(
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
    certificateItems,
    generatedAt:
      typeof d.generatedAt === "string"
        ? d.generatedAt
        : new Date().toISOString(),
  };
}

function mapItem(raw: unknown): GovernedMedicalCertificateDraftItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (
    item.slotKey !== "certificate_type_slot" &&
    item.slotKey !== "diagnosis_reference_slot" &&
    item.slotKey !== "justification_slot" &&
    item.slotKey !== "restriction_slot" &&
    item.slotKey !== "validity_period_slot" &&
    item.slotKey !== "observations_slot"
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
