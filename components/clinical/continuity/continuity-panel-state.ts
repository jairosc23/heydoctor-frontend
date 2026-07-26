/**
 * PR-10 C1 — Continuity Panel state machine (pure reducer).
 * I1 — CACHE_HIT / CACHE_MISS are first-class internal events.
 * I2 — Empty derived only via uiStateForContext (no FETCH_EMPTY).
 */

import { uiStateForContext } from "./continuity-panel-empty";
import type {
  ContinuityPanelEvent,
  ContinuityPanelModel,
} from "./continuity-panel.types";

export function createInitialContinuityPanelModel(
  patientId: string,
  encounterId?: string | null,
): ContinuityPanelModel {
  return {
    uiState: "Closed",
    patientId,
    encounterId: encounterId ?? null,
    generationId: 0,
    context: null,
    error: null,
    softError: null,
  };
}

function bump(model: ContinuityPanelModel): ContinuityPanelModel {
  return { ...model, generationId: model.generationId + 1 };
}

function resetClosed(
  patientId: string,
  encounterId?: string | null,
): ContinuityPanelModel {
  return createInitialContinuityPanelModel(patientId, encounterId);
}

export function reduceContinuityPanel(
  state: ContinuityPanelModel,
  event: ContinuityPanelEvent,
): ContinuityPanelModel {
  switch (event.type) {
    case "PATIENT_CHANGE":
      return resetClosed(event.patientId, event.encounterId);

    case "ENCOUNTER_LEAVE":
      return resetClosed(state.patientId, state.encounterId);

    default:
      break;
  }

  switch (state.uiState) {
    case "Closed": {
      if (event.type === "OPEN") {
        return {
          ...bump(state),
          uiState: "Opening",
          error: null,
          softError: null,
        };
      }
      return state;
    }

    case "Dismissed": {
      if (event.type === "REOPEN") {
        return {
          ...bump(state),
          uiState: "Opening",
          error: null,
          softError: null,
        };
      }
      return state;
    }

    case "Opening": {
      if (event.type === "CACHE_HIT") {
        return {
          ...state,
          uiState: "Refreshing",
          context: event.context,
          error: null,
          softError: null,
        };
      }
      if (event.type === "CACHE_MISS") {
        return {
          ...state,
          uiState: "Loading",
          error: null,
          softError: null,
        };
      }
      if (event.type === "DISMISS") {
        return { ...bump(state), uiState: "Dismissed" };
      }
      return state;
    }

    case "Loading": {
      if (event.type === "FETCH_SUCCESS") {
        return {
          ...state,
          uiState: uiStateForContext(event.context),
          context: event.context,
          error: null,
          softError: null,
        };
      }
      if (event.type === "FETCH_ERROR") {
        return {
          ...state,
          uiState: "Error",
          error: event.error,
          softError: null,
        };
      }
      if (event.type === "DISMISS") {
        return { ...bump(state), uiState: "Dismissed" };
      }
      return state;
    }

    case "Loaded":
    case "Empty": {
      if (event.type === "REFRESH") {
        return {
          ...bump(state),
          uiState: "Refreshing",
          softError: null,
        };
      }
      if (event.type === "DISMISS") {
        return { ...bump(state), uiState: "Dismissed" };
      }
      return state;
    }

    case "Refreshing": {
      if (event.type === "FETCH_SUCCESS") {
        return {
          ...state,
          uiState: uiStateForContext(event.context),
          context: event.context,
          error: null,
          softError: null,
        };
      }
      if (event.type === "FETCH_ERROR") {
        // Soft fail — remain Loaded/Empty from last good context
        const prior = state.context
          ? uiStateForContext(state.context)
          : "Empty";
        return {
          ...state,
          uiState: prior,
          softError: event.error,
        };
      }
      if (event.type === "DISMISS") {
        return { ...bump(state), uiState: "Dismissed" };
      }
      return state;
    }

    case "Error": {
      if (event.type === "RETRY") {
        return {
          ...bump(state),
          uiState: "Loading",
          error: null,
          softError: null,
        };
      }
      if (event.type === "DISMISS") {
        return { ...bump(state), uiState: "Dismissed" };
      }
      return state;
    }

    default:
      return state;
  }
}

/** Whether shell body should render (not Closed/Dismissed). */
export function isContinuityPanelVisible(
  uiState: ContinuityPanelModel["uiState"],
): boolean {
  return uiState !== "Closed" && uiState !== "Dismissed";
}

export function canRefresh(uiState: ContinuityPanelModel["uiState"]): boolean {
  return uiState === "Loaded" || uiState === "Empty";
}

export function canRetry(uiState: ContinuityPanelModel["uiState"]): boolean {
  return uiState === "Error";
}
