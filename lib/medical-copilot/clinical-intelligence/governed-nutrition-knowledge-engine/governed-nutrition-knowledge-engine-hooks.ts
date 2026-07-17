"use client";
import { useCallback, useEffect, useState } from "react";
import { governedNutritionKnowledgeEngineReadAdapter, type GovernedNutritionKnowledgeEngineReadAdapter } from "./governed-nutrition-knowledge-engine-adapter";
import type { GovernedNutritionKnowledgeEngineResult } from "./governed-nutrition-knowledge-engine";
export type UseGovernedNutritionKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedNutritionKnowledgeEngineReadAdapter };
export type UseGovernedNutritionKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedNutritionKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedNutritionKnowledgeEngine(options: UseGovernedNutritionKnowledgeEngineOptions): UseGovernedNutritionKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedNutritionKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedNutritionKnowledgeEngineResult | null>(null);
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
