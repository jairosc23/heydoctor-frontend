"use client";

/**
 * CP-27 — VoiceCopilotProvider + public hooks.
 * UI-facing surface only; does not mount into Medical Copilot Workspace yet.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { VoiceCopilotService } from "@/lib/medical-copilot/voice/contracts";
import { createVoiceCopilotService } from "@/lib/medical-copilot/voice/service";
import type {
  VoiceCopilotState,
  VoiceEngineKind,
} from "@/lib/medical-copilot/voice/types";
import { INITIAL_VOICE_COPILOT_STATE } from "@/lib/medical-copilot/voice/types";

export type VoiceCopilotContextValue = {
  state: VoiceCopilotState;
  service: VoiceCopilotService;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  cancel: (reason?: string | null) => Promise<void>;
  reset: () => void;
  setEngine: (engine: VoiceEngineKind) => void;
};

const VoiceCopilotContext = createContext<VoiceCopilotContextValue | null>(
  null,
);

export type VoiceCopilotProviderProps = {
  children: ReactNode;
  /** Optional injected service (tests / custom engines). */
  service?: VoiceCopilotService;
};

export function VoiceCopilotProvider({
  children,
  service: injected,
}: VoiceCopilotProviderProps) {
  const service = useMemo(
    () => injected ?? createVoiceCopilotService(),
    [injected],
  );
  const [state, setState] = useState<VoiceCopilotState>(
    () => service.getState() ?? INITIAL_VOICE_COPILOT_STATE,
  );

  useEffect(() => {
    return service.subscribe(setState);
  }, [service]);

  const start = useCallback(() => service.start(), [service]);
  const stop = useCallback(() => service.stop(), [service]);
  const cancel = useCallback(
    (reason?: string | null) => service.cancel(reason),
    [service],
  );
  const reset = useCallback(() => service.reset(), [service]);
  const setEngine = useCallback(
    (engine: VoiceEngineKind) => service.setEngine(engine),
    [service],
  );

  const value = useMemo<VoiceCopilotContextValue>(
    () => ({
      state,
      service,
      start,
      stop,
      cancel,
      reset,
      setEngine,
    }),
    [state, service, start, stop, cancel, reset, setEngine],
  );

  return (
    <VoiceCopilotContext.Provider value={value}>
      {children}
    </VoiceCopilotContext.Provider>
  );
}

function useVoiceCopilotContext(): VoiceCopilotContextValue {
  const ctx = useContext(VoiceCopilotContext);
  if (!ctx) {
    throw new Error(
      "useVoiceCopilot must be used within VoiceCopilotProvider",
    );
  }
  return ctx;
}

/** Full Voice Copilot API for future UI producers. */
export function useVoiceCopilot(): VoiceCopilotContextValue {
  return useVoiceCopilotContext();
}

/** State slice only. */
export function useVoiceCopilotState(): VoiceCopilotState {
  return useVoiceCopilotContext().state;
}

/** Control actions without re-subscribing to unused fields in callers. */
export function useVoiceCopilotControls(): Pick<
  VoiceCopilotContextValue,
  "start" | "stop" | "cancel" | "reset" | "setEngine"
> {
  const { start, stop, cancel, reset, setEngine } = useVoiceCopilotContext();
  return { start, stop, cancel, reset, setEngine };
}
