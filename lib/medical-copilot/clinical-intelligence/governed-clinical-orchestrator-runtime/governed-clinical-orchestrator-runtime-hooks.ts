"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalOrchestratorRuntimeReadAdapter, type GovernedClinicalOrchestratorRuntimeReadAdapter } from "./governed-clinical-orchestrator-runtime-adapter";
import type { GovernedClinicalOrchestratorRuntimeResult } from "./governed-clinical-orchestrator-runtime";
export type UseGovernedClinicalOrchestratorRuntimeOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalOrchestratorRuntimeReadAdapter };
export type UseGovernedClinicalOrchestratorRuntimeResult = { loading: boolean; error: string | null; result: GovernedClinicalOrchestratorRuntimeResult | null; refresh: () => void };
export function useGovernedClinicalOrchestratorRuntime(options: UseGovernedClinicalOrchestratorRuntimeOptions): UseGovernedClinicalOrchestratorRuntimeResult {
  const { sessionId, enabled = true, adapter = governedClinicalOrchestratorRuntimeReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalOrchestratorRuntimeResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false; setLoading(true); setError(null);
    void adapter.get(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
