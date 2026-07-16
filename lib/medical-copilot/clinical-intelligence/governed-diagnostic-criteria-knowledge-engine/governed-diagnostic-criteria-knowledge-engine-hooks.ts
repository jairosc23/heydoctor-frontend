"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDiagnosticCriteriaKnowledgeEngineReadAdapter, type GovernedDiagnosticCriteriaKnowledgeEngineReadAdapter } from "./governed-diagnostic-criteria-knowledge-engine-adapter";
import type { GovernedDiagnosticCriteriaKnowledgeEngineResult } from "./governed-diagnostic-criteria-knowledge-engine";
export type UseGovernedDiagnosticCriteriaKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiagnosticCriteriaKnowledgeEngineReadAdapter };
export type UseGovernedDiagnosticCriteriaKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedDiagnosticCriteriaKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedDiagnosticCriteriaKnowledgeEngine(options: UseGovernedDiagnosticCriteriaKnowledgeEngineOptions): UseGovernedDiagnosticCriteriaKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedDiagnosticCriteriaKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiagnosticCriteriaKnowledgeEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
