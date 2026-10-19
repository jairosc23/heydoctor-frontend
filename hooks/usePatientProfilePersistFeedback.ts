"use client";

import { useCallback, useReducer } from "react";
import {
  initialProfilePersistState,
  isProfilePersistInFlight,
  profilePersistButtonLabel,
  profilePersistLabel,
  reduceProfilePersist,
  type ProfilePersistState,
} from "@/lib/patient-profile-persist-fsm";

export function usePatientProfilePersistFeedback() {
  const [state, dispatch] = useReducer(
    reduceProfilePersist,
    undefined,
    initialProfilePersistState,
  );

  const markDirty = useCallback(() => {
    dispatch({ type: "DIRTY" });
  }, []);

  const beginPersist = useCallback(() => {
    dispatch({ type: "SUBMIT" });
  }, []);

  const retryPersist = useCallback(() => {
    dispatch({ type: "RETRY" });
  }, []);

  const completeSuccess = useCallback(() => {
    dispatch({ type: "SUCCESS" });
  }, []);

  const fail = useCallback((message?: string) => {
    dispatch({ type: "FAILURE", message });
  }, []);

  const ackIdle = useCallback(() => {
    dispatch({ type: "ACK_IDLE" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    state: state as ProfilePersistState,
    phase: state.phase,
    label: profilePersistLabel(state),
    buttonLabel: profilePersistButtonLabel(state),
    inFlight: isProfilePersistInFlight(state.phase),
    errorMessage: state.errorMessage,
    hasPersistedOnce: state.hasPersistedOnce,
    markDirty,
    beginPersist,
    retryPersist,
    completeSuccess,
    fail,
    ackIdle,
    reset,
  };
}
