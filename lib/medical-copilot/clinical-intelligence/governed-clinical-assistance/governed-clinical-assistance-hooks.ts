"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalAssistanceReadAdapter,
  type GovernedClinicalAssistanceReadAdapter,
} from "./governed-clinical-assistance-adapter";
import type { GovernedClinicalAssistanceResult } from "./governed-clinical-assistance";

export type UseGovernedClinicalAssistanceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalAssistanceReadAdapter;
};

export type UseGovernedClinicalAssistanceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalAssistanceResult | null;
  refresh: () => void;
};

export function useGovernedClinicalAssistance(
  options: UseGovernedClinicalAssistanceOptions,
): UseGovernedClinicalAssistanceResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalAssistanceReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalAssistanceResult | null>(
    null,
  );
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
      .getGovernedClinicalAssistance(sessionId)
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
