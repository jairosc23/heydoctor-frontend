/**
 * CP-33 — Clinical Intelligence Adapter Foundation (public surface).
 */

export type {
  ClinicalAnalysisActionItem,
  ClinicalAnalysisError,
  ClinicalAnalysisErrorCode,
  ClinicalAnalysisFinding,
  ClinicalAnalysisRequest,
  ClinicalAnalysisResponse,
  ClinicalAnalysisResult,
  ClinicalAnalysisSessionRef,
  ClinicalAnalysisStatus,
} from "./types";

export { CLINICAL_INTELLIGENCE_ADAPTER_VERSION } from "./types";

export {
  mapActionToAnalysisItem,
  mapFacadeSnapshotToAnalysisResponse,
  type FacadeSnapshot,
} from "./mapper";

export {
  ClinicalIntelligenceAdapter,
  clinicalIntelligenceAdapter,
  type ClinicalIntelligenceFacadeClient,
} from "./adapter";

export {
  useClinicalIntelligenceAnalysis,
  type UseClinicalIntelligenceAnalysisOptions,
  type UseClinicalIntelligenceAnalysisResult,
} from "./hooks";

export {
  buildGovernedAnalysisRequest,
  type BuildGovernedAnalysisRequestInput,
} from "./integration";

export { mapGovernedAnalysisToSuggestions } from "./to-suggestions";
