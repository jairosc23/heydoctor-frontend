export const GOVERNED_ORDERS_DRAFT_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
  draftApproved: false as const,
};

export type GovernedOrdersDraftGovernance =
  typeof GOVERNED_ORDERS_DRAFT_GOVERNANCE;

export type GovernedOrdersDraftSlotKey =
  | "laboratory_slot"
  | "imaging_slot"
  | "procedure_slot"
  | "referral_slot"
  | "monitoring_slot"
  | "followup_slot";

export type GovernedOrdersDraftItem = {
  slotKey: GovernedOrdersDraftSlotKey;
  status: "empty_structural_slot";
  value: null;
  readOnly: true;
  persisted: false;
};

export type GovernedOrdersDraftView = {
  status: "pending_physician_review";
  draftApproved: false;
  readOnly: true;
  persisted: false;
  orderItems: GovernedOrdersDraftItem[];
  generatedAt: string;
};

/** Composite orders draft envelope — empty structural slots only. */
export type GovernedOrdersDraftResult = {
  prescriptionDraft: unknown;
  ordersDraft: GovernedOrdersDraftView;
  governance: GovernedOrdersDraftGovernance;
  reason: string | null;
};
