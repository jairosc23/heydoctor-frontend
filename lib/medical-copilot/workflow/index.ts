/**
 * CB-1 — Clinical Workflow public surface.
 */

export type {
  ClinicalWorkflowPhase,
  ClinicalWorkflowStatus,
  WorkflowEvent,
  WorkflowProgress,
  WorkflowProgressStep,
  WorkflowProgressStepId,
  WorkflowRecoverableError,
  WorkflowState,
} from "./types";

export {
  CLINICAL_WORKFLOW_GOVERNANCE,
  CLINICAL_WORKFLOW_VERSION,
  INITIAL_WORKFLOW_STATE,
  WORKFLOW_STEP_LABELS,
} from "./types";

export { buildWorkflowProgress } from "./progress";

export {
  createClinicalWorkflowCoordinator,
  reduceClinicalWorkflow,
  type ClinicalWorkflowCoordinator,
} from "./coordinator";
