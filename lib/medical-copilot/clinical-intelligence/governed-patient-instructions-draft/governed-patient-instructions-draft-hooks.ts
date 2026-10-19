"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPatientInstructionsDraftReadAdapter,
  type GovernedPatientInstructionsDraftReadAdapter,
} from "./governed-patient-instructions-draft-adapter";
import type { GovernedPatientInstructionsDraftResult } from "./governed-patient-instructions-draft";

export type UseGovernedPatientInstructionsDraftOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPatientInstructionsDraftReadAdapter;
};

export type UseGovernedPatientInstructionsDraftResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPatientInstructionsDraftResult | null;
  refresh: () => void;
};

export function useGovernedPatientInstructionsDraft(
  options: UseGovernedPatientInstructionsDraftOptions,
): UseGovernedPatientInstructionsDraftResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPatientInstructionsDraftReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<GovernedPatientInstructionsDraftResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!enabled || !sessionId) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void adapter
      .getGovernedPatientInstructionsDraft(sessionId)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(toAiClinicalUserMessage(err));
          setResult(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [adapter, enabled, sessionId, tick]);

  return { loading, error, result, refresh };
}
