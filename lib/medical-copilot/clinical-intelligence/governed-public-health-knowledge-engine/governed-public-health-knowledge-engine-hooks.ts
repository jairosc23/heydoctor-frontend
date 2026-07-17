"use client";
import { useCallback, useEffect, useState } from "react";
import { governedPublicHealthKnowledgeEngineReadAdapter, type GovernedPublicHealthKnowledgeEngineReadAdapter } from "./governed-public-health-knowledge-engine-adapter";
import type { GovernedPublicHealthKnowledgeEngineResult } from "./governed-public-health-knowledge-engine";
export type UseGovernedPublicHealthKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPublicHealthKnowledgeEngineReadAdapter };
export type UseGovernedPublicHealthKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedPublicHealthKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedPublicHealthKnowledgeEngine(options: UseGovernedPublicHealthKnowledgeEngineOptions): UseGovernedPublicHealthKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedPublicHealthKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPublicHealthKnowledgeEngineResult | null>(null);
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
