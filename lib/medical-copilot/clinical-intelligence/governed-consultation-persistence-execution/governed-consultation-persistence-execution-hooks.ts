"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedConsultationPersistenceExecutionReadAdapter,
  type GovernedConsultationPersistenceExecutionReadAdapter,
} from "./governed-consultation-persistence-execution-adapter";
import type { GovernedConsultationPersistenceExecutionResult } from "./governed-consultation-persistence-execution";

export type UseGovernedConsultationPersistenceExecutionOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedConsultationPersistenceExecutionReadAdapter;
};

export type UseGovernedConsultationPersistenceExecutionResult = {
  loading: boolean;
  error: string | null;
  result: GovernedConsultationPersistenceExecutionResult | null;
  refresh: () => void;
};

export function useGovernedConsultationPersistenceExecution(options: UseGovernedConsultationPersistenceExecutionOptions): UseGovernedConsultationPersistenceExecutionResult {
  const { sessionId, enabled = true, adapter = governedConsultationPersistenceExecutionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedConsultationPersistenceExecutionResult | null>(null);
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
      .getGovernedConsultationPersistenceExecution(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setResult(null);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);

  return { loading, error, result, refresh };
}
