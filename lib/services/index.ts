export * from "./patients";
export * from "./consultations";
export * from "./consultation-diagnosis";
export * from "./diagnosis";
export * from "./diagnosis-preferences";
export * from "./prescriptions";
export * from "./lab-orders";
export * from "./referrals";
export * from "./invoices";
export * from "./clinical-analytics";
export * from "./ai-insights";
export * from "./ai-clinical";
export {
  autofillStructuredRecord,
  buildAiSyncPatch,
  buildConsultationSummaryRequest,
  createClinicalAiRequestId,
  getConsultationAssist,
  getConsultationInsights,
  getInlineNoteSuggestions,
  registerClinicalAiBeforeRequestHook,
  requestEnrichedClinicalDocumentation,
  type ClinicalAiFacadeResult,
  type ClinicalAiOperation,
  type EnrichedClinicalDocumentationInput,
} from "../clinical-ai-facade";
export * from "./clinic";
export * from "./appointments";
export * from "./search";
export * from "./cdss";
export * from "./metrics";
export * from "./webrtc-metrics";
export * from "./consultation-assist";
export * from "./consultation-messages";
export * from "./auth-session";
export * from "./auth";
export * from "./consents";
export * from "./public-consultations";
export * from "./clinical-record";
export * from "./consultation-actions";
export * from "./medical-copilot";

