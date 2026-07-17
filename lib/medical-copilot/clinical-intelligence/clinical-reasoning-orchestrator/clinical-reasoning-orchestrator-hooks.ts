"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalReasoningOrchestratorReadAdapter, type ClinicalReasoningOrchestratorReadAdapter } from "./clinical-reasoning-orchestrator-adapter";
import type { ClinicalReasoningOrchestratorBuilderResult } from "./clinical-reasoning-orchestrator";
export type UseClinicalReasoningOrchestratorOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalReasoningOrchestratorReadAdapter; };
export type UseClinicalReasoningOrchestratorResult = { loading: boolean; error: string | null; result: ClinicalReasoningOrchestratorBuilderResult | null; refresh: () => void; };
export function useClinicalReasoningOrchestrator(options: UseClinicalReasoningOrchestratorOptions): UseClinicalReasoningOrchestratorResult {
  const { sessionId, enabled = true, adapter = clinicalReasoningOrchestratorReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReasoningOrchestratorBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalReasoningOrchestrator(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
