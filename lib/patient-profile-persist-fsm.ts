/**
 * Unique persistence feedback FSM for Patient Longitudinal Profile (PR-B).
 * Success states only after a confirmed upsert response — never on click alone.
 */

export type ProfilePersistPhase =
  | "clean"
  | "pending"
  | "saving"
  | "saved"
  | "pending_again"
  | "updating"
  | "updated"
  | "error";

export type ProfilePersistEvent =
  | { type: "DIRTY" }
  | { type: "SUBMIT" }
  | { type: "SUCCESS" }
  | { type: "FAILURE"; message?: string }
  | { type: "RETRY" }
  | { type: "ACK_IDLE" }
  | { type: "RESET" };

export type ProfilePersistState = {
  phase: ProfilePersistPhase;
  /** True after at least one successful persist in this session. */
  hasPersistedOnce: boolean;
  errorMessage: string | null;
};

export const PROFILE_PERSIST_LABELS: Record<ProfilePersistPhase, string> = {
  clean: "",
  pending: "Cambios pendientes",
  saving: "Guardando…",
  saved: "Información guardada",
  pending_again: "Cambios pendientes nuevamente",
  updating: "Actualizando…",
  updated: "Información actualizada",
  error: "Error al guardar",
};

export const PROFILE_PERSIST_RETRY_LABEL = "Reintentar";

export function initialProfilePersistState(): ProfilePersistState {
  return {
    phase: "clean",
    hasPersistedOnce: false,
    errorMessage: null,
  };
}

export function reduceProfilePersist(
  state: ProfilePersistState,
  event: ProfilePersistEvent,
): ProfilePersistState {
  switch (event.type) {
    case "RESET":
      return initialProfilePersistState();
    case "DIRTY": {
      if (
        state.phase === "saving" ||
        state.phase === "updating" ||
        state.phase === "error"
      ) {
        return state;
      }
      if (state.hasPersistedOnce) {
        return {
          ...state,
          phase: "pending_again",
          errorMessage: null,
        };
      }
      return { ...state, phase: "pending", errorMessage: null };
    }
    case "SUBMIT":
    case "RETRY": {
      if (state.hasPersistedOnce) {
        return {
          ...state,
          phase: "updating",
          errorMessage: null,
        };
      }
      return { ...state, phase: "saving", errorMessage: null };
    }
    case "SUCCESS": {
      if (state.hasPersistedOnce) {
        return {
          phase: "updated",
          hasPersistedOnce: true,
          errorMessage: null,
        };
      }
      return {
        phase: "saved",
        hasPersistedOnce: true,
        errorMessage: null,
      };
    }
    case "FAILURE":
      return {
        ...state,
        phase: "error",
        errorMessage:
          event.message?.trim() ||
          "No se pudo guardar. Intente nuevamente.",
      };
    case "ACK_IDLE": {
      if (state.phase === "saved" || state.phase === "updated") {
        return { ...state, phase: "clean", errorMessage: null };
      }
      return state;
    }
    default:
      return state;
  }
}

export function profilePersistLabel(state: ProfilePersistState): string {
  if (state.phase === "error") {
    return state.errorMessage
      ? `${PROFILE_PERSIST_LABELS.error}: ${state.errorMessage}`
      : PROFILE_PERSIST_LABELS.error;
  }
  return PROFILE_PERSIST_LABELS[state.phase];
}

export function profilePersistButtonLabel(state: ProfilePersistState): string {
  switch (state.phase) {
    case "saving":
      return PROFILE_PERSIST_LABELS.saving;
    case "updating":
      return PROFILE_PERSIST_LABELS.updating;
    case "saved":
      return PROFILE_PERSIST_LABELS.saved;
    case "updated":
      return PROFILE_PERSIST_LABELS.updated;
    case "error":
      return PROFILE_PERSIST_RETRY_LABEL;
    case "pending":
    case "pending_again":
      return "Guardar cambios";
    default:
      return "Guardar cambios";
  }
}

export function isProfilePersistInFlight(phase: ProfilePersistPhase): boolean {
  return phase === "saving" || phase === "updating";
}
