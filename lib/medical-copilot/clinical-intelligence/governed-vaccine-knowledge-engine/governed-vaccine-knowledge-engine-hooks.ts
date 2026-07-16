"use client";
import { useCallback, useEffect, useState } from "react";
import { governedVaccineKnowledgeEngineReadAdapter, type GovernedVaccineKnowledgeEngineReadAdapter } from "./governed-vaccine-knowledge-engine-adapter";
import type { GovernedVaccineKnowledgeEngineResult } from "./governed-vaccine-knowledge-engine";
export type UseGovernedVaccineKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedVaccineKnowledgeEngineReadAdapter };
export type UseGovernedVaccineKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedVaccineKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedVaccineKnowledgeEngine(options: UseGovernedVaccineKnowledgeEngineOptions): UseGovernedVaccineKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedVaccineKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedVaccineKnowledgeEngineResult | null>(null);
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
