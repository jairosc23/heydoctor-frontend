/**
 * Medication Domain — public API (ADR-020 P0).
 * Implements ADR-020.
 */

export {
  isMedicationOrderBuilderEnabled,
  MEDICATION_ORDER_BUILDER_FLAG,
} from "./flags";

export type {
  CareSetting,
  CatalogEntry,
  DoseAmount,
  DoseFormCode,
  DurationSpec,
  FrequencySpec,
  IssueSnapshot,
  JurisdictionCode,
  MedicationAdministration,
  MedicationDispense,
  MedicationOrder,
  MedicationOrderIntent,
  MedicationOrderLine,
  MedicationOrderStatus,
  MedicationProductRef,
  PosologyRenderBlock,
  QuantitySpec,
  RouteCode,
  StructuredPosology,
  TimingInstructionCode,
} from "./types";

export {
  emptyMedicationOrderLine,
  emptyPosology,
} from "./types";

export {
  durationCodeFromSpec,
  durationSpecFromCode,
  findEntry,
  frequencyCodeFromSpec,
  frequencySpecFromCode,
  getCatalog,
  labelFor,
  DOSE_AMOUNT_PRESETS,
  DOSE_FORMS,
  DOSE_UNITS,
  DURATIONS,
  FREQUENCIES,
  ROUTES,
  TIMING_INSTRUCTIONS,
} from "./catalogs";

export type { CatalogLocale, JurisdictionCatalog } from "./catalogs";

export {
  formatPosologyPreviewText,
  renderPosologyBlocks,
  renderPosologyBlocksFromLine,
} from "./renderers/posology-renderer";

export type { RenderPosologyInput } from "./renderers/posology-renderer";
