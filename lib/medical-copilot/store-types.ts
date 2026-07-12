import type {
  MedicalCopilotActionSummary,
  MedicalCopilotMemorySummary,
  MedicalCopilotSessionSummary,
  MedicalCopilotTimelineSummary,
  MedicalCopilotWorkspaceSummary,
} from "./types";

/** CP-25 — prepared for REST now; SSE/WebSocket later without API changes. */
export type MedicalCopilotDataSource = "rest" | "sse" | "websocket";

export type MedicalCopilotPhase = "idle" | "loading" | "ready" | "error";

export type MedicalCopilotState = {
  consultationId: string | null;
  patientId: string | null;
  appointmentId: string | null;
  session: MedicalCopilotSessionSummary | null;
  workspace: MedicalCopilotWorkspaceSummary | null;
  timeline: MedicalCopilotTimelineSummary | null;
  memory: MedicalCopilotMemorySummary | null;
  actions: MedicalCopilotActionSummary[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  actionError: string | null;
  busyActionId: string | null;
  phase: MedicalCopilotPhase;
  dataSource: MedicalCopilotDataSource;
  lastSyncedAt: string | null;
};

export type MedicalCopilotBootstrapInput = {
  consultationId: string;
  patientId: string;
  appointmentId?: string | null;
};

export type MedicalCopilotStoreAction =
  | {
      type: "BOOTSTRAP_START";
      payload: MedicalCopilotBootstrapInput;
    }
  | { type: "BOOTSTRAP_SUCCESS"; payload: MedicalCopilotBootstrapSuccess }
  | { type: "BOOTSTRAP_FAILURE"; payload: { error: string } }
  | { type: "REFRESH_START" }
  | { type: "REFRESH_SUCCESS"; payload: MedicalCopilotRefreshPayload }
  | { type: "REFRESH_FAILURE"; payload: { error: string } }
  | { type: "ACTION_BUSY"; payload: { actionId: string } }
  | {
      type: "ACTION_UPDATED";
      payload: { action: MedicalCopilotActionSummary };
    }
  | { type: "ACTION_FAILURE"; payload: { error: string } }
  | { type: "ACTION_IDLE" }
  | { type: "CLEAR_ACTION_ERROR" }
  | { type: "SET_DATA_SOURCE"; payload: { dataSource: MedicalCopilotDataSource } }
  | { type: "RESET" };

export type MedicalCopilotBootstrapSuccess = {
  session: MedicalCopilotSessionSummary;
  workspace: MedicalCopilotWorkspaceSummary | null;
  timeline: MedicalCopilotTimelineSummary | null;
  memory: MedicalCopilotMemorySummary | null;
  actions: MedicalCopilotActionSummary[];
  syncedAt: string;
};

export type MedicalCopilotRefreshPayload = {
  workspace: MedicalCopilotWorkspaceSummary | null;
  timeline: MedicalCopilotTimelineSummary | null;
  memory: MedicalCopilotMemorySummary | null;
  actions: MedicalCopilotActionSummary[];
  syncedAt: string;
};

export const INITIAL_MEDICAL_COPILOT_STATE: MedicalCopilotState = {
  consultationId: null,
  patientId: null,
  appointmentId: null,
  session: null,
  workspace: null,
  timeline: null,
  memory: null,
  actions: [],
  loading: false,
  refreshing: false,
  error: null,
  actionError: null,
  busyActionId: null,
  phase: "idle",
  dataSource: "rest",
  lastSyncedAt: null,
};
