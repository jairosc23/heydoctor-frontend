"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedPolypharmacyOptimizationTherapeuticEngineReadAdapter, type GovernedPolypharmacyOptimizationTherapeuticEngineReadAdapter } from "./governed-polypharmacy-optimization-therapeutic-engine-adapter";
import type { GovernedPolypharmacyOptimizationTherapeuticEngineResult } from "./governed-polypharmacy-optimization-therapeutic-engine";
export type UseGovernedPolypharmacyOptimizationTherapeuticEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPolypharmacyOptimizationTherapeuticEngineReadAdapter };
export type UseGovernedPolypharmacyOptimizationTherapeuticEngineResult = { loading: boolean; error: string | null; result: GovernedPolypharmacyOptimizationTherapeuticEngineResult | null; refresh: () => void };
export function useGovernedPolypharmacyOptimizationTherapeuticEngine(options: UseGovernedPolypharmacyOptimizationTherapeuticEngineOptions): UseGovernedPolypharmacyOptimizationTherapeuticEngineResult {
  const { sessionId, enabled = true, adapter = governedPolypharmacyOptimizationTherapeuticEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPolypharmacyOptimizationTherapeuticEngineResult | null>(null);
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
