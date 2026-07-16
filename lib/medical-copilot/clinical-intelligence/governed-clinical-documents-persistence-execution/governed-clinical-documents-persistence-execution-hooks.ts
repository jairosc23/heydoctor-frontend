"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalDocumentsPersistenceExecutionReadAdapter, type GovernedClinicalDocumentsPersistenceExecutionReadAdapter } from "./governed-clinical-documents-persistence-execution-adapter";
import type { GovernedClinicalDocumentsPersistenceExecutionResult } from "./governed-clinical-documents-persistence-execution";
export type UseGovernedClinicalDocumentsPersistenceExecutionOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalDocumentsPersistenceExecutionReadAdapter };
export type UseGovernedClinicalDocumentsPersistenceExecutionResult = { loading: boolean; error: string | null; result: GovernedClinicalDocumentsPersistenceExecutionResult | null; refresh: () => void };
export function useGovernedClinicalDocumentsPersistenceExecution(options: UseGovernedClinicalDocumentsPersistenceExecutionOptions): UseGovernedClinicalDocumentsPersistenceExecutionResult {
  const { sessionId, enabled = true, adapter = governedClinicalDocumentsPersistenceExecutionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalDocumentsPersistenceExecutionResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalDocumentsPersistenceExecution(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
