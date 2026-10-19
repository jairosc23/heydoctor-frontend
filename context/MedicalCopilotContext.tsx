"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  getMedicalCopilotActions,
  getMedicalCopilotMemory,
  getMedicalCopilotTimeline,
  getMedicalCopilotWorkspace,
} from "@/lib/medical-copilot/api";
import { submitCopilotDisposition } from "@/lib/copilot-disposition/api";
import { bootstrapMedicalCopilotSession } from "@/lib/medical-copilot/bootstrap-session";
import {
  selectActionError,
  selectActions,
  selectArtifactCount,
  selectBusyActionId,
  selectDataSource,
  selectError,
  selectHasError,
  selectIsLoading,
  selectIsReady,
  selectIsRefreshing,
  selectLastSyncedAt,
  selectMemory,
  selectMemoryEntryCount,
  selectPendingActions,
  selectSession,
  selectSortedTimelineEntries,
  selectTimeline,
  selectWorkspace,
} from "@/lib/medical-copilot/selectors";
import { medicalCopilotReducer } from "@/lib/medical-copilot/store";
import {
  INITIAL_MEDICAL_COPILOT_STATE,
  type MedicalCopilotBootstrapInput,
  type MedicalCopilotDataSource,
  type MedicalCopilotState,
} from "@/lib/medical-copilot/store-types";
import type {
  MedicalCopilotActionSummary,
  MedicalCopilotMemorySummary,
  MedicalCopilotSessionSummary,
  MedicalCopilotTimelineEntry,
  MedicalCopilotTimelineSummary,
  MedicalCopilotWorkspaceSummary,
} from "@/lib/medical-copilot/types";
import { envelopeIsOk } from "@/lib/medical-copilot/view-model";

export type MedicalCopilotContextValue = {
  state: MedicalCopilotState;
  bootstrap: (input: MedicalCopilotBootstrapInput) => Promise<void>;
  refresh: () => Promise<void>;
  approveAction: (actionId: string) => Promise<void>;
  rejectAction: (actionId: string, reason?: string) => Promise<void>;
  clearActionError: () => void;
  setDataSource: (dataSource: MedicalCopilotDataSource) => void;
};

const MedicalCopilotContext = createContext<MedicalCopilotContextValue | null>(
  null,
);

async function fetchPanels(sessionId: string) {
  const [workspaceRes, timelineRes, memoryRes, actionsRes] = await Promise.all([
    getMedicalCopilotWorkspace(sessionId),
    getMedicalCopilotTimeline(sessionId),
    getMedicalCopilotMemory(sessionId),
    getMedicalCopilotActions(sessionId),
  ]);

  return {
    workspace: envelopeIsOk(workspaceRes) ? workspaceRes.data.workspace : null,
    timeline: envelopeIsOk(timelineRes) ? timelineRes.data.timeline : null,
    memory: envelopeIsOk(memoryRes) ? memoryRes.data.memory : null,
    actions: envelopeIsOk(actionsRes) ? (actionsRes.data.actions ?? []) : [],
  };
}

export function MedicalCopilotProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    medicalCopilotReducer,
    INITIAL_MEDICAL_COPILOT_STATE,
  );

  const bootstrap = useCallback(async (input: MedicalCopilotBootstrapInput) => {
    dispatch({ type: "BOOTSTRAP_START", payload: input });
    try {
      const result = await bootstrapMedicalCopilotSession({
        consultationId: input.consultationId,
        patientId: input.patientId,
        appointmentId: input.appointmentId,
      });
      if (!result.ok) {
        const suffix = result.authRequired
          ? " Reautentíquese y reintente — la sessionId propiedad se conserva."
          : "";
        throw new Error(`${result.error}${suffix}`);
      }

      dispatch({
        type: "BOOTSTRAP_SUCCESS",
        payload: {
          session: result.session,
          workspace: result.panels.workspace,
          timeline: result.panels.timeline,
          memory: result.panels.memory,
          actions: result.panels.actions,
          syncedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      dispatch({
        type: "BOOTSTRAP_FAILURE",
        payload: { error: getApiErrorMessage(err) },
      });
    }
  }, []);

  const refresh = useCallback(async () => {
    const sessionId = state.session?.sessionId;
    if (!sessionId) return;
    dispatch({ type: "REFRESH_START" });
    try {
      const panels = await fetchPanels(sessionId);
      dispatch({
        type: "REFRESH_SUCCESS",
        payload: {
          ...panels,
          syncedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      dispatch({
        type: "REFRESH_FAILURE",
        payload: { error: getApiErrorMessage(err) },
      });
    }
  }, [state.session?.sessionId]);

  const approveAction = useCallback(async (actionId: string) => {
    dispatch({ type: "ACTION_BUSY", payload: { actionId } });
    try {
      // W1.1 C4 — canonical Dispose channel (never HAB Confirm).
      await submitCopilotDisposition({
        kind: "dispose_accept",
        proposalRef: actionId,
      });
      const action = state.session
        ? selectActions(state).find((a) => a.actionId === actionId)
        : undefined;
      if (action) {
        dispatch({
          type: "ACTION_UPDATED",
          payload: {
            action: { ...action, status: "approved" as typeof action.status },
          },
        });
      }
    } catch (err) {
      dispatch({
        type: "ACTION_FAILURE",
        payload: { error: getApiErrorMessage(err) },
      });
    }
  }, [state]);

  const rejectAction = useCallback(async (actionId: string, reason?: string) => {
    dispatch({ type: "ACTION_BUSY", payload: { actionId } });
    try {
      await submitCopilotDisposition({
        kind: "dispose_reject",
        proposalRef: actionId,
        note: reason,
      });
      const action = selectActions(state).find((a) => a.actionId === actionId);
      if (action) {
        dispatch({
          type: "ACTION_UPDATED",
          payload: {
            action: { ...action, status: "rejected" as typeof action.status },
          },
        });
      }
    } catch (err) {
      dispatch({
        type: "ACTION_FAILURE",
        payload: { error: getApiErrorMessage(err) },
      });
    }
  }, [state]);

  const clearActionError = useCallback(() => {
    dispatch({ type: "CLEAR_ACTION_ERROR" });
  }, []);

  const setDataSource = useCallback((dataSource: MedicalCopilotDataSource) => {
    dispatch({ type: "SET_DATA_SOURCE", payload: { dataSource } });
  }, []);

  const value = useMemo<MedicalCopilotContextValue>(
    () => ({
      state,
      bootstrap,
      refresh,
      approveAction,
      rejectAction,
      clearActionError,
      setDataSource,
    }),
    [
      state,
      bootstrap,
      refresh,
      approveAction,
      rejectAction,
      clearActionError,
      setDataSource,
    ],
  );

  return (
    <MedicalCopilotContext.Provider value={value}>
      {children}
    </MedicalCopilotContext.Provider>
  );
}

function useMedicalCopilotContext(): MedicalCopilotContextValue {
  const ctx = useContext(MedicalCopilotContext);
  if (!ctx) {
    throw new Error(
      "useMedicalCopilot must be used within MedicalCopilotProvider",
    );
  }
  return ctx;
}

export function useMedicalCopilot(): MedicalCopilotContextValue & {
  session: MedicalCopilotSessionSummary | null;
  loading: boolean;
  refreshing: boolean;
  ready: boolean;
  error: string | null;
  hasError: boolean;
  dataSource: MedicalCopilotDataSource;
  lastSyncedAt: string | null;
} {
  const ctx = useMedicalCopilotContext();
  return {
    ...ctx,
    session: selectSession(ctx.state),
    loading: selectIsLoading(ctx.state),
    refreshing: selectIsRefreshing(ctx.state),
    ready: selectIsReady(ctx.state),
    error: selectError(ctx.state),
    hasError: selectHasError(ctx.state),
    dataSource: selectDataSource(ctx.state),
    lastSyncedAt: selectLastSyncedAt(ctx.state),
  };
}

export function useWorkspace(): {
  workspace: MedicalCopilotWorkspaceSummary | null;
  artifactCount: number;
  loading: boolean;
  refreshing: boolean;
} {
  const { state } = useMedicalCopilotContext();
  return {
    workspace: selectWorkspace(state),
    artifactCount: selectArtifactCount(state),
    loading: selectIsLoading(state),
    refreshing: selectIsRefreshing(state),
  };
}

export function useTimeline(): {
  timeline: MedicalCopilotTimelineSummary | null;
  entries: MedicalCopilotTimelineEntry[];
  loading: boolean;
  refreshing: boolean;
} {
  const { state } = useMedicalCopilotContext();
  return {
    timeline: selectTimeline(state),
    entries: selectSortedTimelineEntries(state),
    loading: selectIsLoading(state),
    refreshing: selectIsRefreshing(state),
  };
}

export function useConversationMemory(): {
  memory: MedicalCopilotMemorySummary | null;
  entryCount: number;
  loading: boolean;
  refreshing: boolean;
} {
  const { state } = useMedicalCopilotContext();
  return {
    memory: selectMemory(state),
    entryCount: selectMemoryEntryCount(state),
    loading: selectIsLoading(state),
    refreshing: selectIsRefreshing(state),
  };
}

export function useClinicalActions(): {
  actions: MedicalCopilotActionSummary[];
  pendingActions: MedicalCopilotActionSummary[];
  busyActionId: string | null;
  actionError: string | null;
  approveAction: (actionId: string) => Promise<void>;
  rejectAction: (actionId: string, reason?: string) => Promise<void>;
  clearActionError: () => void;
} {
  const ctx = useMedicalCopilotContext();
  return {
    actions: selectActions(ctx.state),
    pendingActions: selectPendingActions(ctx.state),
    busyActionId: selectBusyActionId(ctx.state),
    actionError: selectActionError(ctx.state),
    approveAction: ctx.approveAction,
    rejectAction: ctx.rejectAction,
    clearActionError: ctx.clearActionError,
  };
}
