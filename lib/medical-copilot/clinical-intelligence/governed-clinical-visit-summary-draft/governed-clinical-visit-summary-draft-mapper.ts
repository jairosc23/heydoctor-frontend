import {
  GOVERNED_CLINICAL_VISIT_SUMMARY_DRAFT_GOVERNANCE,
  type GovernedClinicalVisitSummaryDraftItem,
  type GovernedClinicalVisitSummaryDraftResult,
  type GovernedClinicalVisitSummaryDraftSlotKey,
  type GovernedClinicalVisitSummaryDraftView,
} from "./governed-clinical-visit-summary-draft";

const SLOT_KEYS: GovernedClinicalVisitSummaryDraftSlotKey[] = [
  "consultation_reason_slot",
  "clinical_findings_slot",
  "assessment_reference_slot",
  "performed_actions_slot",
  "follow_up_reference_slot",
  "closing_summary_slot",
];

export function mapGovernedClinicalVisitSummaryDraftEnvelope(
  payload: unknown,
): GovernedClinicalVisitSummaryDraftResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.clinicalVisitSummaryDraft !== undefined ||
    root.followUpDraft !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const clinicalVisitSummaryDraft = mapSummaryDraft(
    data.clinicalVisitSummaryDraft,
  );
  if (!clinicalVisitSummaryDraft) return null;

  return {
    followUpDraft: data.followUpDraft ?? null,
    clinicalVisitSummaryDraft,
    governance: { ...GOVERNED_CLINICAL_VISIT_SUMMARY_DRAFT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

function mapSummaryDraft(
  raw: unknown,
): GovernedClinicalVisitSummaryDraftView | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const itemsRaw = Array.isArray(d.summaryItems) ? d.summaryItems : [];
  const items = itemsRaw
    .map(mapItem)
    .filter(
      (item): item is GovernedClinicalVisitSummaryDraftItem => item !== null,
    );

  const byKey = new Map(items.map((item) => [item.slotKey, item]));
  const summaryItems = SLOT_KEYS.map(
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
    summaryItems,
    generatedAt:
      typeof d.generatedAt === "string"
        ? d.generatedAt
        : new Date().toISOString(),
  };
}

function mapItem(
  raw: unknown,
): GovernedClinicalVisitSummaryDraftItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (
    item.slotKey !== "consultation_reason_slot" &&
    item.slotKey !== "clinical_findings_slot" &&
    item.slotKey !== "assessment_reference_slot" &&
    item.slotKey !== "performed_actions_slot" &&
    item.slotKey !== "follow_up_reference_slot" &&
    item.slotKey !== "closing_summary_slot"
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
