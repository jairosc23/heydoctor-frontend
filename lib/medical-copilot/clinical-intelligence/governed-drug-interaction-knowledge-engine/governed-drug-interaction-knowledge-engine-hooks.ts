"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDrugInteractionKnowledgeEngineReadAdapter, type GovernedDrugInteractionKnowledgeEngineReadAdapter } from "./governed-drug-interaction-knowledge-engine-adapter";
import type { GovernedDrugInteractionKnowledgeEngineResult } from "./governed-drug-interaction-knowledge-engine";
export type UseGovernedDrugInteractionKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDrugInteractionKnowledgeEngineReadAdapter };
export type UseGovernedDrugInteractionKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedDrugInteractionKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedDrugInteractionKnowledgeEngine(options: UseGovernedDrugInteractionKnowledgeEngineOptions): UseGovernedDrugInteractionKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedDrugInteractionKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDrugInteractionKnowledgeEngineResult | null>(null);
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
