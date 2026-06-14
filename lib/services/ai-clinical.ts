/**
 * Phase 4.8.3A — re-exporta ClinicalAiFacade™ para compatibilidad de tests y imports legacy.
 * Preferir `lib/clinical-ai-facade` en código nuevo.
 */

export {
  buildAiSyncPatch,
  buildConsultationSummaryRequest,
  requestEnrichedClinicalDocumentation,
  type ConsultationSummaryClientSnapshot,
  type ConsultationSummaryRequest,
  type ConsultationSummaryResponse,
  type EnrichedClinicalDocumentationInput,
} from "../clinical-ai-facade";
