"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalScaleKnowledgeEngineReadAdapter, type GovernedClinicalScaleKnowledgeEngineReadAdapter } from "./governed-clinical-scale-knowledge-engine-adapter";
import type { GovernedClinicalScaleKnowledgeEngineResult } from "./governed-clinical-scale-knowledge-engine";
export type UseGovernedClinicalScaleKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalScaleKnowledgeEngineReadAdapter };
export type UseGovernedClinicalScaleKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedClinicalScaleKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedClinicalScaleKnowledgeEngine(options: UseGovernedClinicalScaleKnowledgeEngineOptions): UseGovernedClinicalScaleKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedClinicalScaleKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalScaleKnowledgeEngineResult | null>(null);
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
