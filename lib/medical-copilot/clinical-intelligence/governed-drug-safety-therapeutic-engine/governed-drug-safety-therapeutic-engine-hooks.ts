"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDrugSafetyTherapeuticEngineReadAdapter, type GovernedDrugSafetyTherapeuticEngineReadAdapter } from "./governed-drug-safety-therapeutic-engine-adapter";
import type { GovernedDrugSafetyTherapeuticEngineResult } from "./governed-drug-safety-therapeutic-engine";
export type UseGovernedDrugSafetyTherapeuticEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDrugSafetyTherapeuticEngineReadAdapter };
export type UseGovernedDrugSafetyTherapeuticEngineResult = { loading: boolean; error: string | null; result: GovernedDrugSafetyTherapeuticEngineResult | null; refresh: () => void };
export function useGovernedDrugSafetyTherapeuticEngine(options: UseGovernedDrugSafetyTherapeuticEngineOptions): UseGovernedDrugSafetyTherapeuticEngineResult {
  const { sessionId, enabled = true, adapter = governedDrugSafetyTherapeuticEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDrugSafetyTherapeuticEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false; setLoading(true); setError(null);
    void adapter.get(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
