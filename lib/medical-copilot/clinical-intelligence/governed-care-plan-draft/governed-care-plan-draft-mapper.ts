import {
  GOVERNED_CARE_PLAN_DRAFT_GOVERNANCE,
  type GovernedCarePlanDraftItem,
  type GovernedCarePlanDraftResult,
  type GovernedCarePlanDraftSlotKey,
  type GovernedCarePlanDraftView,
} from "./governed-care-plan-draft";

const SLOT_KEYS: GovernedCarePlanDraftSlotKey[] = [
  "primary_goal_slot",
  "secondary_goals_slot",
  "planned_interventions_slot",
  "monitoring_strategy_slot",
  "review_schedule_slot",
  "care_plan_notes_slot",
];

export function mapGovernedCarePlanDraftEnvelope(
  payload: unknown,
): GovernedCarePlanDraftResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const data =
    root.carePlanDraft !== undefined ||
    root.clinicalVisitSummaryDraft !== undefined
      ? root
      : root.data && typeof root.data === "object"
        ? (root.data as Record<string, unknown>)
        : null;
  if (!data) return null;

  const carePlanDraft = mapCarePlanDraft(data.carePlanDraft);
  if (!carePlanDraft) return null;

  return {
    clinicalVisitSummaryDraft: data.clinicalVisitSummaryDraft ?? null,
    carePlanDraft,
    governance: { ...GOVERNED_CARE_PLAN_DRAFT_GOVERNANCE },
    reason: typeof data.reason === "string" ? data.reason : null,
  };
}

function mapCarePlanDraft(raw: unknown): GovernedCarePlanDraftView | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const itemsRaw = Array.isArray(d.carePlanItems) ? d.carePlanItems : [];
  const items = itemsRaw
    .map(mapItem)
    .filter((item): item is GovernedCarePlanDraftItem => item !== null);

  const byKey = new Map(items.map((item) => [item.slotKey, item]));
  const carePlanItems = SLOT_KEYS.map(
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
    carePlanItems,
    generatedAt:
      typeof d.generatedAt === "string"
        ? d.generatedAt
        : new Date().toISOString(),
  };
}

function mapItem(raw: unknown): GovernedCarePlanDraftItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (
    item.slotKey !== "primary_goal_slot" &&
    item.slotKey !== "secondary_goals_slot" &&
    item.slotKey !== "planned_interventions_slot" &&
    item.slotKey !== "monitoring_strategy_slot" &&
    item.slotKey !== "review_schedule_slot" &&
    item.slotKey !== "care_plan_notes_slot"
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
