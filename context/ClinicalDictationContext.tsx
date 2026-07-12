"use client";

/**
 * CP-31 — ClinicalDictationProvider + public hooks.
 * Visible dictation UX — does not write SOAP/EMR/Store.
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
import {
  createClinicalDictationService,
  type ClinicalDictationService,
} from "@/lib/medical-copilot/dictation/service";
import type {
  ClinicalDictationState,
  DictationBuffer,
  DictationSession,
  DictationStatus,
} from "@/lib/medical-copilot/dictation/types";
import { INITIAL_CLINICAL_DICTATION_STATE } from "@/lib/medical-copilot/dictation/types";
import type { SpeechProvider } from "@/lib/medical-copilot/voice/speech/contracts";

export type ClinicalDictationContextValue = {
  state: ClinicalDictationState;
  session: DictationSession | null;
  buffer: DictationBuffer;
  status: DictationStatus;
  active: boolean;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  cancel: (reason?: string | null) => Promise<void>;
  clearBuffer: () => void;
  setDraft: (draft: string) => void;
  finalize: () => void;
  reset: () => void;
};

const ClinicalDictationContext =
  createContext<ClinicalDictationContextValue | null>(null);

export type ClinicalDictationProviderProps = {
  children: ReactNode;
  consultationId?: string | null;
  /** Injected service or speech provider (tests). */
  service?: ClinicalDictationService;
  speechProvider?: SpeechProvider;
};

export function ClinicalDictationProvider({
  children,
  consultationId = null,
  service: injected,
  speechProvider,
}: ClinicalDictationProviderProps) {
  const service = useMemo(
    () =>
      injected ??
      createClinicalDictationService({
        consultationId,
        speechProvider,
      }),
    [injected, consultationId, speechProvider],
  );

  const [state, setState] = useState<ClinicalDictationState>(
    () => service.getState() ?? INITIAL_CLINICAL_DICTATION_STATE,
  );

  useEffect(() => {
    return service.subscribe(setState);
  }, [service]);

  const start = useCallback(
    () => service.start({ consultationId }),
    [service, consultationId],
  );
  const stop = useCallback(() => service.stop(), [service]);
  const cancel = useCallback(
    (reason?: string | null) => service.cancel(reason),
    [service],
  );
  const clearBuffer = useCallback(() => service.clearBuffer(), [service]);
  const setDraft = useCallback(
    (draft: string) => service.setDraft(draft),
    [service],
  );
  const finalize = useCallback(() => service.finalize(), [service]);
  const reset = useCallback(() => service.reset(), [service]);

  const value = useMemo<ClinicalDictationContextValue>(
    () => ({
      state,
      session: state.session,
      buffer: state.buffer,
      status: state.status,
      active: state.active,
      start,
      stop,
      cancel,
      clearBuffer,
      setDraft,
      finalize,
      reset,
    }),
    [
      state,
      start,
      stop,
      cancel,
      clearBuffer,
      setDraft,
      finalize,
      reset,
    ],
  );

  return (
    <ClinicalDictationContext.Provider value={value}>
      {children}
    </ClinicalDictationContext.Provider>
  );
}

function useClinicalDictationContext(): ClinicalDictationContextValue {
  const ctx = useContext(ClinicalDictationContext);
  if (!ctx) {
    throw new Error(
      "useClinicalDictation must be used within ClinicalDictationProvider",
    );
  }
  return ctx;
}

export function useClinicalDictation(): ClinicalDictationContextValue {
  return useClinicalDictationContext();
}

export function useDictationBuffer(): DictationBuffer {
  return useClinicalDictationContext().buffer;
}

export function useDictationSession(): DictationSession | null {
  return useClinicalDictationContext().session;
}

export function useDictationControls(): Pick<
  ClinicalDictationContextValue,
  | "start"
  | "stop"
  | "cancel"
  | "clearBuffer"
  | "setDraft"
  | "finalize"
  | "reset"
  | "active"
  | "status"
> {
  const ctx = useClinicalDictationContext();
  return {
    start: ctx.start,
    stop: ctx.stop,
    cancel: ctx.cancel,
    clearBuffer: ctx.clearBuffer,
    setDraft: ctx.setDraft,
    finalize: ctx.finalize,
    reset: ctx.reset,
    active: ctx.active,
    status: ctx.status,
  };
}
