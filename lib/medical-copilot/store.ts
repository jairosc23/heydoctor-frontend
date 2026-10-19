import {
  INITIAL_MEDICAL_COPILOT_STATE,
  type MedicalCopilotState,
  type MedicalCopilotStoreAction,
} from "./store-types";

/**
 * CP-25 MedicalCopilotStore reducer — pure, transport-agnostic.
 * Current dataSource is REST; SSE/WebSocket can feed the same actions later.
 */
export function medicalCopilotReducer(
  state: MedicalCopilotState,
  action: MedicalCopilotStoreAction,
): MedicalCopilotState {
  switch (action.type) {
    case "BOOTSTRAP_START":
      return {
        ...INITIAL_MEDICAL_COPILOT_STATE,
        consultationId: action.payload.consultationId,
        patientId: action.payload.patientId,
        appointmentId: action.payload.appointmentId ?? null,
        dataSource: state.dataSource,
        loading: true,
        phase: "loading",
      };
    case "BOOTSTRAP_SUCCESS":
      return {
        ...state,
        session: action.payload.session,
        workspace: action.payload.workspace,
        timeline: action.payload.timeline,
        memory: action.payload.memory,
        actions: action.payload.actions,
        loading: false,
        refreshing: false,
        error: null,
        phase: "ready",
        lastSyncedAt: action.payload.syncedAt,
      };
    case "BOOTSTRAP_FAILURE":
      return {
        ...state,
        loading: false,
        refreshing: false,
        error: action.payload.error,
        phase: "error",
      };
    case "REFRESH_START":
      return {
        ...state,
        refreshing: true,
        error: state.phase === "ready" ? null : state.error,
      };
    case "REFRESH_SUCCESS":
      return {
        ...state,
        workspace: action.payload.workspace,
        timeline: action.payload.timeline,
        memory: action.payload.memory,
        actions: action.payload.actions,
        refreshing: false,
        error: null,
        phase: "ready",
        lastSyncedAt: action.payload.syncedAt,
      };
    case "REFRESH_FAILURE":
      return {
        ...state,
        refreshing: false,
        error: action.payload.error,
      };
    case "ACTION_BUSY":
      return {
        ...state,
        busyActionId: action.payload.actionId,
        actionError: null,
      };
    case "ACTION_UPDATED":
      return {
        ...state,
        actions: state.actions.map((item) =>
          item.actionId === action.payload.action.actionId
            ? action.payload.action
            : item,
        ),
        busyActionId: null,
        actionError: null,
      };
    case "ACTION_FAILURE":
      return {
        ...state,
        busyActionId: null,
        actionError: action.payload.error,
      };
    case "ACTION_IDLE":
      return {
        ...state,
        busyActionId: null,
      };
    case "CLEAR_ACTION_ERROR":
      return {
        ...state,
        actionError: null,
      };
    case "SET_DATA_SOURCE":
      return {
        ...state,
        dataSource: action.payload.dataSource,
      };
    case "RESET":
      return {
        ...INITIAL_MEDICAL_COPILOT_STATE,
        dataSource: state.dataSource,
      };
    default:
      return state;
  }
}

export function createMedicalCopilotStoreState(
  overrides?: Partial<MedicalCopilotState>,
): MedicalCopilotState {
  return {
    ...INITIAL_MEDICAL_COPILOT_STATE,
    ...overrides,
  };
}
