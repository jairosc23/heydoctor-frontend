"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedConsultationRuntimeReadAdapter,
  type GovernedConsultationRuntimeReadAdapter,
} from "./governed-consultation-runtime-adapter";
import type { GovernedConsultationRuntimeResult } from "./governed-consultation-runtime";

export type UseGovernedConsultationRuntimeOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedConsultationRuntimeReadAdapter;
};

export type UseGovernedConsultationRuntimeResult = {
  loading: boolean;
  error: string | null;
  result: GovernedConsultationRuntimeResult | null;
  refresh: () => void;
};

export function useGovernedConsultationRuntime(
  options: UseGovernedConsultationRuntimeOptions,
): UseGovernedConsultationRuntimeResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedConsultationRuntimeReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedConsultationRuntimeResult | null>(null);
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
      .getGovernedConsultationRuntime(sessionId)
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
