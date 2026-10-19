"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MedicalCopilotWorkspace } from "@/components/medical-copilot";
import { ClinicalDictationPanel } from "@/components/medical-copilot/ClinicalDictationPanel";
import { ClinicalVoiceSuggestionsPanel } from "@/components/medical-copilot/ClinicalVoiceSuggestionsPanel";
import { ClinicalFeedbackPanel } from "@/components/medical-copilot/ClinicalFeedbackPanel";
import { ClinicalFindingsPanel } from "@/components/medical-copilot/ClinicalFindingsPanel";
import { ClinicalInsightsPanel } from "@/components/medical-copilot/ClinicalInsightsPanel";
import { ClinicalRecommendationsPanel } from "@/components/medical-copilot/ClinicalRecommendationsPanel";
import { ClinicalDecisionSupportPanel } from "@/components/medical-copilot/ClinicalDecisionSupportPanel";
import { ClinicalReasoningPanel } from "@/components/medical-copilot/ClinicalReasoningPanel";
import { ClinicalCopilotSnapshotPanel } from "@/components/medical-copilot/ClinicalCopilotSnapshotPanel";
import { ClinicalReviewPanel } from "@/components/medical-copilot/ClinicalReviewPanel";
import { ClinicalCaseRepresentationPanel } from "@/components/medical-copilot/ClinicalCaseRepresentationPanel";
import { ClinicalContextPanel } from "@/components/medical-copilot/ClinicalContextPanel";
import { ClinicalPlanningPanel } from "@/components/medical-copilot/ClinicalPlanningPanel";
import { GovernedAIRequestPanel } from "@/components/medical-copilot/GovernedAIRequestPanel";
import { AIProviderPanel } from "@/components/medical-copilot/AIProviderPanel";
import { GovernedAIGatewayPanel } from "@/components/medical-copilot/GovernedAIGatewayPanel";
import { OpenAIProviderPanel } from "@/components/medical-copilot/OpenAIProviderPanel";
import { GovernedAIExecutionPanel } from "@/components/medical-copilot/GovernedAIExecutionPanel";
import { GovernedAIClinicalResponsePanel } from "@/components/medical-copilot/GovernedAIClinicalResponsePanel";
import { GovernedAIPromptPanel } from "@/components/medical-copilot/GovernedAIPromptPanel";
import { GovernedPromptTemplatePanel } from "@/components/medical-copilot/GovernedPromptTemplatePanel";
import { GovernedPromptComposerPanel } from "@/components/medical-copilot/GovernedPromptComposerPanel";
import { GovernedProviderPayloadPanel } from "@/components/medical-copilot/GovernedProviderPayloadPanel";
import { GovernedAIInvocationPanel } from "@/components/medical-copilot/GovernedAIInvocationPanel";
import { GovernedAIResponseNormalizerPanel } from "@/components/medical-copilot/GovernedAIResponseNormalizerPanel";
import { GovernedClinicalAIOutputPanel } from "@/components/medical-copilot/GovernedClinicalAIOutputPanel";
import { GovernedPhysicianReviewPrepPanel } from "@/components/medical-copilot/GovernedPhysicianReviewPrepPanel";
import { GovernedWorkflowIntegrationPanel } from "@/components/medical-copilot/GovernedWorkflowIntegrationPanel";
import { GovernedPromptAssemblyPanel } from "@/components/medical-copilot/GovernedPromptAssemblyPanel";
import { GovernedProviderPayloadTranslationPanel } from "@/components/medical-copilot/GovernedProviderPayloadTranslationPanel";
import { GovernedProviderExecutionPanel } from "@/components/medical-copilot/GovernedProviderExecutionPanel";
import { GovernedAIResponseProcessingPanel } from "@/components/medical-copilot/GovernedAIResponseProcessingPanel";
import { GovernedPhysicianReviewExperiencePanel } from "@/components/medical-copilot/GovernedPhysicianReviewExperiencePanel";
import { ClinicalDifferentialFoundationPanel } from "@/components/medical-copilot/ClinicalDifferentialFoundationPanel";
import { EvidenceMappingFoundationPanel } from "@/components/medical-copilot/EvidenceMappingFoundationPanel";
import { ClinicalConfidenceFoundationPanel } from "@/components/medical-copilot/ClinicalConfidenceFoundationPanel";
import { MissingInformationEnginePanel } from "@/components/medical-copilot/MissingInformationEnginePanel";
import { PhysicianDecisionWorkspacePanel } from "@/components/medical-copilot/PhysicianDecisionWorkspacePanel";
import { DiagnosticEvidenceWorkspacePanel } from "@/components/medical-copilot/DiagnosticEvidenceWorkspacePanel";
import { DiagnosticGapAnalyzerPanel } from "@/components/medical-copilot/DiagnosticGapAnalyzerPanel";
import { ClinicalPriorityWorkspacePanel } from "@/components/medical-copilot/ClinicalPriorityWorkspacePanel";
import { PhysicianReviewWorkspaceV2Panel } from "@/components/medical-copilot/PhysicianReviewWorkspaceV2Panel";
import { GovernedClinicalSessionPackagePanel } from "@/components/medical-copilot/GovernedClinicalSessionPackagePanel";
import { ClinicalReviewDatasetFoundationPanel } from "@/components/medical-copilot/ClinicalReviewDatasetFoundationPanel";
import { ReviewChecklistFoundationPanel } from "@/components/medical-copilot/ReviewChecklistFoundationPanel";
import { ClinicalValidationWorkspacePanel } from "@/components/medical-copilot/ClinicalValidationWorkspacePanel";
import { PhysicianReviewSummaryPanel } from "@/components/medical-copilot/PhysicianReviewSummaryPanel";
import { GovernedPhysicianReviewPackagePanel } from "@/components/medical-copilot/GovernedPhysicianReviewPackagePanel";
import { PhysicianReviewChecklistWorkspacePanel } from "@/components/medical-copilot/PhysicianReviewChecklistWorkspacePanel";
import { ClinicalReviewTimelinePanel } from "@/components/medical-copilot/ClinicalReviewTimelinePanel";
import { ClinicalReviewNavigationPanel } from "@/components/medical-copilot/ClinicalReviewNavigationPanel";
import { PhysicianReviewDashboardPanel } from "@/components/medical-copilot/PhysicianReviewDashboardPanel";
import { GovernedReviewSessionPanel } from "@/components/medical-copilot/GovernedReviewSessionPanel";
import { ClinicalQuestionGeneratorPanel } from "@/components/medical-copilot/ClinicalQuestionGeneratorPanel";
import { PhysicianInterviewWorkspacePanel } from "@/components/medical-copilot/PhysicianInterviewWorkspacePanel";
import { ClinicalCompletenessAnalyzerPanel } from "@/components/medical-copilot/ClinicalCompletenessAnalyzerPanel";
import { ClinicalReadinessWorkspacePanel } from "@/components/medical-copilot/ClinicalReadinessWorkspacePanel";
import { GovernedClinicalAssessmentPackagePanel } from "@/components/medical-copilot/GovernedClinicalAssessmentPackagePanel";
import { ClinicalReasoningWorkspacePanel } from "@/components/medical-copilot/ClinicalReasoningWorkspacePanel";
import { DifferentialReviewWorkspacePanel } from "@/components/medical-copilot/DifferentialReviewWorkspacePanel";
import { EvidenceCompletenessWorkspacePanel } from "@/components/medical-copilot/EvidenceCompletenessWorkspacePanel";
import { PhysicianReasoningPreparationPanel } from "@/components/medical-copilot/PhysicianReasoningPreparationPanel";
import { GovernedClinicalReasoningPackagePanel } from "@/components/medical-copilot/GovernedClinicalReasoningPackagePanel";
import { ClinicalReasoningDatasetPanel } from "@/components/medical-copilot/ClinicalReasoningDatasetPanel";
import { EvidenceCorrelationWorkspacePanel } from "@/components/medical-copilot/EvidenceCorrelationWorkspacePanel";
import { ClinicalPatternWorkspacePanel } from "@/components/medical-copilot/ClinicalPatternWorkspacePanel";
import { GovernedReasoningWorkspacePanel } from "@/components/medical-copilot/GovernedReasoningWorkspacePanel";
import { GovernedClinicalReasoningDatasetPanel } from "@/components/medical-copilot/GovernedClinicalReasoningDatasetPanel";
import { ClinicalReasoningContextPanel } from "@/components/medical-copilot/ClinicalReasoningContextPanel";
import { EvidenceGraphWorkspacePanel } from "@/components/medical-copilot/EvidenceGraphWorkspacePanel";
import { ClinicalReasoningInputsPanel } from "@/components/medical-copilot/ClinicalReasoningInputsPanel";
import { GovernedReasoningPreparationPanel } from "@/components/medical-copilot/GovernedReasoningPreparationPanel";
import { GovernedClinicalReasoningInputPackagePanel } from "@/components/medical-copilot/GovernedClinicalReasoningInputPackagePanel";
import { ClinicalReasoningEngineCorePanel } from "@/components/medical-copilot/ClinicalReasoningEngineCorePanel";
import { ReasoningRulePipelinePanel } from "@/components/medical-copilot/ReasoningRulePipelinePanel";
import { ReasoningExecutionContextPanel } from "@/components/medical-copilot/ReasoningExecutionContextPanel";
import { GovernedReasoningRuntimePanel } from "@/components/medical-copilot/GovernedReasoningRuntimePanel";
import { ClinicalReasoningEngineFoundationPanel } from "@/components/medical-copilot/ClinicalReasoningEngineFoundationPanel";
import { ReasoningStageManagerPanel } from "@/components/medical-copilot/ReasoningStageManagerPanel";
import { ReasoningStateMachinePanel } from "@/components/medical-copilot/ReasoningStateMachinePanel";
import { ReasoningValidationEnginePanel } from "@/components/medical-copilot/ReasoningValidationEnginePanel";
import { GovernedReasoningSessionPanel } from "@/components/medical-copilot/GovernedReasoningSessionPanel";
import { ClinicalReasoningRuntimeFoundationPanel } from "@/components/medical-copilot/ClinicalReasoningRuntimeFoundationPanel";
import { ClinicalReasoningPipelinePanel } from "@/components/medical-copilot/ClinicalReasoningPipelinePanel";
import { ClinicalReasoningGraphPanel } from "@/components/medical-copilot/ClinicalReasoningGraphPanel";
import { ClinicalReasoningTracePanel } from "@/components/medical-copilot/ClinicalReasoningTracePanel";
import { GovernedClinicalReasoningSessionPanel } from "@/components/medical-copilot/GovernedClinicalReasoningSessionPanel";
import { ClinicalReasoningPackagePanel } from "@/components/medical-copilot/ClinicalReasoningPackagePanel";
import { ClinicalReasoningOrchestratorPanel } from "@/components/medical-copilot/ClinicalReasoningOrchestratorPanel";
import { DifferentialReasoningEnginePanel } from "@/components/medical-copilot/DifferentialReasoningEnginePanel";
import { EvidenceReasoningEnginePanel } from "@/components/medical-copilot/EvidenceReasoningEnginePanel";
import { ClinicalConsistencyEnginePanel } from "@/components/medical-copilot/ClinicalConsistencyEnginePanel";
import { GovernedReasoningOutputPanel } from "@/components/medical-copilot/GovernedReasoningOutputPanel";
import { ClinicalHypothesisWorkspacePanel } from "@/components/medical-copilot/ClinicalHypothesisWorkspacePanel";
import { EvidenceRankingWorkspacePanel } from "@/components/medical-copilot/EvidenceRankingWorkspacePanel";
import { ReasoningQualityEnginePanel } from "@/components/medical-copilot/ReasoningQualityEnginePanel";
import { PhysicianReasoningReviewPanel } from "@/components/medical-copilot/PhysicianReasoningReviewPanel";
import { GovernedClinicalIntelligencePackagePanel } from "@/components/medical-copilot/GovernedClinicalIntelligencePackagePanel";
import { ClinicalIntelligenceOrchestratorPanel } from "@/components/medical-copilot/ClinicalIntelligenceOrchestratorPanel";
import { ClinicalIntelligenceContextPanel } from "@/components/medical-copilot/ClinicalIntelligenceContextPanel";
import { ClinicalIntelligenceGraphPanel } from "@/components/medical-copilot/ClinicalIntelligenceGraphPanel";
import { ClinicalIntelligenceTracePanel } from "@/components/medical-copilot/ClinicalIntelligenceTracePanel";
import { ClinicalIntelligenceRuntimePanel } from "@/components/medical-copilot/ClinicalIntelligenceRuntimePanel";
import { PhysicianIntelligenceWorkspacePanel } from "@/components/medical-copilot/PhysicianIntelligenceWorkspacePanel";
import { ClinicalIntelligenceValidationPanel } from "@/components/medical-copilot/ClinicalIntelligenceValidationPanel";
import { GovernedClinicalIntelligenceSessionPanel } from "@/components/medical-copilot/GovernedClinicalIntelligenceSessionPanel";
import { ClinicalIntelligenceOutputPanel } from "@/components/medical-copilot/ClinicalIntelligenceOutputPanel";
import { GovernedClinicalIntelligenceFoundationPanel } from "@/components/medical-copilot/GovernedClinicalIntelligenceFoundationPanel";
import { GovernedClinicalIntelligenceFlowPanel } from "@/components/medical-copilot/GovernedClinicalIntelligenceFlowPanel";
import { GovernedClinicalIntelligenceRuntimePanel } from "@/components/medical-copilot/GovernedClinicalIntelligenceRuntimePanel";
import { GovernedClinicalAssistancePanel } from "@/components/medical-copilot/GovernedClinicalAssistancePanel";
import { GovernedClinicalDraftPanel } from "@/components/medical-copilot/GovernedClinicalDraftPanel";
import { GovernedSoapDraftPanel } from "@/components/medical-copilot/GovernedSoapDraftPanel";
import { GovernedPrescriptionDraftPanel } from "@/components/medical-copilot/GovernedPrescriptionDraftPanel";
import { GovernedOrdersDraftPanel } from "@/components/medical-copilot/GovernedOrdersDraftPanel";
import { GovernedReferralDraftPanel } from "@/components/medical-copilot/GovernedReferralDraftPanel";
import { GovernedMedicalCertificateDraftPanel } from "@/components/medical-copilot/GovernedMedicalCertificateDraftPanel";
import { GovernedMedicalLeaveDraftPanel } from "@/components/medical-copilot/GovernedMedicalLeaveDraftPanel";
import { GovernedPatientInstructionsDraftPanel } from "@/components/medical-copilot/GovernedPatientInstructionsDraftPanel";
import { GovernedFollowUpDraftPanel } from "@/components/medical-copilot/GovernedFollowUpDraftPanel";
import { GovernedClinicalVisitSummaryDraftPanel } from "@/components/medical-copilot/GovernedClinicalVisitSummaryDraftPanel";
import { GovernedCarePlanDraftPanel } from "@/components/medical-copilot/GovernedCarePlanDraftPanel";
import { GovernedPatientEducationDraftPanel } from "@/components/medical-copilot/GovernedPatientEducationDraftPanel";
import { GovernedDischargeDraftPanel } from "@/components/medical-copilot/GovernedDischargeDraftPanel";
import { GovernedClinicalDocumentationPackagePanel } from "@/components/medical-copilot/GovernedClinicalDocumentationPackagePanel";
import { GovernedClinicalEncounterPanel } from "@/components/medical-copilot/GovernedClinicalEncounterPanel";
import { GovernedPhysicianWorkspacePanel } from "@/components/medical-copilot/GovernedPhysicianWorkspacePanel";
import { GovernedConsultationRuntimePanel } from "@/components/medical-copilot/GovernedConsultationRuntimePanel";
import { GovernedConsultationSnapshotPanel } from "@/components/medical-copilot/GovernedConsultationSnapshotPanel";
import { GovernedConsultationReviewPanel } from "@/components/medical-copilot/GovernedConsultationReviewPanel";
import { GovernedConsultationWorkspacePanel } from "@/components/medical-copilot/GovernedConsultationWorkspacePanel";
import { GovernedEncounterWorkspacePanel } from "@/components/medical-copilot/GovernedEncounterWorkspacePanel";
import { GovernedEncounterReviewPanel } from "@/components/medical-copilot/GovernedEncounterReviewPanel";
import { GovernedEncounterSnapshotPanel } from "@/components/medical-copilot/GovernedEncounterSnapshotPanel";
import { GovernedEncounterConsolidationPanel } from "@/components/medical-copilot/GovernedEncounterConsolidationPanel";
import { GovernedConsultationPackagePanel } from "@/components/medical-copilot/GovernedConsultationPackagePanel";
import { GovernedClinicalWorkspacePanel } from "@/components/medical-copilot/GovernedClinicalWorkspacePanel";
import { GovernedClinicalWorkspaceReviewPanel } from "@/components/medical-copilot/GovernedClinicalWorkspaceReviewPanel";
import { GovernedClinicalWorkspaceSnapshotPanel } from "@/components/medical-copilot/GovernedClinicalWorkspaceSnapshotPanel";
import { GovernedClinicalWorkspaceConsolidationPanel } from "@/components/medical-copilot/GovernedClinicalWorkspaceConsolidationPanel";
import { GovernedConsultationDashboardPanel } from "@/components/medical-copilot/GovernedConsultationDashboardPanel";
import { GovernedPhysicianDashboardPanel } from "@/components/medical-copilot/GovernedPhysicianDashboardPanel";
import { GovernedClinicalDashboardPanel } from "@/components/medical-copilot/GovernedClinicalDashboardPanel";
import { GovernedClinicalSessionDashboardPanel } from "@/components/medical-copilot/GovernedClinicalSessionDashboardPanel";
import { GovernedClinicalOverviewPanel } from "@/components/medical-copilot/GovernedClinicalOverviewPanel";
import { GovernedClinicalWorkspacePackagePanel } from "@/components/medical-copilot/GovernedClinicalWorkspacePackagePanel";
import { GovernedClinicalHomePanel } from "@/components/medical-copilot/GovernedClinicalHomePanel";
import { GovernedPhysicianHomePanel } from "@/components/medical-copilot/GovernedPhysicianHomePanel";
import { GovernedConsultationHomePanel } from "@/components/medical-copilot/GovernedConsultationHomePanel";
import { GovernedClinicalTimelinePanel } from "@/components/medical-copilot/GovernedClinicalTimelinePanel";
import { GovernedEncounterTimelinePanel } from "@/components/medical-copilot/GovernedEncounterTimelinePanel";
import { GovernedClinicalNavigationPanel } from "@/components/medical-copilot/GovernedClinicalNavigationPanel";
import { GovernedClinicalExperiencePanel } from "@/components/medical-copilot/GovernedClinicalExperiencePanel";
import { GovernedPhysicianExperiencePanel } from "@/components/medical-copilot/GovernedPhysicianExperiencePanel";
import { GovernedConsultationExperiencePanel } from "@/components/medical-copilot/GovernedConsultationExperiencePanel";
import { GovernedClinicalExperiencePackagePanel } from "@/components/medical-copilot/GovernedClinicalExperiencePackagePanel";
import { GovernedPhysicianInteractionWorkspacePanel } from "@/components/medical-copilot/GovernedPhysicianInteractionWorkspacePanel";
import { GovernedDraftReviewWorkspacePanel } from "@/components/medical-copilot/GovernedDraftReviewWorkspacePanel";
import { GovernedDraftComparisonWorkspacePanel } from "@/components/medical-copilot/GovernedDraftComparisonWorkspacePanel";
import { GovernedValidationWorkspacePanel } from "@/components/medical-copilot/GovernedValidationWorkspacePanel";
import { GovernedApprovalPreviewPanel } from "@/components/medical-copilot/GovernedApprovalPreviewPanel";
import { GovernedApprovalQueuePanel } from "@/components/medical-copilot/GovernedApprovalQueuePanel";
import { GovernedPendingActionsPanel } from "@/components/medical-copilot/GovernedPendingActionsPanel";
import { GovernedClinicalReviewPackagePanel } from "@/components/medical-copilot/GovernedClinicalReviewPackagePanel";
import { GovernedPhysicianSessionPanel } from "@/components/medical-copilot/GovernedPhysicianSessionPanel";
import { GovernedPhysicianRuntimePackagePanel } from "@/components/medical-copilot/GovernedPhysicianRuntimePackagePanel";
import { GovernedClinicalActivationWorkspacePanel } from "@/components/medical-copilot/GovernedClinicalActivationWorkspacePanel";
import { GovernedClinicalActivationReviewPanel } from "@/components/medical-copilot/GovernedClinicalActivationReviewPanel";
import { GovernedClinicalActivationTimelinePanel } from "@/components/medical-copilot/GovernedClinicalActivationTimelinePanel";
import { GovernedClinicalActivationNavigationPanel } from "@/components/medical-copilot/GovernedClinicalActivationNavigationPanel";
import { GovernedPhysicianActivationWorkspacePanel } from "@/components/medical-copilot/GovernedPhysicianActivationWorkspacePanel";
import { GovernedConsultationActivationWorkspacePanel } from "@/components/medical-copilot/GovernedConsultationActivationWorkspacePanel";
import { GovernedClinicalActivationDashboardPanel } from "@/components/medical-copilot/GovernedClinicalActivationDashboardPanel";
import { GovernedClinicalActivationSessionPanel } from "@/components/medical-copilot/GovernedClinicalActivationSessionPanel";
import { GovernedClinicalActivationRuntimePanel } from "@/components/medical-copilot/GovernedClinicalActivationRuntimePanel";
import { GovernedClinicalActivationPackagePanel } from "@/components/medical-copilot/GovernedClinicalActivationPackagePanel";
import { GovernedPersistencePreparationWorkspacePanel } from "@/components/medical-copilot/GovernedPersistencePreparationWorkspacePanel";
import { GovernedPersistenceReviewPanel } from "@/components/medical-copilot/GovernedPersistenceReviewPanel";
import { GovernedPersistenceTimelinePanel } from "@/components/medical-copilot/GovernedPersistenceTimelinePanel";
import { GovernedPersistenceNavigationPanel } from "@/components/medical-copilot/GovernedPersistenceNavigationPanel";
import { GovernedPersistenceDashboardPanel } from "@/components/medical-copilot/GovernedPersistenceDashboardPanel";
import { GovernedPersistenceSessionPanel } from "@/components/medical-copilot/GovernedPersistenceSessionPanel";
import { GovernedPersistenceRuntimePanel } from "@/components/medical-copilot/GovernedPersistenceRuntimePanel";
import { GovernedPersistencePreviewPanel } from "@/components/medical-copilot/GovernedPersistencePreviewPanel";
import { GovernedPersistenceValidationPanel } from "@/components/medical-copilot/GovernedPersistenceValidationPanel";
import { GovernedPersistencePackagePanel } from "@/components/medical-copilot/GovernedPersistencePackagePanel";
import { GovernedPersistenceReadinessWorkspacePanel } from "@/components/medical-copilot/GovernedPersistenceReadinessWorkspacePanel";
import { GovernedPersistenceReadinessReviewPanel } from "@/components/medical-copilot/GovernedPersistenceReadinessReviewPanel";
import { GovernedPersistenceReadinessTimelinePanel } from "@/components/medical-copilot/GovernedPersistenceReadinessTimelinePanel";
import { GovernedPersistenceReadinessDashboardPanel } from "@/components/medical-copilot/GovernedPersistenceReadinessDashboardPanel";
import { GovernedPersistenceReadinessSessionPanel } from "@/components/medical-copilot/GovernedPersistenceReadinessSessionPanel";
import { GovernedPersistenceReadinessRuntimePanel } from "@/components/medical-copilot/GovernedPersistenceReadinessRuntimePanel";
import { GovernedPersistenceReadinessPreviewPanel } from "@/components/medical-copilot/GovernedPersistenceReadinessPreviewPanel";
import { GovernedPersistenceReadinessValidationPanel } from "@/components/medical-copilot/GovernedPersistenceReadinessValidationPanel";
import { GovernedPersistenceReadinessConsolidationPanel } from "@/components/medical-copilot/GovernedPersistenceReadinessConsolidationPanel";
import { GovernedPersistenceReadinessPackagePanel } from "@/components/medical-copilot/GovernedPersistenceReadinessPackagePanel";
import { GovernedClinicalPersistenceInfrastructurePanel } from "@/components/medical-copilot/GovernedClinicalPersistenceInfrastructurePanel";
import { GovernedClinicalPersistenceRuntimeStatePanel } from "@/components/medical-copilot/GovernedClinicalPersistenceRuntimeStatePanel";
import { GovernedClinicalRepositoryRuntimePanel } from "@/components/medical-copilot/GovernedClinicalRepositoryRuntimePanel";
import { GovernedClinicalRepositoryWiringPanel } from "@/components/medical-copilot/GovernedClinicalRepositoryWiringPanel";
import { GovernedClinicalValidationPanel } from "@/components/medical-copilot/GovernedClinicalValidationPanel";
import { GovernedClinicalExecutionPreparationPanel } from "@/components/medical-copilot/GovernedClinicalExecutionPreparationPanel";
import { GovernedClinicalRepositoryDiscoveryPanel } from "@/components/medical-copilot/GovernedClinicalRepositoryDiscoveryPanel";
import { GovernedClinicalEntityMappingPanel } from "@/components/medical-copilot/GovernedClinicalEntityMappingPanel";
import { GovernedClinicalPersistenceOrchestratorPanel } from "@/components/medical-copilot/GovernedClinicalPersistenceOrchestratorPanel";
import { GovernedClinicalPersistenceReadinessPanel } from "@/components/medical-copilot/GovernedClinicalPersistenceReadinessPanel";
import { GovernedConsultationPersistenceBridgePanel } from "@/components/medical-copilot/GovernedConsultationPersistenceBridgePanel";
import { GovernedSoapPersistenceBridgePanel } from "@/components/medical-copilot/GovernedSoapPersistenceBridgePanel";
import { GovernedPrescriptionPersistenceBridgePanel } from "@/components/medical-copilot/GovernedPrescriptionPersistenceBridgePanel";
import { GovernedOrdersPersistenceBridgePanel } from "@/components/medical-copilot/GovernedOrdersPersistenceBridgePanel";
import { GovernedReferralPersistenceBridgePanel } from "@/components/medical-copilot/GovernedReferralPersistenceBridgePanel";
import { GovernedClinicalDocumentsPersistenceBridgePanel } from "@/components/medical-copilot/GovernedClinicalDocumentsPersistenceBridgePanel";
import { GovernedConsultationPersistenceExecutionPanel } from "@/components/medical-copilot/GovernedConsultationPersistenceExecutionPanel";
import { GovernedSoapPersistenceExecutionPanel } from "@/components/medical-copilot/GovernedSoapPersistenceExecutionPanel";
import { GovernedPrescriptionPersistenceExecutionPanel } from "@/components/medical-copilot/GovernedPrescriptionPersistenceExecutionPanel";
import { GovernedOrdersPersistenceExecutionPanel } from "@/components/medical-copilot/GovernedOrdersPersistenceExecutionPanel";
import { GovernedReferralPersistenceExecutionPanel } from "@/components/medical-copilot/GovernedReferralPersistenceExecutionPanel";
import { GovernedClinicalDocumentsPersistenceExecutionPanel } from "@/components/medical-copilot/GovernedClinicalDocumentsPersistenceExecutionPanel";
import { GovernedClinicalSuggestionRuntimePanel } from "@/components/medical-copilot/GovernedClinicalSuggestionRuntimePanel";
import { GovernedDifferentialDiagnosisSuggestionPanel } from "@/components/medical-copilot/GovernedDifferentialDiagnosisSuggestionPanel";
import { GovernedClinicalAssessmentSuggestionPanel } from "@/components/medical-copilot/GovernedClinicalAssessmentSuggestionPanel";
import { GovernedTreatmentSuggestionPanel } from "@/components/medical-copilot/GovernedTreatmentSuggestionPanel";
import { GovernedMedicationSuggestionPanel } from "@/components/medical-copilot/GovernedMedicationSuggestionPanel";
import { GovernedOrdersSuggestionPanel } from "@/components/medical-copilot/GovernedOrdersSuggestionPanel";
import { GovernedReferralSuggestionPanel } from "@/components/medical-copilot/GovernedReferralSuggestionPanel";
import { GovernedFollowUpSuggestionPanel } from "@/components/medical-copilot/GovernedFollowUpSuggestionPanel";
import { GovernedPatientEducationSuggestionPanel } from "@/components/medical-copilot/GovernedPatientEducationSuggestionPanel";
import { GovernedClinicalRecommendationPackagePanel } from "@/components/medical-copilot/GovernedClinicalRecommendationPackagePanel";
import { GovernedClinicalEvidenceRuntimePanel } from "@/components/medical-copilot/GovernedClinicalEvidenceRuntimePanel";
import { GovernedEvidenceMappingPanel } from "@/components/medical-copilot/GovernedEvidenceMappingPanel";
import { GovernedEvidenceTracePanel } from "@/components/medical-copilot/GovernedEvidenceTracePanel";
import { GovernedEvidenceConfidencePanel } from "@/components/medical-copilot/GovernedEvidenceConfidencePanel";
import { GovernedClinicalExplainabilityPanel } from "@/components/medical-copilot/GovernedClinicalExplainabilityPanel";
import { GovernedClinicalJustificationPanel } from "@/components/medical-copilot/GovernedClinicalJustificationPanel";
import { GovernedPhysicianDecisionSupportPanel } from "@/components/medical-copilot/GovernedPhysicianDecisionSupportPanel";
import { GovernedClinicalSafetyChecksPanel } from "@/components/medical-copilot/GovernedClinicalSafetyChecksPanel";
import { GovernedRecommendationValidationPanel } from "@/components/medical-copilot/GovernedRecommendationValidationPanel";
import { GovernedClinicalDecisionPackagePanel } from "@/components/medical-copilot/GovernedClinicalDecisionPackagePanel";
import { GovernedDrugInteractionAnalysisPanel } from "@/components/medical-copilot/GovernedDrugInteractionAnalysisPanel";
import { GovernedAllergyCrossCheckPanel } from "@/components/medical-copilot/GovernedAllergyCrossCheckPanel";
import { GovernedContraindicationAnalysisPanel } from "@/components/medical-copilot/GovernedContraindicationAnalysisPanel";
import { GovernedClinicalRiskDetectionPanel } from "@/components/medical-copilot/GovernedClinicalRiskDetectionPanel";
import { GovernedPreventiveCareSuggestionsPanel } from "@/components/medical-copilot/GovernedPreventiveCareSuggestionsPanel";
import { GovernedPreventiveScreeningSuggestionsPanel } from "@/components/medical-copilot/GovernedPreventiveScreeningSuggestionsPanel";
import { GovernedVaccinationReviewPanel } from "@/components/medical-copilot/GovernedVaccinationReviewPanel";
import { GovernedChronicDiseaseFollowUpAnalysisPanel } from "@/components/medical-copilot/GovernedChronicDiseaseFollowUpAnalysisPanel";
import { GovernedClinicalAlertCenterPanel } from "@/components/medical-copilot/GovernedClinicalAlertCenterPanel";
import { GovernedClinicalFunctionalIntelligencePackagePanel } from "@/components/medical-copilot/GovernedClinicalFunctionalIntelligencePackagePanel";
import { GovernedCardiovascularRiskEnginePanel } from "@/components/medical-copilot/GovernedCardiovascularRiskEnginePanel";
import { GovernedDiabetesCareEnginePanel } from "@/components/medical-copilot/GovernedDiabetesCareEnginePanel";
import { GovernedHypertensionManagementEnginePanel } from "@/components/medical-copilot/GovernedHypertensionManagementEnginePanel";
import { GovernedRenalRiskEnginePanel } from "@/components/medical-copilot/GovernedRenalRiskEnginePanel";
import { GovernedPolypharmacyAnalysisEnginePanel } from "@/components/medical-copilot/GovernedPolypharmacyAnalysisEnginePanel";
import { GovernedPreventiveHealthEnginePanel } from "@/components/medical-copilot/GovernedPreventiveHealthEnginePanel";
import { GovernedGeriatricAssessmentEnginePanel } from "@/components/medical-copilot/GovernedGeriatricAssessmentEnginePanel";
import { GovernedPediatricSafetyEnginePanel } from "@/components/medical-copilot/GovernedPediatricSafetyEnginePanel";
import { GovernedWomensHealthReviewEnginePanel } from "@/components/medical-copilot/GovernedWomensHealthReviewEnginePanel";
import { GovernedSpecializedClinicalIntelligencePackagePanel } from "@/components/medical-copilot/GovernedSpecializedClinicalIntelligencePackagePanel";
import { GovernedClinicalRuleEngineRuntimePanel } from "@/components/medical-copilot/GovernedClinicalRuleEngineRuntimePanel";
import { GovernedDrugInteractionRuleEnginePanel } from "@/components/medical-copilot/GovernedDrugInteractionRuleEnginePanel";
import { GovernedAllergyRuleEnginePanel } from "@/components/medical-copilot/GovernedAllergyRuleEnginePanel";
import { GovernedContraindicationRuleEnginePanel } from "@/components/medical-copilot/GovernedContraindicationRuleEnginePanel";
import { GovernedClinicalRiskRuleEnginePanel } from "@/components/medical-copilot/GovernedClinicalRiskRuleEnginePanel";
import { GovernedPreventiveCareRuleEnginePanel } from "@/components/medical-copilot/GovernedPreventiveCareRuleEnginePanel";
import { GovernedVaccinationRuleEnginePanel } from "@/components/medical-copilot/GovernedVaccinationRuleEnginePanel";
import { GovernedChronicDiseaseRuleEnginePanel } from "@/components/medical-copilot/GovernedChronicDiseaseRuleEnginePanel";
import { GovernedClinicalAlertRuleEnginePanel } from "@/components/medical-copilot/GovernedClinicalAlertRuleEnginePanel";
import { GovernedDeterministicClinicalRulesPackagePanel } from "@/components/medical-copilot/GovernedDeterministicClinicalRulesPackagePanel";
import { GovernedClinicalIntakeStagePanel } from "@/components/medical-copilot/GovernedClinicalIntakeStagePanel";
import { GovernedClinicalContextStagePanel } from "@/components/medical-copilot/GovernedClinicalContextStagePanel";
import { GovernedEvidenceAggregationStagePanel } from "@/components/medical-copilot/GovernedEvidenceAggregationStagePanel";
import { GovernedRulesEvaluationStagePanel } from "@/components/medical-copilot/GovernedRulesEvaluationStagePanel";
import { GovernedSuggestionsAggregationStagePanel } from "@/components/medical-copilot/GovernedSuggestionsAggregationStagePanel";
import { GovernedDecisionSupportStagePanel } from "@/components/medical-copilot/GovernedDecisionSupportStagePanel";
import { GovernedClinicalIntelligenceStagePanel } from "@/components/medical-copilot/GovernedClinicalIntelligenceStagePanel";
import { GovernedClinicalSummaryStagePanel } from "@/components/medical-copilot/GovernedClinicalSummaryStagePanel";
import { GovernedPhysicianReviewStagePanel } from "@/components/medical-copilot/GovernedPhysicianReviewStagePanel";
import { GovernedClinicalReasoningPipelinePanel } from "@/components/medical-copilot/GovernedClinicalReasoningPipelinePanel";
import { GovernedDiseaseKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedDiseaseKnowledgeEnginePanel";
import { GovernedMedicationKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedMedicationKnowledgeEnginePanel";
import { GovernedLaboratoryKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedLaboratoryKnowledgeEnginePanel";
import { GovernedImagingKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedImagingKnowledgeEnginePanel";
import { GovernedProcedureKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedProcedureKnowledgeEnginePanel";
import { GovernedVaccineKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedVaccineKnowledgeEnginePanel";
import { GovernedPreventiveMedicineKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedPreventiveMedicineKnowledgeEnginePanel";
import { GovernedClinicalGuidelinesKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedClinicalGuidelinesKnowledgeEnginePanel";
import { GovernedDiagnosticCriteriaKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticCriteriaKnowledgeEnginePanel";
import { GovernedDifferentialDiagnosisKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedDifferentialDiagnosisKnowledgeEnginePanel";
import { GovernedDrugMonographKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedDrugMonographKnowledgeEnginePanel";
import { GovernedDrugInteractionKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedDrugInteractionKnowledgeEnginePanel";
import { GovernedContraindicationKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedContraindicationKnowledgeEnginePanel";
import { GovernedAllergyKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedAllergyKnowledgeEnginePanel";
import { GovernedRedFlagKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedRedFlagKnowledgeEnginePanel";
import { GovernedClinicalScaleKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedClinicalScaleKnowledgeEnginePanel";
import { GovernedRiskScoreKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedRiskScoreKnowledgeEnginePanel";
import { GovernedChronicDiseaseKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedChronicDiseaseKnowledgeEnginePanel";
import { GovernedWomensHealthKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedWomensHealthKnowledgeEnginePanel";
import { GovernedPediatricsKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedPediatricsKnowledgeEnginePanel";
import { GovernedGeriatricsKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedGeriatricsKnowledgeEnginePanel";
import { GovernedMentalHealthKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedMentalHealthKnowledgeEnginePanel";
import { GovernedEmergencyMedicineKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedEmergencyMedicineKnowledgeEnginePanel";
import { GovernedPublicHealthKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedPublicHealthKnowledgeEnginePanel";
import { GovernedPreventiveScreeningKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedPreventiveScreeningKnowledgeEnginePanel";
import { GovernedLifestyleMedicineKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedLifestyleMedicineKnowledgeEnginePanel";
import { GovernedNutritionKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedNutritionKnowledgeEnginePanel";
import { GovernedFollowUpKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedFollowUpKnowledgeEnginePanel";
import { GovernedCarePathwayKnowledgeEnginePanel } from "@/components/medical-copilot/GovernedCarePathwayKnowledgeEnginePanel";
import { GovernedClinicalKnowledgePackagePanel } from "@/components/medical-copilot/GovernedClinicalKnowledgePackagePanel";
import { GovernedEvidenceSourceEnginePanel } from "@/components/medical-copilot/GovernedEvidenceSourceEnginePanel";
import { GovernedEvidenceHierarchyEnginePanel } from "@/components/medical-copilot/GovernedEvidenceHierarchyEnginePanel";
import { GovernedEvidenceLevelEnginePanel } from "@/components/medical-copilot/GovernedEvidenceLevelEnginePanel";
import { GovernedEvidenceQualityEnginePanel } from "@/components/medical-copilot/GovernedEvidenceQualityEnginePanel";
import { GovernedEvidenceConfidenceEnginePanel } from "@/components/medical-copilot/GovernedEvidenceConfidenceEnginePanel";
import { GovernedEvidenceRecommendationStrengthEnginePanel } from "@/components/medical-copilot/GovernedEvidenceRecommendationStrengthEnginePanel";
import { GovernedClinicalGuidelineEvidenceEnginePanel } from "@/components/medical-copilot/GovernedClinicalGuidelineEvidenceEnginePanel";
import { GovernedSystematicReviewEvidenceEnginePanel } from "@/components/medical-copilot/GovernedSystematicReviewEvidenceEnginePanel";
import { GovernedMetaAnalysisEvidenceEnginePanel } from "@/components/medical-copilot/GovernedMetaAnalysisEvidenceEnginePanel";
import { GovernedRandomizedTrialEvidenceEnginePanel } from "@/components/medical-copilot/GovernedRandomizedTrialEvidenceEnginePanel";
import { GovernedObservationalStudyEvidenceEnginePanel } from "@/components/medical-copilot/GovernedObservationalStudyEvidenceEnginePanel";
import { GovernedCaseSeriesEvidenceEnginePanel } from "@/components/medical-copilot/GovernedCaseSeriesEvidenceEnginePanel";
import { GovernedExpertConsensusEvidenceEnginePanel } from "@/components/medical-copilot/GovernedExpertConsensusEvidenceEnginePanel";
import { GovernedClinicalProtocolEvidenceEnginePanel } from "@/components/medical-copilot/GovernedClinicalProtocolEvidenceEnginePanel";
import { GovernedSocietyRecommendationEnginePanel } from "@/components/medical-copilot/GovernedSocietyRecommendationEnginePanel";
import { GovernedUspstfEvidenceEnginePanel } from "@/components/medical-copilot/GovernedUspstfEvidenceEnginePanel";
import { GovernedNiceEvidenceEnginePanel } from "@/components/medical-copilot/GovernedNiceEvidenceEnginePanel";
import { GovernedAhaEvidenceEnginePanel } from "@/components/medical-copilot/GovernedAhaEvidenceEnginePanel";
import { GovernedEscEvidenceEnginePanel } from "@/components/medical-copilot/GovernedEscEvidenceEnginePanel";
import { GovernedAdaEvidenceEnginePanel } from "@/components/medical-copilot/GovernedAdaEvidenceEnginePanel";
import { GovernedKdigoEvidenceEnginePanel } from "@/components/medical-copilot/GovernedKdigoEvidenceEnginePanel";
import { GovernedGinaEvidenceEnginePanel } from "@/components/medical-copilot/GovernedGinaEvidenceEnginePanel";
import { GovernedGoldEvidenceEnginePanel } from "@/components/medical-copilot/GovernedGoldEvidenceEnginePanel";
import { GovernedWhoEvidenceEnginePanel } from "@/components/medical-copilot/GovernedWhoEvidenceEnginePanel";
import { GovernedCdcEvidenceEnginePanel } from "@/components/medical-copilot/GovernedCdcEvidenceEnginePanel";
import { GovernedEvidenceTraceabilityEnginePanel } from "@/components/medical-copilot/GovernedEvidenceTraceabilityEnginePanel";
import { GovernedEvidenceVersioningEnginePanel } from "@/components/medical-copilot/GovernedEvidenceVersioningEnginePanel";
import { GovernedEvidenceProvenanceEnginePanel } from "@/components/medical-copilot/GovernedEvidenceProvenanceEnginePanel";
import { GovernedEvidenceConsistencyEnginePanel } from "@/components/medical-copilot/GovernedEvidenceConsistencyEnginePanel";
import { GovernedClinicalEvidenceEnginePackagePanel } from "@/components/medical-copilot/GovernedClinicalEvidenceEnginePackagePanel";
import { GovernedGuidelineRuntimeEnginePanel } from "@/components/medical-copilot/GovernedGuidelineRuntimeEnginePanel";
import { GovernedAdaGuidelineEnginePanel } from "@/components/medical-copilot/GovernedAdaGuidelineEnginePanel";
import { GovernedAhaGuidelineEnginePanel } from "@/components/medical-copilot/GovernedAhaGuidelineEnginePanel";
import { GovernedAccGuidelineEnginePanel } from "@/components/medical-copilot/GovernedAccGuidelineEnginePanel";
import { GovernedEscGuidelineEnginePanel } from "@/components/medical-copilot/GovernedEscGuidelineEnginePanel";
import { GovernedKdigoGuidelineEnginePanel } from "@/components/medical-copilot/GovernedKdigoGuidelineEnginePanel";
import { GovernedGinaGuidelineEnginePanel } from "@/components/medical-copilot/GovernedGinaGuidelineEnginePanel";
import { GovernedGoldGuidelineEnginePanel } from "@/components/medical-copilot/GovernedGoldGuidelineEnginePanel";
import { GovernedWhoGuidelineEnginePanel } from "@/components/medical-copilot/GovernedWhoGuidelineEnginePanel";
import { GovernedCdcGuidelineEnginePanel } from "@/components/medical-copilot/GovernedCdcGuidelineEnginePanel";
import { GovernedUspstfGuidelineEnginePanel } from "@/components/medical-copilot/GovernedUspstfGuidelineEnginePanel";
import { GovernedNiceGuidelineEnginePanel } from "@/components/medical-copilot/GovernedNiceGuidelineEnginePanel";
import { GovernedAapGuidelineEnginePanel } from "@/components/medical-copilot/GovernedAapGuidelineEnginePanel";
import { GovernedAcogGuidelineEnginePanel } from "@/components/medical-copilot/GovernedAcogGuidelineEnginePanel";
import { GovernedIdsaGuidelineEnginePanel } from "@/components/medical-copilot/GovernedIdsaGuidelineEnginePanel";
import { GovernedAscoGuidelineEnginePanel } from "@/components/medical-copilot/GovernedAscoGuidelineEnginePanel";
import { GovernedSurvivingSepsisGuidelineEnginePanel } from "@/components/medical-copilot/GovernedSurvivingSepsisGuidelineEnginePanel";
import { GovernedHypertensionGuidelineEnginePanel } from "@/components/medical-copilot/GovernedHypertensionGuidelineEnginePanel";
import { GovernedDiabetesGuidelineEnginePanel } from "@/components/medical-copilot/GovernedDiabetesGuidelineEnginePanel";
import { GovernedHeartFailureGuidelineEnginePanel } from "@/components/medical-copilot/GovernedHeartFailureGuidelineEnginePanel";
import { GovernedCopdGuidelineEnginePanel } from "@/components/medical-copilot/GovernedCopdGuidelineEnginePanel";
import { GovernedAsthmaGuidelineEnginePanel } from "@/components/medical-copilot/GovernedAsthmaGuidelineEnginePanel";
import { GovernedCkdGuidelineEnginePanel } from "@/components/medical-copilot/GovernedCkdGuidelineEnginePanel";
import { GovernedPreventiveGuidelineEnginePanel } from "@/components/medical-copilot/GovernedPreventiveGuidelineEnginePanel";
import { GovernedVaccinationGuidelineEnginePanel } from "@/components/medical-copilot/GovernedVaccinationGuidelineEnginePanel";
import { GovernedGuidelineVersionEnginePanel } from "@/components/medical-copilot/GovernedGuidelineVersionEnginePanel";
import { GovernedGuidelineTraceabilityEnginePanel } from "@/components/medical-copilot/GovernedGuidelineTraceabilityEnginePanel";
import { GovernedGuidelineConflictResolutionEnginePanel } from "@/components/medical-copilot/GovernedGuidelineConflictResolutionEnginePanel";
import { GovernedGuidelineRecommendationEnginePanel } from "@/components/medical-copilot/GovernedGuidelineRecommendationEnginePanel";
import { GovernedClinicalGuidelinesEnginePackagePanel } from "@/components/medical-copilot/GovernedClinicalGuidelinesEnginePackagePanel";
import { GovernedClinicalDecisionRuntimeEnginePanel } from "@/components/medical-copilot/GovernedClinicalDecisionRuntimeEnginePanel";
import { GovernedDifferentialDiagnosisRankingEnginePanel } from "@/components/medical-copilot/GovernedDifferentialDiagnosisRankingEnginePanel";
import { GovernedDifferentialPrioritizationEnginePanel } from "@/components/medical-copilot/GovernedDifferentialPrioritizationEnginePanel";
import { GovernedClinicalHypothesisEnginePanel } from "@/components/medical-copilot/GovernedClinicalHypothesisEnginePanel";
import { GovernedHypothesisValidationEnginePanel } from "@/components/medical-copilot/GovernedHypothesisValidationEnginePanel";
import { GovernedDiagnosticConfidenceEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticConfidenceEnginePanel";
import { GovernedEvidenceCorrelationEnginePanel } from "@/components/medical-copilot/GovernedEvidenceCorrelationEnginePanel";
import { GovernedKnowledgeCorrelationEnginePanel } from "@/components/medical-copilot/GovernedKnowledgeCorrelationEnginePanel";
import { GovernedGuidelineCorrelationEnginePanel } from "@/components/medical-copilot/GovernedGuidelineCorrelationEnginePanel";
import { GovernedClinicalConflictDetectionEnginePanel } from "@/components/medical-copilot/GovernedClinicalConflictDetectionEnginePanel";
import { GovernedRecommendationPrioritizationEnginePanel } from "@/components/medical-copilot/GovernedRecommendationPrioritizationEnginePanel";
import { GovernedRecommendationRankingEnginePanel } from "@/components/medical-copilot/GovernedRecommendationRankingEnginePanel";
import { GovernedClinicalRecommendationEnginePanel } from "@/components/medical-copilot/GovernedClinicalRecommendationEnginePanel";
import { GovernedClinicalActionCandidateEnginePanel } from "@/components/medical-copilot/GovernedClinicalActionCandidateEnginePanel";
import { GovernedDiagnosticGapDetectionEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticGapDetectionEnginePanel";
import { GovernedMissingInformationDetectionEnginePanel } from "@/components/medical-copilot/GovernedMissingInformationDetectionEnginePanel";
import { GovernedMissingLaboratoryDetectionEnginePanel } from "@/components/medical-copilot/GovernedMissingLaboratoryDetectionEnginePanel";
import { GovernedMissingImagingDetectionEnginePanel } from "@/components/medical-copilot/GovernedMissingImagingDetectionEnginePanel";
import { GovernedMissingHistoryDetectionEnginePanel } from "@/components/medical-copilot/GovernedMissingHistoryDetectionEnginePanel";
import { GovernedClinicalConsistencyEnginePanel } from "@/components/medical-copilot/GovernedClinicalConsistencyEnginePanel";
import { GovernedClinicalCoherenceEnginePanel } from "@/components/medical-copilot/GovernedClinicalCoherenceEnginePanel";
import { GovernedClinicalExplainabilityEnginePanel } from "@/components/medical-copilot/GovernedClinicalExplainabilityEnginePanel";
import { GovernedClinicalTransparencyEnginePanel } from "@/components/medical-copilot/GovernedClinicalTransparencyEnginePanel";
import { GovernedClinicalTraceabilityEnginePanel } from "@/components/medical-copilot/GovernedClinicalTraceabilityEnginePanel";
import { GovernedPhysicianReviewPreparationEnginePanel } from "@/components/medical-copilot/GovernedPhysicianReviewPreparationEnginePanel";
import { GovernedDecisionConfidenceAggregationEnginePanel } from "@/components/medical-copilot/GovernedDecisionConfidenceAggregationEnginePanel";
import { GovernedDecisionSafetyEnginePanel } from "@/components/medical-copilot/GovernedDecisionSafetyEnginePanel";
import { GovernedDecisionQualityEnginePanel } from "@/components/medical-copilot/GovernedDecisionQualityEnginePanel";
import { GovernedDecisionGovernanceEnginePanel } from "@/components/medical-copilot/GovernedDecisionGovernanceEnginePanel";
import { GovernedClinicalDecisionSystemPackagePanel } from "@/components/medical-copilot/GovernedClinicalDecisionSystemPackagePanel";
import { GovernedCalculationRuntimeEnginePanel } from "@/components/medical-copilot/GovernedCalculationRuntimeEnginePanel";
import { GovernedBmiCalculationEnginePanel } from "@/components/medical-copilot/GovernedBmiCalculationEnginePanel";
import { GovernedBsaCalculationEnginePanel } from "@/components/medical-copilot/GovernedBsaCalculationEnginePanel";
import { GovernedCockcroftGaultCalculationEnginePanel } from "@/components/medical-copilot/GovernedCockcroftGaultCalculationEnginePanel";
import { GovernedCkdEpiCalculationEnginePanel } from "@/components/medical-copilot/GovernedCkdEpiCalculationEnginePanel";
import { GovernedEgfrCalculationEnginePanel } from "@/components/medical-copilot/GovernedEgfrCalculationEnginePanel";
import { GovernedCha2ds2VascCalculationEnginePanel } from "@/components/medical-copilot/GovernedCha2ds2VascCalculationEnginePanel";
import { GovernedHasBledCalculationEnginePanel } from "@/components/medical-copilot/GovernedHasBledCalculationEnginePanel";
import { GovernedAscvdCalculationEnginePanel } from "@/components/medical-copilot/GovernedAscvdCalculationEnginePanel";
import { GovernedNews2CalculationEnginePanel } from "@/components/medical-copilot/GovernedNews2CalculationEnginePanel";
import { GovernedCurb65CalculationEnginePanel } from "@/components/medical-copilot/GovernedCurb65CalculationEnginePanel";
import { GovernedQsofaCalculationEnginePanel } from "@/components/medical-copilot/GovernedQsofaCalculationEnginePanel";
import { GovernedWellsDvtCalculationEnginePanel } from "@/components/medical-copilot/GovernedWellsDvtCalculationEnginePanel";
import { GovernedWellsPeCalculationEnginePanel } from "@/components/medical-copilot/GovernedWellsPeCalculationEnginePanel";
import { GovernedPercCalculationEnginePanel } from "@/components/medical-copilot/GovernedPercCalculationEnginePanel";
import { GovernedCentorCalculationEnginePanel } from "@/components/medical-copilot/GovernedCentorCalculationEnginePanel";
import { GovernedGlasgowCalculationEnginePanel } from "@/components/medical-copilot/GovernedGlasgowCalculationEnginePanel";
import { GovernedNihssCalculationEnginePanel } from "@/components/medical-copilot/GovernedNihssCalculationEnginePanel";
import { GovernedChildPughCalculationEnginePanel } from "@/components/medical-copilot/GovernedChildPughCalculationEnginePanel";
import { GovernedMeldCalculationEnginePanel } from "@/components/medical-copilot/GovernedMeldCalculationEnginePanel";
import { GovernedFib4CalculationEnginePanel } from "@/components/medical-copilot/GovernedFib4CalculationEnginePanel";
import { GovernedNafldScoreCalculationEnginePanel } from "@/components/medical-copilot/GovernedNafldScoreCalculationEnginePanel";
import { GovernedApgarCalculationEnginePanel } from "@/components/medical-copilot/GovernedApgarCalculationEnginePanel";
import { GovernedFraminghamCalculationEnginePanel } from "@/components/medical-copilot/GovernedFraminghamCalculationEnginePanel";
import { GovernedTimiCalculationEnginePanel } from "@/components/medical-copilot/GovernedTimiCalculationEnginePanel";
import { GovernedHeartScoreCalculationEnginePanel } from "@/components/medical-copilot/GovernedHeartScoreCalculationEnginePanel";
import { GovernedOttawaAnkleRulesCalculationEnginePanel } from "@/components/medical-copilot/GovernedOttawaAnkleRulesCalculationEnginePanel";
import { GovernedOttawaKneeRulesCalculationEnginePanel } from "@/components/medical-copilot/GovernedOttawaKneeRulesCalculationEnginePanel";
import { GovernedCalculationValidationEnginePanel } from "@/components/medical-copilot/GovernedCalculationValidationEnginePanel";
import { GovernedClinicalCalculationSystemPackagePanel } from "@/components/medical-copilot/GovernedClinicalCalculationSystemPackagePanel";
import { GovernedPatientTimelineEngineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedPatientTimelineEngineLongitudinalEnginePanel";
import { GovernedClinicalEvolutionEngineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedClinicalEvolutionEngineLongitudinalEnginePanel";
import { GovernedDiseaseProgressionEngineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedDiseaseProgressionEngineLongitudinalEnginePanel";
import { GovernedMedicationTimelineEngineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedMedicationTimelineEngineLongitudinalEnginePanel";
import { GovernedLaboratoryTrendEngineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedLaboratoryTrendEngineLongitudinalEnginePanel";
import { GovernedImagingTrendEngineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedImagingTrendEngineLongitudinalEnginePanel";
import { GovernedVitalSignsTrendEngineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedVitalSignsTrendEngineLongitudinalEnginePanel";
import { GovernedRiskEvolutionEngineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedRiskEvolutionEngineLongitudinalEnginePanel";
import { GovernedClinicalMilestoneEngineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedClinicalMilestoneEngineLongitudinalEnginePanel";
import { GovernedChronicDiseaseTimelineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedChronicDiseaseTimelineLongitudinalEnginePanel";
import { GovernedHospitalizationTimelineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedHospitalizationTimelineLongitudinalEnginePanel";
import { GovernedProcedureTimelineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedProcedureTimelineLongitudinalEnginePanel";
import { GovernedVaccinationTimelineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedVaccinationTimelineLongitudinalEnginePanel";
import { GovernedConsultationTimelineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedConsultationTimelineLongitudinalEnginePanel";
import { GovernedCareGapTimelineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedCareGapTimelineLongitudinalEnginePanel";
import { GovernedOutcomeTrackingLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedOutcomeTrackingLongitudinalEnginePanel";
import { GovernedClinicalEventTimelineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedClinicalEventTimelineLongitudinalEnginePanel";
import { GovernedPatientJourneyEngineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedPatientJourneyEngineLongitudinalEnginePanel";
import { GovernedContinuityOfCareEngineLongitudinalEnginePanel } from "@/components/medical-copilot/GovernedContinuityOfCareEngineLongitudinalEnginePanel";
import { GovernedClinicalLongitudinalIntelligencePackagePanel } from "@/components/medical-copilot/GovernedClinicalLongitudinalIntelligencePackagePanel";
import { GovernedMedicationOptimizationTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedMedicationOptimizationTherapeuticEnginePanel";
import { GovernedDoseOptimizationTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedDoseOptimizationTherapeuticEnginePanel";
import { GovernedTherapeuticEscalationTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedTherapeuticEscalationTherapeuticEnginePanel";
import { GovernedTherapeuticDeEscalationTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedTherapeuticDeEscalationTherapeuticEnginePanel";
import { GovernedDeprescribingTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedDeprescribingTherapeuticEnginePanel";
import { GovernedMedicationReconciliationTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedMedicationReconciliationTherapeuticEnginePanel";
import { GovernedAdherenceAnalysisTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedAdherenceAnalysisTherapeuticEnginePanel";
import { GovernedDrugMonitoringTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedDrugMonitoringTherapeuticEnginePanel";
import { GovernedTherapeuticGoalTrackingTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedTherapeuticGoalTrackingTherapeuticEnginePanel";
import { GovernedSideEffectSurveillanceTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedSideEffectSurveillanceTherapeuticEnginePanel";
import { GovernedDrugSafetyTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedDrugSafetyTherapeuticEnginePanel";
import { GovernedPolypharmacyOptimizationTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedPolypharmacyOptimizationTherapeuticEnginePanel";
import { GovernedTreatmentResponseTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedTreatmentResponseTherapeuticEnginePanel";
import { GovernedClinicalMonitoringTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedClinicalMonitoringTherapeuticEnginePanel";
import { GovernedFollowUpOptimizationTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedFollowUpOptimizationTherapeuticEnginePanel";
import { GovernedCarePathwayOptimizationTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedCarePathwayOptimizationTherapeuticEnginePanel";
import { GovernedTherapeuticRecommendationsTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedTherapeuticRecommendationsTherapeuticEnginePanel";
import { GovernedTreatmentPrioritizationTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedTreatmentPrioritizationTherapeuticEnginePanel";
import { GovernedClinicalInterventionPlanningTherapeuticEnginePanel } from "@/components/medical-copilot/GovernedClinicalInterventionPlanningTherapeuticEnginePanel";
import { GovernedTherapeuticIntelligencePackagePanel } from "@/components/medical-copilot/GovernedTherapeuticIntelligencePackagePanel";
import { GovernedDiagnosticRuntimeDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticRuntimeDiagnosticIntelEnginePanel";
import { GovernedDifferentialEvolutionDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedDifferentialEvolutionDiagnosticIntelEnginePanel";
import { GovernedDiagnosticCorrelationDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticCorrelationDiagnosticIntelEnginePanel";
import { GovernedDiagnosticPatternRecognitionDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticPatternRecognitionDiagnosticIntelEnginePanel";
import { GovernedSyndromicRecognitionDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedSyndromicRecognitionDiagnosticIntelEnginePanel";
import { GovernedClinicalClusteringDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedClinicalClusteringDiagnosticIntelEnginePanel";
import { GovernedMissingDiagnosisDetectionDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedMissingDiagnosisDetectionDiagnosticIntelEnginePanel";
import { GovernedDiagnosticConsistencyDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticConsistencyDiagnosticIntelEnginePanel";
import { GovernedDiagnosticPrioritizationDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticPrioritizationDiagnosticIntelEnginePanel";
import { GovernedDiagnosticConfidenceDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticConfidenceDiagnosticIntelEnginePanel";
import { GovernedDiagnosticEvidenceDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticEvidenceDiagnosticIntelEnginePanel";
import { GovernedDiagnosticExplainabilityDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticExplainabilityDiagnosticIntelEnginePanel";
import { GovernedRareDiseaseAwarenessDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedRareDiseaseAwarenessDiagnosticIntelEnginePanel";
import { GovernedDiagnosticValidationDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticValidationDiagnosticIntelEnginePanel";
import { GovernedDiagnosticTimelineDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticTimelineDiagnosticIntelEnginePanel";
import { GovernedDiagnosticLearningDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticLearningDiagnosticIntelEnginePanel";
import { GovernedDiagnosticAlertsDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticAlertsDiagnosticIntelEnginePanel";
import { GovernedDiagnosticReviewDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticReviewDiagnosticIntelEnginePanel";
import { GovernedDiagnosticGovernanceDiagnosticIntelEnginePanel } from "@/components/medical-copilot/GovernedDiagnosticGovernanceDiagnosticIntelEnginePanel";
import { GovernedDiagnosticIntelligencePackagePanel } from "@/components/medical-copilot/GovernedDiagnosticIntelligencePackagePanel";
import { GovernedPopulationRuntimePopulationEnginePanel } from "@/components/medical-copilot/GovernedPopulationRuntimePopulationEnginePanel";
import { GovernedRiskStratificationPopulationEnginePanel } from "@/components/medical-copilot/GovernedRiskStratificationPopulationEnginePanel";
import { GovernedPopulationScreeningPopulationEnginePanel } from "@/components/medical-copilot/GovernedPopulationScreeningPopulationEnginePanel";
import { GovernedPreventiveCoveragePopulationEnginePanel } from "@/components/medical-copilot/GovernedPreventiveCoveragePopulationEnginePanel";
import { GovernedVaccinationCoveragePopulationEnginePanel } from "@/components/medical-copilot/GovernedVaccinationCoveragePopulationEnginePanel";
import { GovernedQualityIndicatorsPopulationEnginePanel } from "@/components/medical-copilot/GovernedQualityIndicatorsPopulationEnginePanel";
import { GovernedClinicalKpisPopulationEnginePanel } from "@/components/medical-copilot/GovernedClinicalKpisPopulationEnginePanel";
import { GovernedPopulationTrendsPopulationEnginePanel } from "@/components/medical-copilot/GovernedPopulationTrendsPopulationEnginePanel";
import { GovernedClinicalOutcomesPopulationEnginePanel } from "@/components/medical-copilot/GovernedClinicalOutcomesPopulationEnginePanel";
import { GovernedResourceUtilizationPopulationEnginePanel } from "@/components/medical-copilot/GovernedResourceUtilizationPopulationEnginePanel";
import { GovernedDiseaseBurdenPopulationEnginePanel } from "@/components/medical-copilot/GovernedDiseaseBurdenPopulationEnginePanel";
import { GovernedReadmissionRiskPopulationEnginePanel } from "@/components/medical-copilot/GovernedReadmissionRiskPopulationEnginePanel";
import { GovernedPreventiveOpportunitiesPopulationEnginePanel } from "@/components/medical-copilot/GovernedPreventiveOpportunitiesPopulationEnginePanel";
import { GovernedChronicDiseaseRegistryPopulationEnginePanel } from "@/components/medical-copilot/GovernedChronicDiseaseRegistryPopulationEnginePanel";
import { GovernedPopulationDashboardPopulationEnginePanel } from "@/components/medical-copilot/GovernedPopulationDashboardPopulationEnginePanel";
import { GovernedQualityDashboardPopulationEnginePanel } from "@/components/medical-copilot/GovernedQualityDashboardPopulationEnginePanel";
import { GovernedClinicalBenchmarkPopulationEnginePanel } from "@/components/medical-copilot/GovernedClinicalBenchmarkPopulationEnginePanel";
import { GovernedPopulationExplainabilityPopulationEnginePanel } from "@/components/medical-copilot/GovernedPopulationExplainabilityPopulationEnginePanel";
import { GovernedPopulationGovernancePopulationEnginePanel } from "@/components/medical-copilot/GovernedPopulationGovernancePopulationEnginePanel";
import { GovernedPopulationHealthPackagePanel } from "@/components/medical-copilot/GovernedPopulationHealthPackagePanel";
import { GovernedClinicalOrchestratorRuntimePanel } from "@/components/medical-copilot/GovernedClinicalOrchestratorRuntimePanel";
import { GovernedClinicalContextAggregatorPanel } from "@/components/medical-copilot/GovernedClinicalContextAggregatorPanel";
import { GovernedClinicalIntelligenceAggregatorPanel } from "@/components/medical-copilot/GovernedClinicalIntelligenceAggregatorPanel";
import { GovernedKnowledgeAggregatorPanel } from "@/components/medical-copilot/GovernedKnowledgeAggregatorPanel";
import { GovernedEvidenceAggregatorPanel } from "@/components/medical-copilot/GovernedEvidenceAggregatorPanel";
import { GovernedGuidelineAggregatorPanel } from "@/components/medical-copilot/GovernedGuidelineAggregatorPanel";
import { GovernedDecisionAggregatorPanel } from "@/components/medical-copilot/GovernedDecisionAggregatorPanel";
import { GovernedCalculationAggregatorPanel } from "@/components/medical-copilot/GovernedCalculationAggregatorPanel";
import { GovernedLongitudinalAggregatorPanel } from "@/components/medical-copilot/GovernedLongitudinalAggregatorPanel";
import { GovernedTherapeuticAggregatorPanel } from "@/components/medical-copilot/GovernedTherapeuticAggregatorPanel";
import { GovernedDiagnosticAggregatorPanel } from "@/components/medical-copilot/GovernedDiagnosticAggregatorPanel";
import { GovernedPopulationAggregatorPanel } from "@/components/medical-copilot/GovernedPopulationAggregatorPanel";
import { GovernedPersistenceAggregatorPanel } from "@/components/medical-copilot/GovernedPersistenceAggregatorPanel";
import { GovernedReasoningAggregatorPanel } from "@/components/medical-copilot/GovernedReasoningAggregatorPanel";
import { GovernedSuggestionAggregatorPanel } from "@/components/medical-copilot/GovernedSuggestionAggregatorPanel";
import { GovernedRuleAggregatorPanel } from "@/components/medical-copilot/GovernedRuleAggregatorPanel";
import { GovernedSafetyAggregatorPanel } from "@/components/medical-copilot/GovernedSafetyAggregatorPanel";
import { GovernedGovernanceAggregatorPanel } from "@/components/medical-copilot/GovernedGovernanceAggregatorPanel";
import { GovernedAuditAggregatorPanel } from "@/components/medical-copilot/GovernedAuditAggregatorPanel";
import { GovernedClinicalAiOrchestratorPackagePanel } from "@/components/medical-copilot/GovernedClinicalAiOrchestratorPackagePanel";
import { GovernedClinicalConsultationWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalConsultationWorkflowPanel";
import { GovernedClinicalDocumentationWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalDocumentationWorkflowPanel";
import { GovernedClinicalReasoningWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalReasoningWorkflowPanel";
import { GovernedClinicalDecisionWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalDecisionWorkflowPanel";
import { GovernedClinicalIntelligenceWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalIntelligenceWorkflowPanel";
import { GovernedClinicalKnowledgeWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalKnowledgeWorkflowPanel";
import { GovernedClinicalEvidenceWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalEvidenceWorkflowPanel";
import { GovernedClinicalGuidelinesWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalGuidelinesWorkflowPanel";
import { GovernedClinicalCalculationWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalCalculationWorkflowPanel";
import { GovernedClinicalSafetyWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalSafetyWorkflowPanel";
import { GovernedClinicalValidationWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalValidationWorkflowPanel";
import { GovernedClinicalPhysicianReviewWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalPhysicianReviewWorkflowPanel";
import { GovernedClinicalPersistenceWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalPersistenceWorkflowPanel";
import { GovernedClinicalAuditWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalAuditWorkflowPanel";
import { GovernedClinicalAnalyticsWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalAnalyticsWorkflowPanel";
import { GovernedClinicalPopulationWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalPopulationWorkflowPanel";
import { GovernedClinicalMarketplaceWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalMarketplaceWorkflowPanel";
import { GovernedClinicalDashboardWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalDashboardWorkflowPanel";
import { GovernedClinicalSessionWorkflowPanel } from "@/components/medical-copilot/GovernedClinicalSessionWorkflowPanel";
import { GovernedClinicalWorkflowEnginePackagePanel } from "@/components/medical-copilot/GovernedClinicalWorkflowEnginePackagePanel";
import { ClinicalWorkflowBanner } from "@/components/medical-copilot/ClinicalWorkflowBanner";
import { ClinicalWorkflowTelemetryBridge } from "@/components/medical-copilot/ClinicalWorkflowTelemetryBridge";
import {
  MedicalCopilotErrorState,
  MedicalCopilotLoadingState,
} from "@/components/medical-copilot/states";
import { ClinicalDictationProvider } from "@/context/ClinicalDictationContext";
import { ClinicalValidationProvider } from "@/context/ClinicalValidationContext";
import { ClinicalVoiceIntelligenceProvider } from "@/context/ClinicalVoiceIntelligenceContext";
import { ClinicalWorkflowProvider } from "@/context/ClinicalWorkflowContext";
import { MedicalCopilotProvider } from "@/context/MedicalCopilotContext";
import { getMedicalCopilotRuntime } from "@/lib/medical-copilot/api";
import {
  applyMedicalCopilotServerRuntime,
  isMedicalCopilotEnabled,
} from "@/lib/medical-copilot/enabled";
import { fetchConsultation } from "@/lib/services/consultations";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import { MedicalCopilotDeferredPanel } from "@/components/medical-copilot/MedicalCopilotDeferredPanel";
import { Rc3PackagePrefetch } from "@/components/medical-copilot/Rc3PackagePrefetch";
import { isMedicalCopilotLabSurfaceEnabled } from "@/lib/epic3/architecture-contract";

/**
 * GA / AR-1 — Kill switch (local + server) + Session Ownership entry.
 * CB-1/CB-2/CB-3 surfaces mount only when Medical Copilot is enabled.
 *
 * EPIC-3 Architecture Contract (E3-0c):
 * This route is an optional LAB surface — NOT the Clinical Copilot Daily Hub.
 * Daily Hub = ClinicalCopilotDrawer on `/panel/consultas/[id]`.
 * Depth Governed* panels are outside the Daily Hub API allowlist.
 * Lab dump can be disabled with NEXT_PUBLIC_MEDICAL_COPILOT_LAB_SURFACE=0
 * (default ON — no UX change for existing visitors).
 */
export default function MedicalCopilotPage() {
  const params = useParams();
  const consultationId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  const [patientId, setPatientId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copilotEnabled, setCopilotEnabled] = useState(true);
  const labSurfaceEnabled = isMedicalCopilotLabSurfaceEnabled();

  useEffect(() => {
    let cancelled = false;
    async function resolveEnabled() {
      try {
        const runtime = await getMedicalCopilotRuntime();
        if (!cancelled) {
          applyMedicalCopilotServerRuntime(runtime.data);
        }
      } catch {
        /* keep local/env decision if runtime unreachable */
      } finally {
        if (!cancelled) {
          setCopilotEnabled(isMedicalCopilotEnabled());
        }
      }
    }
    void resolveEnabled();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!consultationId) {
        setError("Consulta no válida");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const consultation = await fetchConsultation(consultationId);
        const resolvedPatientId =
          consultation.patientId ||
          (consultation as { patient?: { id?: string } }).patient?.id ||
          null;
        if (!resolvedPatientId) {
          throw new Error("La consulta no tiene patientId asociado");
        }
        if (!cancelled) {
          setPatientId(resolvedPatientId);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [consultationId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href={`/panel/consultas/${consultationId}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Volver a la consulta
          </Link>
          <span className="text-xs text-slate-500">
            HeyDoctor Copilot · Workspace
          </span>
        </div>
      </div>

      {loading ? (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <MedicalCopilotLoadingState label="Preparando consulta…" />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <MedicalCopilotErrorState message={error} />
        </div>
      ) : null}

      {!loading && !error && !copilotEnabled ? (
        <div
          className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
          data-testid="medical-copilot-kill-switch"
        >
          <MedicalCopilotErrorState
            title="HeyDoctor Copilot deshabilitado"
            message="HeyDoctor Copilot está desactivado por kill switch / feature flag. La consulta clínica, el EMR y la autenticación no se ven afectados. Vuelva a la consulta para continuar el trabajo clínico."
          />
          <div className="mt-4">
            <Link
              href={`/panel/consultas/${consultationId}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Ir a la consulta clínica
            </Link>
          </div>
        </div>
      ) : null}

      {!loading && !error && patientId && copilotEnabled ? (
        <MedicalCopilotProvider>
          <ClinicalDictationProvider consultationId={consultationId}>
            <ClinicalVoiceIntelligenceProvider>
              <ClinicalWorkflowProvider
                consultationId={consultationId}
                patientId={patientId}
              >
                <ClinicalValidationProvider cohortTag="clinical_beta">
                  <ClinicalWorkflowTelemetryBridge />
                  <div
                    className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
                    data-testid="medical-copilot-active-shell"
                  >
                    {labSurfaceEnabled ? (
                      <>
                      <Rc3PackagePrefetch />
                      <ClinicalWorkflowBanner />
                      <ClinicalDictationPanel />
                      <ClinicalVoiceSuggestionsPanel />
                      <ClinicalFindingsPanel />
                      <ClinicalInsightsPanel />
                      <ClinicalRecommendationsPanel />
                      <ClinicalDecisionSupportPanel />
                      <ClinicalReasoningPanel />
                      <ClinicalCopilotSnapshotPanel />
                      <ClinicalReviewPanel />
                      <MedicalCopilotDeferredPanel title="Clinical Case Representation">
                        <ClinicalCaseRepresentationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Context">
                        <ClinicalContextPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Planning">
                        <ClinicalPlanningPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed A I Request">
                        <GovernedAIRequestPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="A I Provider">
                        <AIProviderPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed A I Gateway">
                        <GovernedAIGatewayPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Open A I Provider">
                        <OpenAIProviderPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed A I Execution">
                        <GovernedAIExecutionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed A I Clinical Response">
                        <GovernedAIClinicalResponsePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed A I Prompt">
                        <GovernedAIPromptPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Prompt Template">
                        <GovernedPromptTemplatePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Prompt Composer">
                        <GovernedPromptComposerPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Provider Payload">
                        <GovernedProviderPayloadPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed A I Invocation">
                        <GovernedAIInvocationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed A I Response Normalizer">
                        <GovernedAIResponseNormalizerPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical A I Output">
                        <GovernedClinicalAIOutputPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Physician Review Prep">
                        <GovernedPhysicianReviewPrepPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Workflow Integration">
                        <GovernedWorkflowIntegrationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Prompt Assembly">
                        <GovernedPromptAssemblyPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Provider Payload Translation">
                        <GovernedProviderPayloadTranslationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Provider Execution">
                        <GovernedProviderExecutionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed A I Response Processing">
                        <GovernedAIResponseProcessingPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Physician Review Experience">
                        <GovernedPhysicianReviewExperiencePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Differential Foundation">
                        <ClinicalDifferentialFoundationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Evidence Mapping Foundation">
                        <EvidenceMappingFoundationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Confidence Foundation">
                        <ClinicalConfidenceFoundationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Missing Information Engine">
                        <MissingInformationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Physician Decision Workspace">
                        <PhysicianDecisionWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Diagnostic Evidence Workspace">
                        <DiagnosticEvidenceWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Diagnostic Gap Analyzer">
                        <DiagnosticGapAnalyzerPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Priority Workspace">
                        <ClinicalPriorityWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Physician Review Workspace V2">
                        <PhysicianReviewWorkspaceV2Panel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Session Package">
                        <GovernedClinicalSessionPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Review Dataset Foundation">
                        <ClinicalReviewDatasetFoundationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Review Checklist Foundation">
                        <ReviewChecklistFoundationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Validation Workspace">
                        <ClinicalValidationWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Physician Review Summary">
                        <PhysicianReviewSummaryPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Physician Review Package">
                        <GovernedPhysicianReviewPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Physician Review Checklist Workspace">
                        <PhysicianReviewChecklistWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Review Timeline">
                        <ClinicalReviewTimelinePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Review Navigation">
                        <ClinicalReviewNavigationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Physician Review Dashboard">
                        <PhysicianReviewDashboardPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Review Session">
                        <GovernedReviewSessionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Question Generator">
                        <ClinicalQuestionGeneratorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Physician Interview Workspace">
                        <PhysicianInterviewWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Completeness Analyzer">
                        <ClinicalCompletenessAnalyzerPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Readiness Workspace">
                        <ClinicalReadinessWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Assessment Package">
                        <GovernedClinicalAssessmentPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Reasoning Workspace">
                        <ClinicalReasoningWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Differential Review Workspace">
                        <DifferentialReviewWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Evidence Completeness Workspace">
                        <EvidenceCompletenessWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Physician Reasoning Preparation">
                        <PhysicianReasoningPreparationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Reasoning Package">
                        <GovernedClinicalReasoningPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Reasoning Dataset">
                        <ClinicalReasoningDatasetPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Evidence Correlation Workspace">
                        <EvidenceCorrelationWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Pattern Workspace">
                        <ClinicalPatternWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Reasoning Workspace">
                        <GovernedReasoningWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Reasoning Dataset">
                        <GovernedClinicalReasoningDatasetPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Reasoning Context">
                        <ClinicalReasoningContextPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Evidence Graph Workspace">
                        <EvidenceGraphWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Reasoning Inputs">
                        <ClinicalReasoningInputsPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Reasoning Preparation">
                        <GovernedReasoningPreparationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Reasoning Input Package">
                        <GovernedClinicalReasoningInputPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Reasoning Engine Core">
                        <ClinicalReasoningEngineCorePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Reasoning Rule Pipeline">
                        <ReasoningRulePipelinePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Reasoning Execution Context">
                        <ReasoningExecutionContextPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Reasoning Runtime">
                        <GovernedReasoningRuntimePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Reasoning Engine Foundation">
                        <ClinicalReasoningEngineFoundationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Reasoning Stage Manager">
                        <ReasoningStageManagerPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Reasoning State Machine">
                        <ReasoningStateMachinePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Reasoning Validation Engine">
                        <ReasoningValidationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Reasoning Session">
                        <GovernedReasoningSessionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Reasoning Runtime Foundation">
                        <ClinicalReasoningRuntimeFoundationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Reasoning Pipeline">
                        <ClinicalReasoningPipelinePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Reasoning Graph">
                        <ClinicalReasoningGraphPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Reasoning Trace">
                        <ClinicalReasoningTracePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Reasoning Session">
                        <GovernedClinicalReasoningSessionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Reasoning Package">
                        <ClinicalReasoningPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Reasoning Orchestrator">
                        <ClinicalReasoningOrchestratorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Differential Reasoning Engine">
                        <DifferentialReasoningEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Evidence Reasoning Engine">
                        <EvidenceReasoningEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Consistency Engine">
                        <ClinicalConsistencyEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Reasoning Output">
                        <GovernedReasoningOutputPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Hypothesis Workspace">
                        <ClinicalHypothesisWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Evidence Ranking Workspace">
                        <EvidenceRankingWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Reasoning Quality Engine">
                        <ReasoningQualityEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Physician Reasoning Review">
                        <PhysicianReasoningReviewPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Intelligence Package">
                        <GovernedClinicalIntelligencePackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Intelligence Orchestrator">
                        <ClinicalIntelligenceOrchestratorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Intelligence Context">
                        <ClinicalIntelligenceContextPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Intelligence Graph">
                        <ClinicalIntelligenceGraphPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Intelligence Trace">
                        <ClinicalIntelligenceTracePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Intelligence Runtime">
                        <ClinicalIntelligenceRuntimePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Physician Intelligence Workspace">
                        <PhysicianIntelligenceWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Intelligence Validation">
                        <ClinicalIntelligenceValidationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Intelligence Session">
                        <GovernedClinicalIntelligenceSessionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Clinical Intelligence Output">
                        <ClinicalIntelligenceOutputPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Intelligence Foundation">
                        <GovernedClinicalIntelligenceFoundationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Intelligence Flow">
                        <GovernedClinicalIntelligenceFlowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Intelligence Runtime">
                        <GovernedClinicalIntelligenceRuntimePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Assistant">
                        <GovernedClinicalAssistancePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Draft">
                        <GovernedClinicalDraftPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Soap Draft">
                        <GovernedSoapDraftPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Prescription Draft">
                        <GovernedPrescriptionDraftPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Orders Draft">
                        <GovernedOrdersDraftPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Referral Draft">
                        <GovernedReferralDraftPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Medical Certificate Draft">
                        <GovernedMedicalCertificateDraftPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Medical Leave Draft">
                        <GovernedMedicalLeaveDraftPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Patient Instructions Draft">
                        <GovernedPatientInstructionsDraftPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Follow Up Draft">
                        <GovernedFollowUpDraftPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Visit Summary Draft">
                        <GovernedClinicalVisitSummaryDraftPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Care Plan Draft">
                        <GovernedCarePlanDraftPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Patient Education Draft">
                        <GovernedPatientEducationDraftPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Discharge Draft">
                        <GovernedDischargeDraftPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Documentation Package">
                        <GovernedClinicalDocumentationPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Encounter">
                        <GovernedClinicalEncounterPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Physician Workspace">
                        <GovernedPhysicianWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Consultation Runtime">
                        <GovernedConsultationRuntimePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Consultation Snapshot">
                        <GovernedConsultationSnapshotPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Consultation Review">
                        <GovernedConsultationReviewPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Consultation Workspace">
                        <GovernedConsultationWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Encounter Workspace">
                        <GovernedEncounterWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Encounter Review">
                        <GovernedEncounterReviewPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Encounter Snapshot">
                        <GovernedEncounterSnapshotPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Encounter Consolidation">
                        <GovernedEncounterConsolidationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Consultation Package">
                        <GovernedConsultationPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Workspace">
                        <GovernedClinicalWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Workspace Review">
                        <GovernedClinicalWorkspaceReviewPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Workspace Snapshot">
                        <GovernedClinicalWorkspaceSnapshotPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Workspace Consolidation">
                        <GovernedClinicalWorkspaceConsolidationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Consultation Dashboard">
                        <GovernedConsultationDashboardPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Physician Dashboard">
                        <GovernedPhysicianDashboardPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Dashboard">
                        <GovernedClinicalDashboardPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Session Dashboard">
                        <GovernedClinicalSessionDashboardPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Overview">
                        <GovernedClinicalOverviewPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Workspace Package">
                        <GovernedClinicalWorkspacePackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Home">
                        <GovernedClinicalHomePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Physician Home">
                        <GovernedPhysicianHomePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Consultation Home">
                        <GovernedConsultationHomePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Timeline">
                        <GovernedClinicalTimelinePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Encounter Timeline">
                        <GovernedEncounterTimelinePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Navigation">
                        <GovernedClinicalNavigationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Experience">
                        <GovernedClinicalExperiencePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Physician Experience">
                        <GovernedPhysicianExperiencePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Consultation Experience">
                        <GovernedConsultationExperiencePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Experience Package">
                        <GovernedClinicalExperiencePackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Physician Interaction Workspace">
                        <GovernedPhysicianInteractionWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Draft Review Workspace">
                        <GovernedDraftReviewWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Draft Comparison Workspace">
                        <GovernedDraftComparisonWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Validation Workspace">
                        <GovernedValidationWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Approval Preview">
                        <GovernedApprovalPreviewPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Approval Queue">
                        <GovernedApprovalQueuePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Pending Actions">
                        <GovernedPendingActionsPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Review Package">
                        <GovernedClinicalReviewPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Physician Session">
                        <GovernedPhysicianSessionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Physician Runtime Package">
                        <GovernedPhysicianRuntimePackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Activation Workspace">
                        <GovernedClinicalActivationWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Activation Review">
                        <GovernedClinicalActivationReviewPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Activation Timeline">
                        <GovernedClinicalActivationTimelinePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Activation Navigation">
                        <GovernedClinicalActivationNavigationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Physician Activation Workspace">
                        <GovernedPhysicianActivationWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Consultation Activation Workspace">
                        <GovernedConsultationActivationWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Activation Dashboard">
                        <GovernedClinicalActivationDashboardPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Activation Session">
                        <GovernedClinicalActivationSessionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Activation Runtime">
                        <GovernedClinicalActivationRuntimePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Activation Package">
                        <GovernedClinicalActivationPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Preparation Workspace">
                        <GovernedPersistencePreparationWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Review">
                        <GovernedPersistenceReviewPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Timeline">
                        <GovernedPersistenceTimelinePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Navigation">
                        <GovernedPersistenceNavigationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Dashboard">
                        <GovernedPersistenceDashboardPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Session">
                        <GovernedPersistenceSessionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Runtime">
                        <GovernedPersistenceRuntimePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Preview">
                        <GovernedPersistencePreviewPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Validation">
                        <GovernedPersistenceValidationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Package">
                        <GovernedPersistencePackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Readiness Workspace">
                        <GovernedPersistenceReadinessWorkspacePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Readiness Review">
                        <GovernedPersistenceReadinessReviewPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Readiness Timeline">
                        <GovernedPersistenceReadinessTimelinePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Readiness Dashboard">
                        <GovernedPersistenceReadinessDashboardPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Readiness Session">
                        <GovernedPersistenceReadinessSessionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Readiness Runtime">
                        <GovernedPersistenceReadinessRuntimePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Readiness Preview">
                        <GovernedPersistenceReadinessPreviewPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Readiness Validation">
                        <GovernedPersistenceReadinessValidationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Readiness Consolidation">
                        <GovernedPersistenceReadinessConsolidationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Readiness Package">
                        <GovernedPersistenceReadinessPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Persistence Infrastructure">
                        <GovernedClinicalPersistenceInfrastructurePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Persistence Runtime State">
                        <GovernedClinicalPersistenceRuntimeStatePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Repository Runtime">
                        <GovernedClinicalRepositoryRuntimePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Repository Wiring">
                        <GovernedClinicalRepositoryWiringPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Validation">
                        <GovernedClinicalValidationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Execution Preparation">
                        <GovernedClinicalExecutionPreparationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Repository Discovery">
                        <GovernedClinicalRepositoryDiscoveryPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Entity Mapping">
                        <GovernedClinicalEntityMappingPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Persistence Orchestrator">
                        <GovernedClinicalPersistenceOrchestratorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Persistence Readiness">
                        <GovernedClinicalPersistenceReadinessPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Consultation Persistence Bridge">
                        <GovernedConsultationPersistenceBridgePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Soap Persistence Bridge">
                        <GovernedSoapPersistenceBridgePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Prescription Persistence Bridge">
                        <GovernedPrescriptionPersistenceBridgePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Orders Persistence Bridge">
                        <GovernedOrdersPersistenceBridgePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Referral Persistence Bridge">
                        <GovernedReferralPersistenceBridgePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Documents Persistence Bridge">
                        <GovernedClinicalDocumentsPersistenceBridgePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Consultation Persistence Execution">
                        <GovernedConsultationPersistenceExecutionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Soap Persistence Execution">
                        <GovernedSoapPersistenceExecutionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Prescription Persistence Execution">
                        <GovernedPrescriptionPersistenceExecutionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Orders Persistence Execution">
                        <GovernedOrdersPersistenceExecutionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Referral Persistence Execution">
                        <GovernedReferralPersistenceExecutionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Documents Persistence Execution">
                        <GovernedClinicalDocumentsPersistenceExecutionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Suggestion Runtime">
                        <GovernedClinicalSuggestionRuntimePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Differential Diagnosis Suggestion">
                        <GovernedDifferentialDiagnosisSuggestionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Assessment Suggestion">
                        <GovernedClinicalAssessmentSuggestionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Treatment Suggestion">
                        <GovernedTreatmentSuggestionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Medication Suggestion">
                        <GovernedMedicationSuggestionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Orders Suggestion">
                        <GovernedOrdersSuggestionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Referral Suggestion">
                        <GovernedReferralSuggestionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Follow Up Suggestion">
                        <GovernedFollowUpSuggestionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Patient Education Suggestion">
                        <GovernedPatientEducationSuggestionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Recommendation Package">
                        <GovernedClinicalRecommendationPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Evidence Runtime">
                        <GovernedClinicalEvidenceRuntimePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Mapping">
                        <GovernedEvidenceMappingPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Trace">
                        <GovernedEvidenceTracePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Confidence">
                        <GovernedEvidenceConfidencePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Explainability">
                        <GovernedClinicalExplainabilityPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Justification">
                        <GovernedClinicalJustificationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Physician Decision Support">
                        <GovernedPhysicianDecisionSupportPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Safety Checks">
                        <GovernedClinicalSafetyChecksPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Recommendation Validation">
                        <GovernedRecommendationValidationPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Decision Package">
                        <GovernedClinicalDecisionPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Drug Interaction Analysis">
                        <GovernedDrugInteractionAnalysisPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Allergy Cross Check">
                        <GovernedAllergyCrossCheckPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Contraindication Analysis">
                        <GovernedContraindicationAnalysisPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Risk Detection">
                        <GovernedClinicalRiskDetectionPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Preventive Care Suggestions">
                        <GovernedPreventiveCareSuggestionsPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Preventive Screening Suggestions">
                        <GovernedPreventiveScreeningSuggestionsPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Vaccination Review">
                        <GovernedVaccinationReviewPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Chronic Disease Follow Up Analysis">
                        <GovernedChronicDiseaseFollowUpAnalysisPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Alert Center">
                        <GovernedClinicalAlertCenterPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Functional Intelligence Package">
                        <GovernedClinicalFunctionalIntelligencePackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Cardiovascular Risk Engine">
                        <GovernedCardiovascularRiskEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diabetes Care Engine">
                        <GovernedDiabetesCareEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Hypertension Management Engine">
                        <GovernedHypertensionManagementEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Renal Risk Engine">
                        <GovernedRenalRiskEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Polypharmacy Analysis Engine">
                        <GovernedPolypharmacyAnalysisEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Preventive Health Engine">
                        <GovernedPreventiveHealthEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Geriatric Assessment Engine">
                        <GovernedGeriatricAssessmentEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Pediatric Safety Engine">
                        <GovernedPediatricSafetyEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Womens Health Review Engine">
                        <GovernedWomensHealthReviewEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Specialized Clinical Intelligence Package">
                        <GovernedSpecializedClinicalIntelligencePackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Rule Engine Runtime">
                        <GovernedClinicalRuleEngineRuntimePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Drug Interaction Rule Engine">
                        <GovernedDrugInteractionRuleEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Allergy Rule Engine">
                        <GovernedAllergyRuleEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Contraindication Rule Engine">
                        <GovernedContraindicationRuleEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Risk Rule Engine">
                        <GovernedClinicalRiskRuleEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Preventive Care Rule Engine">
                        <GovernedPreventiveCareRuleEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Vaccination Rule Engine">
                        <GovernedVaccinationRuleEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Chronic Disease Rule Engine">
                        <GovernedChronicDiseaseRuleEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Alert Rule Engine">
                        <GovernedClinicalAlertRuleEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Deterministic Clinical Rules Package">
                        <GovernedDeterministicClinicalRulesPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Intake Stage">
                        <GovernedClinicalIntakeStagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Context Stage">
                        <GovernedClinicalContextStagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Aggregation Stage">
                        <GovernedEvidenceAggregationStagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Rules Evaluation Stage">
                        <GovernedRulesEvaluationStagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Suggestions Aggregation Stage">
                        <GovernedSuggestionsAggregationStagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Decision Support Stage">
                        <GovernedDecisionSupportStagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Intelligence Stage">
                        <GovernedClinicalIntelligenceStagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Summary Stage">
                        <GovernedClinicalSummaryStagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Physician Review Stage">
                        <GovernedPhysicianReviewStagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Reasoning Pipeline">
                        <GovernedClinicalReasoningPipelinePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Disease Knowledge Engine">
                        <GovernedDiseaseKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Medication Knowledge Engine">
                        <GovernedMedicationKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Laboratory Knowledge Engine">
                        <GovernedLaboratoryKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Imaging Knowledge Engine">
                        <GovernedImagingKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Procedure Knowledge Engine">
                        <GovernedProcedureKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Vaccine Knowledge Engine">
                        <GovernedVaccineKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Preventive Medicine Knowledge Engine">
                        <GovernedPreventiveMedicineKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Guidelines Knowledge Engine">
                        <GovernedClinicalGuidelinesKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Criteria Knowledge Engine">
                        <GovernedDiagnosticCriteriaKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Differential Diagnosis Knowledge Engine">
                        <GovernedDifferentialDiagnosisKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Drug Monograph Knowledge Engine">
                        <GovernedDrugMonographKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Drug Interaction Knowledge Engine">
                        <GovernedDrugInteractionKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Contraindication Knowledge Engine">
                        <GovernedContraindicationKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Allergy Knowledge Engine">
                        <GovernedAllergyKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Red Flag Knowledge Engine">
                        <GovernedRedFlagKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Scale Knowledge Engine">
                        <GovernedClinicalScaleKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Risk Score Knowledge Engine">
                        <GovernedRiskScoreKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Chronic Disease Knowledge Engine">
                        <GovernedChronicDiseaseKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Womens Health Knowledge Engine">
                        <GovernedWomensHealthKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Pediatrics Knowledge Engine">
                        <GovernedPediatricsKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Geriatrics Knowledge Engine">
                        <GovernedGeriatricsKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Mental Health Knowledge Engine">
                        <GovernedMentalHealthKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Emergency Medicine Knowledge Engine">
                        <GovernedEmergencyMedicineKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Public Health Knowledge Engine">
                        <GovernedPublicHealthKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Preventive Screening Knowledge Engine">
                        <GovernedPreventiveScreeningKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Lifestyle Medicine Knowledge Engine">
                        <GovernedLifestyleMedicineKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Nutrition Knowledge Engine">
                        <GovernedNutritionKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Follow Up Knowledge Engine">
                        <GovernedFollowUpKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Care Pathway Knowledge Engine">
                        <GovernedCarePathwayKnowledgeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Knowledge Package">
                        <GovernedClinicalKnowledgePackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Source Engine">
                        <GovernedEvidenceSourceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Hierarchy Engine">
                        <GovernedEvidenceHierarchyEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Level Engine">
                        <GovernedEvidenceLevelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Quality Engine">
                        <GovernedEvidenceQualityEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Confidence Engine">
                        <GovernedEvidenceConfidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Recommendation Strength Engine">
                        <GovernedEvidenceRecommendationStrengthEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Guideline Evidence Engine">
                        <GovernedClinicalGuidelineEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Systematic Review Evidence Engine">
                        <GovernedSystematicReviewEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Meta Analysis Evidence Engine">
                        <GovernedMetaAnalysisEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Randomized Trial Evidence Engine">
                        <GovernedRandomizedTrialEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Observational Study Evidence Engine">
                        <GovernedObservationalStudyEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Case Series Evidence Engine">
                        <GovernedCaseSeriesEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Expert Consensus Evidence Engine">
                        <GovernedExpertConsensusEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Protocol Evidence Engine">
                        <GovernedClinicalProtocolEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Society Recommendation Engine">
                        <GovernedSocietyRecommendationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Uspstf Evidence Engine">
                        <GovernedUspstfEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Nice Evidence Engine">
                        <GovernedNiceEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Aha Evidence Engine">
                        <GovernedAhaEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Esc Evidence Engine">
                        <GovernedEscEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Ada Evidence Engine">
                        <GovernedAdaEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Kdigo Evidence Engine">
                        <GovernedKdigoEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Gina Evidence Engine">
                        <GovernedGinaEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Gold Evidence Engine">
                        <GovernedGoldEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Who Evidence Engine">
                        <GovernedWhoEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Cdc Evidence Engine">
                        <GovernedCdcEvidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Traceability Engine">
                        <GovernedEvidenceTraceabilityEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Versioning Engine">
                        <GovernedEvidenceVersioningEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Provenance Engine">
                        <GovernedEvidenceProvenanceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Consistency Engine">
                        <GovernedEvidenceConsistencyEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Evidence Engine Package">
                        <GovernedClinicalEvidenceEnginePackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Guideline Runtime Engine">
                        <GovernedGuidelineRuntimeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Ada Guideline Engine">
                        <GovernedAdaGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Aha Guideline Engine">
                        <GovernedAhaGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Acc Guideline Engine">
                        <GovernedAccGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Esc Guideline Engine">
                        <GovernedEscGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Kdigo Guideline Engine">
                        <GovernedKdigoGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Gina Guideline Engine">
                        <GovernedGinaGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Gold Guideline Engine">
                        <GovernedGoldGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Who Guideline Engine">
                        <GovernedWhoGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Cdc Guideline Engine">
                        <GovernedCdcGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Uspstf Guideline Engine">
                        <GovernedUspstfGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Nice Guideline Engine">
                        <GovernedNiceGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Aap Guideline Engine">
                        <GovernedAapGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Acog Guideline Engine">
                        <GovernedAcogGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Idsa Guideline Engine">
                        <GovernedIdsaGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Asco Guideline Engine">
                        <GovernedAscoGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Surviving Sepsis Guideline Engine">
                        <GovernedSurvivingSepsisGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Hypertension Guideline Engine">
                        <GovernedHypertensionGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diabetes Guideline Engine">
                        <GovernedDiabetesGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Heart Failure Guideline Engine">
                        <GovernedHeartFailureGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Copd Guideline Engine">
                        <GovernedCopdGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Asthma Guideline Engine">
                        <GovernedAsthmaGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Ckd Guideline Engine">
                        <GovernedCkdGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Preventive Guideline Engine">
                        <GovernedPreventiveGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Vaccination Guideline Engine">
                        <GovernedVaccinationGuidelineEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Guideline Version Engine">
                        <GovernedGuidelineVersionEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Guideline Traceability Engine">
                        <GovernedGuidelineTraceabilityEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Guideline Conflict Resolution Engine">
                        <GovernedGuidelineConflictResolutionEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Guideline Recommendation Engine">
                        <GovernedGuidelineRecommendationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Guidelines Engine Package">
                        <GovernedClinicalGuidelinesEnginePackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Decision Runtime Engine">
                        <GovernedClinicalDecisionRuntimeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Differential Diagnosis Ranking Engine">
                        <GovernedDifferentialDiagnosisRankingEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Differential Prioritization Engine">
                        <GovernedDifferentialPrioritizationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Hypothesis Engine">
                        <GovernedClinicalHypothesisEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Hypothesis Validation Engine">
                        <GovernedHypothesisValidationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Confidence Engine">
                        <GovernedDiagnosticConfidenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Correlation Engine">
                        <GovernedEvidenceCorrelationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Knowledge Correlation Engine">
                        <GovernedKnowledgeCorrelationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Guideline Correlation Engine">
                        <GovernedGuidelineCorrelationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Conflict Detection Engine">
                        <GovernedClinicalConflictDetectionEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Recommendation Prioritization Engine">
                        <GovernedRecommendationPrioritizationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Recommendation Ranking Engine">
                        <GovernedRecommendationRankingEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Recommendation Engine">
                        <GovernedClinicalRecommendationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Action Candidate Engine">
                        <GovernedClinicalActionCandidateEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Gap Detection Engine">
                        <GovernedDiagnosticGapDetectionEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Missing Information Detection Engine">
                        <GovernedMissingInformationDetectionEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Missing Laboratory Detection Engine">
                        <GovernedMissingLaboratoryDetectionEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Missing Imaging Detection Engine">
                        <GovernedMissingImagingDetectionEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Missing History Detection Engine">
                        <GovernedMissingHistoryDetectionEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Consistency Engine">
                        <GovernedClinicalConsistencyEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Coherence Engine">
                        <GovernedClinicalCoherenceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Explainability Engine">
                        <GovernedClinicalExplainabilityEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Transparency Engine">
                        <GovernedClinicalTransparencyEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Traceability Engine">
                        <GovernedClinicalTraceabilityEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Physician Review Preparation Engine">
                        <GovernedPhysicianReviewPreparationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Decision Confidence Aggregation Engine">
                        <GovernedDecisionConfidenceAggregationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Decision Safety Engine">
                        <GovernedDecisionSafetyEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Decision Quality Engine">
                        <GovernedDecisionQualityEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Decision Governance Engine">
                        <GovernedDecisionGovernanceEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Decision System Package">
                        <GovernedClinicalDecisionSystemPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Calculation Runtime Engine">
                        <GovernedCalculationRuntimeEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Bmi Calculation Engine">
                        <GovernedBmiCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Bsa Calculation Engine">
                        <GovernedBsaCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Cockcroft Gault Calculation Engine">
                        <GovernedCockcroftGaultCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Ckd Epi Calculation Engine">
                        <GovernedCkdEpiCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Egfr Calculation Engine">
                        <GovernedEgfrCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Cha2ds2 Vasc Calculation Engine">
                        <GovernedCha2ds2VascCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Has Bled Calculation Engine">
                        <GovernedHasBledCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Ascvd Calculation Engine">
                        <GovernedAscvdCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed News2 Calculation Engine">
                        <GovernedNews2CalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Curb65 Calculation Engine">
                        <GovernedCurb65CalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Qsofa Calculation Engine">
                        <GovernedQsofaCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Wells Dvt Calculation Engine">
                        <GovernedWellsDvtCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Wells Pe Calculation Engine">
                        <GovernedWellsPeCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Perc Calculation Engine">
                        <GovernedPercCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Centor Calculation Engine">
                        <GovernedCentorCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Glasgow Calculation Engine">
                        <GovernedGlasgowCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Nihss Calculation Engine">
                        <GovernedNihssCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Child Pugh Calculation Engine">
                        <GovernedChildPughCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Meld Calculation Engine">
                        <GovernedMeldCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Fib4 Calculation Engine">
                        <GovernedFib4CalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Nafld Score Calculation Engine">
                        <GovernedNafldScoreCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Apgar Calculation Engine">
                        <GovernedApgarCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Framingham Calculation Engine">
                        <GovernedFraminghamCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Timi Calculation Engine">
                        <GovernedTimiCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Heart Score Calculation Engine">
                        <GovernedHeartScoreCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Ottawa Ankle Rules Calculation Engine">
                        <GovernedOttawaAnkleRulesCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Ottawa Knee Rules Calculation Engine">
                        <GovernedOttawaKneeRulesCalculationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Calculation Validation Engine">
                        <GovernedCalculationValidationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Calculation System Package">
                        <GovernedClinicalCalculationSystemPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Patient Timeline Engine Longitudinal Engine">
                        <GovernedPatientTimelineEngineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Evolution Engine Longitudinal Engine">
                        <GovernedClinicalEvolutionEngineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Disease Progression Engine Longitudinal Engine">
                        <GovernedDiseaseProgressionEngineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Medication Timeline Engine Longitudinal Engine">
                        <GovernedMedicationTimelineEngineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Laboratory Trend Engine Longitudinal Engine">
                        <GovernedLaboratoryTrendEngineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Imaging Trend Engine Longitudinal Engine">
                        <GovernedImagingTrendEngineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Vital Signs Trend Engine Longitudinal Engine">
                        <GovernedVitalSignsTrendEngineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Risk Evolution Engine Longitudinal Engine">
                        <GovernedRiskEvolutionEngineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Milestone Engine Longitudinal Engine">
                        <GovernedClinicalMilestoneEngineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Chronic Disease Timeline Longitudinal Engine">
                        <GovernedChronicDiseaseTimelineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Hospitalization Timeline Longitudinal Engine">
                        <GovernedHospitalizationTimelineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Procedure Timeline Longitudinal Engine">
                        <GovernedProcedureTimelineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Vaccination Timeline Longitudinal Engine">
                        <GovernedVaccinationTimelineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Consultation Timeline Longitudinal Engine">
                        <GovernedConsultationTimelineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Care Gap Timeline Longitudinal Engine">
                        <GovernedCareGapTimelineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Outcome Tracking Longitudinal Engine">
                        <GovernedOutcomeTrackingLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Event Timeline Longitudinal Engine">
                        <GovernedClinicalEventTimelineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Patient Journey Engine Longitudinal Engine">
                        <GovernedPatientJourneyEngineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Continuity Of Care Engine Longitudinal Engine">
                        <GovernedContinuityOfCareEngineLongitudinalEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Longitudinal Intelligence Package">
                        <GovernedClinicalLongitudinalIntelligencePackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Medication Optimization Therapeutic Engine">
                        <GovernedMedicationOptimizationTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Dose Optimization Therapeutic Engine">
                        <GovernedDoseOptimizationTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Therapeutic Escalation Therapeutic Engine">
                        <GovernedTherapeuticEscalationTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Therapeutic De Escalation Therapeutic Engine">
                        <GovernedTherapeuticDeEscalationTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Deprescribing Therapeutic Engine">
                        <GovernedDeprescribingTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Medication Reconciliation Therapeutic Engine">
                        <GovernedMedicationReconciliationTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Adherence Analysis Therapeutic Engine">
                        <GovernedAdherenceAnalysisTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Drug Monitoring Therapeutic Engine">
                        <GovernedDrugMonitoringTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Therapeutic Goal Tracking Therapeutic Engine">
                        <GovernedTherapeuticGoalTrackingTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Side Effect Surveillance Therapeutic Engine">
                        <GovernedSideEffectSurveillanceTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Drug Safety Therapeutic Engine">
                        <GovernedDrugSafetyTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Polypharmacy Optimization Therapeutic Engine">
                        <GovernedPolypharmacyOptimizationTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Treatment Response Therapeutic Engine">
                        <GovernedTreatmentResponseTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Monitoring Therapeutic Engine">
                        <GovernedClinicalMonitoringTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Follow Up Optimization Therapeutic Engine">
                        <GovernedFollowUpOptimizationTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Care Pathway Optimization Therapeutic Engine">
                        <GovernedCarePathwayOptimizationTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Therapeutic Recommendations Therapeutic Engine">
                        <GovernedTherapeuticRecommendationsTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Treatment Prioritization Therapeutic Engine">
                        <GovernedTreatmentPrioritizationTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Intervention Planning Therapeutic Engine">
                        <GovernedClinicalInterventionPlanningTherapeuticEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Therapeutic Intelligence Package">
                        <GovernedTherapeuticIntelligencePackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Runtime Diagnostic Intel Engine">
                        <GovernedDiagnosticRuntimeDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Differential Evolution Diagnostic Intel Engine">
                        <GovernedDifferentialEvolutionDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Correlation Diagnostic Intel Engine">
                        <GovernedDiagnosticCorrelationDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Pattern Recognition Diagnostic Intel Engine">
                        <GovernedDiagnosticPatternRecognitionDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Syndromic Recognition Diagnostic Intel Engine">
                        <GovernedSyndromicRecognitionDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Clustering Diagnostic Intel Engine">
                        <GovernedClinicalClusteringDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Missing Diagnosis Detection Diagnostic Intel Engine">
                        <GovernedMissingDiagnosisDetectionDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Consistency Diagnostic Intel Engine">
                        <GovernedDiagnosticConsistencyDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Prioritization Diagnostic Intel Engine">
                        <GovernedDiagnosticPrioritizationDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Confidence Diagnostic Intel Engine">
                        <GovernedDiagnosticConfidenceDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Evidence Diagnostic Intel Engine">
                        <GovernedDiagnosticEvidenceDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Explainability Diagnostic Intel Engine">
                        <GovernedDiagnosticExplainabilityDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Rare Disease Awareness Diagnostic Intel Engine">
                        <GovernedRareDiseaseAwarenessDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Validation Diagnostic Intel Engine">
                        <GovernedDiagnosticValidationDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Timeline Diagnostic Intel Engine">
                        <GovernedDiagnosticTimelineDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Learning Diagnostic Intel Engine">
                        <GovernedDiagnosticLearningDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Alerts Diagnostic Intel Engine">
                        <GovernedDiagnosticAlertsDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Review Diagnostic Intel Engine">
                        <GovernedDiagnosticReviewDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Governance Diagnostic Intel Engine">
                        <GovernedDiagnosticGovernanceDiagnosticIntelEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Intelligence Package">
                        <GovernedDiagnosticIntelligencePackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Population Runtime Population Engine">
                        <GovernedPopulationRuntimePopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Risk Stratification Population Engine">
                        <GovernedRiskStratificationPopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Population Screening Population Engine">
                        <GovernedPopulationScreeningPopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Preventive Coverage Population Engine">
                        <GovernedPreventiveCoveragePopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Vaccination Coverage Population Engine">
                        <GovernedVaccinationCoveragePopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Quality Indicators Population Engine">
                        <GovernedQualityIndicatorsPopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Kpis Population Engine">
                        <GovernedClinicalKpisPopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Population Trends Population Engine">
                        <GovernedPopulationTrendsPopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Outcomes Population Engine">
                        <GovernedClinicalOutcomesPopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Resource Utilization Population Engine">
                        <GovernedResourceUtilizationPopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Disease Burden Population Engine">
                        <GovernedDiseaseBurdenPopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Readmission Risk Population Engine">
                        <GovernedReadmissionRiskPopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Preventive Opportunities Population Engine">
                        <GovernedPreventiveOpportunitiesPopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Chronic Disease Registry Population Engine">
                        <GovernedChronicDiseaseRegistryPopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Population Dashboard Population Engine">
                        <GovernedPopulationDashboardPopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Quality Dashboard Population Engine">
                        <GovernedQualityDashboardPopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Benchmark Population Engine">
                        <GovernedClinicalBenchmarkPopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Population Explainability Population Engine">
                        <GovernedPopulationExplainabilityPopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Population Governance Population Engine">
                        <GovernedPopulationGovernancePopulationEnginePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Population Health Package">
                        <GovernedPopulationHealthPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Orchestrator Runtime">
                        <GovernedClinicalOrchestratorRuntimePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Context Aggregator">
                        <GovernedClinicalContextAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Intelligence Aggregator">
                        <GovernedClinicalIntelligenceAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Knowledge Aggregator">
                        <GovernedKnowledgeAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Evidence Aggregator">
                        <GovernedEvidenceAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Guideline Aggregator">
                        <GovernedGuidelineAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Decision Aggregator">
                        <GovernedDecisionAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Calculation Aggregator">
                        <GovernedCalculationAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Longitudinal Aggregator">
                        <GovernedLongitudinalAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Therapeutic Aggregator">
                        <GovernedTherapeuticAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Diagnostic Aggregator">
                        <GovernedDiagnosticAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Population Aggregator">
                        <GovernedPopulationAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Persistence Aggregator">
                        <GovernedPersistenceAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Reasoning Aggregator">
                        <GovernedReasoningAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Suggestion Aggregator">
                        <GovernedSuggestionAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Rule Aggregator">
                        <GovernedRuleAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Safety Aggregator">
                        <GovernedSafetyAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Governance Aggregator">
                        <GovernedGovernanceAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Audit Aggregator">
                        <GovernedAuditAggregatorPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Ai Orchestrator Package">
                        <GovernedClinicalAiOrchestratorPackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Consultation Workflow">
                        <GovernedClinicalConsultationWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Documentation Workflow">
                        <GovernedClinicalDocumentationWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Reasoning Workflow">
                        <GovernedClinicalReasoningWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Decision Workflow">
                        <GovernedClinicalDecisionWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Intelligence Workflow">
                        <GovernedClinicalIntelligenceWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Knowledge Workflow">
                        <GovernedClinicalKnowledgeWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Evidence Workflow">
                        <GovernedClinicalEvidenceWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Guidelines Workflow">
                        <GovernedClinicalGuidelinesWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Calculation Workflow">
                        <GovernedClinicalCalculationWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Safety Workflow">
                        <GovernedClinicalSafetyWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Validation Workflow">
                        <GovernedClinicalValidationWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Physician Review Workflow">
                        <GovernedClinicalPhysicianReviewWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Persistence Workflow">
                        <GovernedClinicalPersistenceWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Audit Workflow">
                        <GovernedClinicalAuditWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Analytics Workflow">
                        <GovernedClinicalAnalyticsWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Population Workflow">
                        <GovernedClinicalPopulationWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Marketplace Workflow">
                        <GovernedClinicalMarketplaceWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Dashboard Workflow">
                        <GovernedClinicalDashboardWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Session Workflow">
                        <GovernedClinicalSessionWorkflowPanel />
                      </MedicalCopilotDeferredPanel>
                      <MedicalCopilotDeferredPanel title="Governed Clinical Workflow Engine Package">
                        <GovernedClinicalWorkflowEnginePackagePanel />
                      </MedicalCopilotDeferredPanel>
                      <ClinicalFeedbackPanel />
                      </>
                    ) : null}
                  </div>
                  <MedicalCopilotWorkspace
                    consultationId={consultationId}
                    patientId={patientId}
                  />
                </ClinicalValidationProvider>
              </ClinicalWorkflowProvider>
            </ClinicalVoiceIntelligenceProvider>
          </ClinicalDictationProvider>
        </MedicalCopilotProvider>
      ) : null}
    </div>
  );
}
