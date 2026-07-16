export type {
  GovernedEncounterConsolidationComponentKey,
  GovernedEncounterConsolidationComponentPresence,
  GovernedEncounterConsolidationGovernance,
  GovernedEncounterConsolidationResult,
} from "./governed-encounter-consolidation";
export { GOVERNED_ENCOUNTER_CONSOLIDATION_GOVERNANCE } from "./governed-encounter-consolidation";
export { mapGovernedEncounterConsolidationEnvelope } from "./governed-encounter-consolidation-mapper";
export {
  getGovernedEncounterConsolidation,
  governedEncounterConsolidationReadAdapter,
  type GovernedEncounterConsolidationReadAdapter,
} from "./governed-encounter-consolidation-adapter";
export {
  useGovernedEncounterConsolidation,
  type UseGovernedEncounterConsolidationOptions,
  type UseGovernedEncounterConsolidationResult,
} from "./governed-encounter-consolidation-hooks";
