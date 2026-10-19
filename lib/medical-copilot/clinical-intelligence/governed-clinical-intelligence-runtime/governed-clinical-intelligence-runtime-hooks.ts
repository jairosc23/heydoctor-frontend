"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalIntelligenceRuntimeReadAdapter,
  type GovernedClinicalIntelligenceRuntimeReadAdapter,
} from "./governed-clinical-intelligence-runtime-adapter";
import type { GovernedClinicalIntelligenceRuntimeResult } from "./governed-clinical-intelligence-runtime";

export type UseGovernedClinicalIntelligenceRuntimeOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalIntelligenceRuntimeReadAdapter;
};

export type UseGovernedClinicalIntelligenceRuntimeResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalIntelligenceRuntimeResult | null;
  refresh: () => void;
};

export function useGovernedClinicalIntelligenceRuntime(
  options: UseGovernedClinicalIntelligenceRuntimeOptions,
): UseGovernedClinicalIntelligenceRuntimeResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalIntelligenceRuntimeReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<GovernedClinicalIntelligenceRuntimeResult | null>(null);
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
      .getGovernedClinicalIntelligenceRuntime(sessionId)
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
