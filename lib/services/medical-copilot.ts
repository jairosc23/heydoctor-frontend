/**
 * Re-export Facade API client for Medical Copilot (CP-24).
 * Implementation lives in `lib/medical-copilot/` to keep presentation helpers colocated.
 */
export {
  approveMedicalCopilotAction,
  createMedicalCopilotSession,
  getMedicalCopilotActions,
  getMedicalCopilotMemory,
  getMedicalCopilotSession,
  getMedicalCopilotTimeline,
  getMedicalCopilotWorkspace,
  rejectMedicalCopilotAction,
} from "../medical-copilot/api";

export type * from "../medical-copilot/types";
