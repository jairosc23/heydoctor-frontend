export type {
  ClinicalOperationsCompletionSlice,
  ClinicalOperationsEncounterSlice,
  ClinicalOperationsSettlementSlice,
  ClinicalOperationsView,
} from "./types";
export { ClinicalOperationsConsistencyError } from "./types";
export {
  defaultClinicalOperationsReadPorts,
  deriveLogicalAsOf,
  loadClinicalOperationsView,
  projectClinicalOperationsView,
} from "./read-model";
export type {
  ClinicalOperationsEncounterRecord,
  ClinicalOperationsReadPorts,
} from "./read-model";
