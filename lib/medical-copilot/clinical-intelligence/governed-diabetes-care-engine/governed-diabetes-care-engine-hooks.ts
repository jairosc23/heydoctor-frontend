"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDiabetesCareEngineReadAdapter, type GovernedDiabetesCareEngineReadAdapter } from "./governed-diabetes-care-engine-adapter";
import type { GovernedDiabetesCareEngineResult } from "./governed-diabetes-care-engine";
export type UseGovernedDiabetesCareEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiabetesCareEngineReadAdapter };
export type UseGovernedDiabetesCareEngineResult = { loading: boolean; error: string | null; result: GovernedDiabetesCareEngineResult | null; refresh: () => void };
export function useGovernedDiabetesCareEngine(options: UseGovernedDiabetesCareEngineOptions): UseGovernedDiabetesCareEngineResult {
  const { sessionId, enabled = true, adapter = governedDiabetesCareEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiabetesCareEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedDiabetesCareEngine(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
