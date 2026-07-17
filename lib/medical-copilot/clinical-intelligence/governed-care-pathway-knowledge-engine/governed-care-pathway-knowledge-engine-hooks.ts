"use client";
import { useCallback, useEffect, useState } from "react";
import { governedCarePathwayKnowledgeEngineReadAdapter, type GovernedCarePathwayKnowledgeEngineReadAdapter } from "./governed-care-pathway-knowledge-engine-adapter";
import type { GovernedCarePathwayKnowledgeEngineResult } from "./governed-care-pathway-knowledge-engine";
export type UseGovernedCarePathwayKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCarePathwayKnowledgeEngineReadAdapter };
export type UseGovernedCarePathwayKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedCarePathwayKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedCarePathwayKnowledgeEngine(options: UseGovernedCarePathwayKnowledgeEngineOptions): UseGovernedCarePathwayKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedCarePathwayKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCarePathwayKnowledgeEngineResult | null>(null);
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
