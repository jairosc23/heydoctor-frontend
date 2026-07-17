"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalIntelligenceOrchestratorReadAdapter, type ClinicalIntelligenceOrchestratorReadAdapter } from "./clinical-intelligence-orchestrator-adapter";
import type { ClinicalIntelligenceOrchestratorBuilderResult } from "./clinical-intelligence-orchestrator";
export type UseClinicalIntelligenceOrchestratorOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalIntelligenceOrchestratorReadAdapter; };
export type UseClinicalIntelligenceOrchestratorResult = { loading: boolean; error: string | null; result: ClinicalIntelligenceOrchestratorBuilderResult | null; refresh: () => void; };
export function useClinicalIntelligenceOrchestrator(options: UseClinicalIntelligenceOrchestratorOptions): UseClinicalIntelligenceOrchestratorResult {
  const { sessionId, enabled = true, adapter = clinicalIntelligenceOrchestratorReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalIntelligenceOrchestratorBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalIntelligenceOrchestrator(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
