/**
 * Medication Domain — core types (ADR-020).
 * Catalog → Product → Order → Dispense → Administration
 *
 * P0: Catalog vocabularies, Product ref, Order/Line/Posology, Dispense/Admin seams.
 * No string-concatenation semantics.
 */

export type JurisdictionCode = "CL" | "CO" | "US" | "ES";

export type CareSetting =
  | "AMBULATORY"
  | "HOSPITAL"
  | "ED"
  | "HOME"
  | "TELEHEALTH"
  | "MARKETPLACE";

export type MedicationOrderIntent =
  | "ORDER"
  | "PLAN"
  | "PROPOSAL"
  | "REFILL";

export type MedicationOrderStatus =
  | "drafting"
  | "safety_review"
  | "ready_to_issue"
  | "issued"
  | "amended"
  | "cancelled";

/** Controlled vocabulary entry (code + localized labels). */
export type CatalogEntry = {
  code: string;
  labelEs: string;
  labelEn: string;
};

export type DoseFormCode = string;
export type RouteCode = string;
export type TimingInstructionCode = string;

export type DoseAmount = {
  amount: number;
  /** UCUM-ish / clinical unit code (e.g. tablet, mL, drop, puff). */
  unit: string;
  /** Optional form unit label code when amount refers to form pieces. */
  formUnit?: string;
};

export type FrequencySpec =
  | { kind: "EVERY_N_HOURS"; hours: number }
  | { kind: "TIMES_PER_DAY"; times: number }
  | { kind: "EVERY_N_DAYS"; days: number }
  | { kind: "WEEKLY" }
  | { kind: "EVERY_N_WEEKS"; weeks: number }
  | { kind: "MONTHLY" }
  | { kind: "WEEKEND_ONLY" }
  | { kind: "SATURDAY_ONLY" }
  | { kind: "CUSTOM"; code: string };

export type DurationSpec =
  | { kind: "N_DAYS"; days: number }
  | { kind: "N_WEEKS"; weeks: number }
  | { kind: "N_MONTHS"; months: number }
  | { kind: "CONTINUOUS" }
  | { kind: "UNTIL_ORDER" }
  | { kind: "CUSTOM"; code: string };

export type StructuredPosology = {
  dose: DoseAmount | null;
  frequency: FrequencySpec | null;
  duration: DurationSpec | null;
  route: RouteCode | null;
  timingInstructions: TimingInstructionCode[];
  asNeeded?: { conditionCode?: string; conditionLabel?: string; maxPerDay?: number };
};

export type QuantitySpec = {
  amount: number;
  unit: string;
};

export type MedicationProductRef = {
  drugPresentationId?: string;
  displayLabel: string;
  innName?: string;
  strengthDisplay?: string;
  doseForm?: DoseFormCode;
  routeCode?: RouteCode;
  jurisdictionCode?: JurisdictionCode;
};

/** Frozen at issue — immutable clinical snapshot. */
export type IssueSnapshot = MedicationProductRef & {
  posology: StructuredPosology;
  issuedAt: string;
};

export type MedicationOrderLine = {
  id: string;
  product: MedicationProductRef;
  posology: StructuredPosology;
  quantity?: QuantitySpec;
  patientInstructions?: string;
  clinicalNotes?: string;
  substitution?: "ALLOWED" | "NOT_ALLOWED" | "SUBSTANCE_ONLY";
  /** Audited free-text override only — never SSOT. */
  legacyOverride?: string;
};

export type MedicationOrder = {
  id: string;
  version: number;
  status: MedicationOrderStatus;
  careSetting: CareSetting;
  intent: MedicationOrderIntent;
  jurisdictionCode: JurisdictionCode;
  patientId: string;
  encounterId?: string | null;
  lines: MedicationOrderLine[];
  globalNotes?: string;
  issueSnapshotAt?: string;
};

/** Future seam — P3+. */
export type MedicationDispense = {
  id: string;
  orderId: string;
  lineId: string;
  status: "planned" | "completed" | "cancelled";
};

/** Future seam — P3+. */
export type MedicationAdministration = {
  id: string;
  orderId: string;
  lineId: string;
  status: "planned" | "completed" | "not_done" | "cancelled";
};

export type PosologyRenderBlock = {
  key:
    | "medication"
    | "presentation"
    | "dose"
    | "frequency"
    | "duration"
    | "route"
    | "indications"
    | "observations";
  label: string;
  value: string;
};

export function emptyPosology(): StructuredPosology {
  return {
    dose: null,
    frequency: null,
    duration: null,
    route: null,
    timingInstructions: [],
  };
}

export function emptyMedicationOrderLine(
  id: string,
  jurisdictionCode: JurisdictionCode = "CL",
): MedicationOrderLine {
  return {
    id,
    product: { displayLabel: "", jurisdictionCode },
    posology: emptyPosology(),
  };
}
