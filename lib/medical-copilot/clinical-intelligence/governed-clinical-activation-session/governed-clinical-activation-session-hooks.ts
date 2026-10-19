"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalActivationSessionReadAdapter,
  type GovernedClinicalActivationSessionReadAdapter,
} from "./governed-clinical-activation-session-adapter";
import type { GovernedClinicalActivationSessionResult } from "./governed-clinical-activation-session";

export type UseGovernedClinicalActivationSessionOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalActivationSessionReadAdapter;
};

export type UseGovernedClinicalActivationSessionResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalActivationSessionResult | null;
  refresh: () => void;
};

export function useGovernedClinicalActivationSession(
  options: UseGovernedClinicalActivationSessionOptions,
): UseGovernedClinicalActivationSessionResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalActivationSessionReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalActivationSessionResult | null>(null);
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
      .getGovernedClinicalActivationSession(sessionId)
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
