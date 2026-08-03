"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedDoseOptimizationTherapeuticEngineReadAdapter, type GovernedDoseOptimizationTherapeuticEngineReadAdapter } from "./governed-dose-optimization-therapeutic-engine-adapter";
import type { GovernedDoseOptimizationTherapeuticEngineResult } from "./governed-dose-optimization-therapeutic-engine";
export type UseGovernedDoseOptimizationTherapeuticEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDoseOptimizationTherapeuticEngineReadAdapter };
export type UseGovernedDoseOptimizationTherapeuticEngineResult = { loading: boolean; error: string | null; result: GovernedDoseOptimizationTherapeuticEngineResult | null; refresh: () => void };
export function useGovernedDoseOptimizationTherapeuticEngine(options: UseGovernedDoseOptimizationTherapeuticEngineOptions): UseGovernedDoseOptimizationTherapeuticEngineResult {
  const { sessionId, enabled = true, adapter = governedDoseOptimizationTherapeuticEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDoseOptimizationTherapeuticEngineResult | null>(null);
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
