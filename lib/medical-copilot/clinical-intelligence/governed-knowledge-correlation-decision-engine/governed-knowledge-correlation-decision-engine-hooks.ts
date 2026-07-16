"use client";
import { useCallback, useEffect, useState } from "react";
import { governedKnowledgeCorrelationEngineReadAdapter, type GovernedKnowledgeCorrelationEngineReadAdapter } from "./governed-knowledge-correlation-decision-engine-adapter";
import type { GovernedKnowledgeCorrelationEngineResult } from "./governed-knowledge-correlation-decision-engine";
export type UseGovernedKnowledgeCorrelationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedKnowledgeCorrelationEngineReadAdapter };
export type UseGovernedKnowledgeCorrelationEngineResult = { loading: boolean; error: string | null; result: GovernedKnowledgeCorrelationEngineResult | null; refresh: () => void };
export function useGovernedKnowledgeCorrelationEngine(options: UseGovernedKnowledgeCorrelationEngineOptions): UseGovernedKnowledgeCorrelationEngineResult {
  const { sessionId, enabled = true, adapter = governedKnowledgeCorrelationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedKnowledgeCorrelationEngineResult | null>(null);
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
