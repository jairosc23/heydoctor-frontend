"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDrugMonographKnowledgeEngineReadAdapter, type GovernedDrugMonographKnowledgeEngineReadAdapter } from "./governed-drug-monograph-knowledge-engine-adapter";
import type { GovernedDrugMonographKnowledgeEngineResult } from "./governed-drug-monograph-knowledge-engine";
export type UseGovernedDrugMonographKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDrugMonographKnowledgeEngineReadAdapter };
export type UseGovernedDrugMonographKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedDrugMonographKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedDrugMonographKnowledgeEngine(options: UseGovernedDrugMonographKnowledgeEngineOptions): UseGovernedDrugMonographKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedDrugMonographKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDrugMonographKnowledgeEngineResult | null>(null);
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
