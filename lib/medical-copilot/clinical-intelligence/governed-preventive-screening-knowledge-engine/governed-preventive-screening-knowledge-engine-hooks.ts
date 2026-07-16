"use client";
import { useCallback, useEffect, useState } from "react";
import { governedPreventiveScreeningKnowledgeEngineReadAdapter, type GovernedPreventiveScreeningKnowledgeEngineReadAdapter } from "./governed-preventive-screening-knowledge-engine-adapter";
import type { GovernedPreventiveScreeningKnowledgeEngineResult } from "./governed-preventive-screening-knowledge-engine";
export type UseGovernedPreventiveScreeningKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPreventiveScreeningKnowledgeEngineReadAdapter };
export type UseGovernedPreventiveScreeningKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedPreventiveScreeningKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedPreventiveScreeningKnowledgeEngine(options: UseGovernedPreventiveScreeningKnowledgeEngineOptions): UseGovernedPreventiveScreeningKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedPreventiveScreeningKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPreventiveScreeningKnowledgeEngineResult | null>(null);
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
