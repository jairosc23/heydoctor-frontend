import {
  actionableActions,
  sortTimelineEntries,
} from "./view-model";
import type { MedicalCopilotState } from "./store-types";
import type {
  MedicalCopilotActionSummary,
  MedicalCopilotTimelineEntry,
} from "./types";

export function selectSession(state: MedicalCopilotState) {
  return state.session;
}

export function selectWorkspace(state: MedicalCopilotState) {
  return state.workspace;
}

export function selectTimeline(state: MedicalCopilotState) {
  return state.timeline;
}

export function selectMemory(state: MedicalCopilotState) {
  return state.memory;
}

export function selectActions(state: MedicalCopilotState) {
  return state.actions;
}

export function selectIsLoading(state: MedicalCopilotState): boolean {
  return state.loading || state.phase === "loading" || state.phase === "idle";
}

export function selectIsRefreshing(state: MedicalCopilotState): boolean {
  return state.refreshing;
}

export function selectIsReady(state: MedicalCopilotState): boolean {
  return state.phase === "ready" && !state.loading;
}

export function selectHasError(state: MedicalCopilotState): boolean {
  return state.phase === "error" || Boolean(state.error);
}

export function selectError(state: MedicalCopilotState): string | null {
  return state.error;
}

export function selectActionError(state: MedicalCopilotState): string | null {
  return state.actionError;
}

export function selectBusyActionId(state: MedicalCopilotState): string | null {
  return state.busyActionId;
}

export function selectSortedTimelineEntries(
  state: MedicalCopilotState,
): MedicalCopilotTimelineEntry[] {
  return sortTimelineEntries(state.timeline?.entries);
}

export function selectPendingActions(
  state: MedicalCopilotState,
): MedicalCopilotActionSummary[] {
  return actionableActions(state.actions);
}

export function selectArtifactCount(state: MedicalCopilotState): number {
  return state.workspace?.artifacts?.length ?? 0;
}

export function selectMemoryEntryCount(state: MedicalCopilotState): number {
  return state.memory?.entries?.length ?? 0;
}

export function selectDataSource(state: MedicalCopilotState) {
  return state.dataSource;
}

export function selectLastSyncedAt(state: MedicalCopilotState): string | null {
  return state.lastSyncedAt;
}
