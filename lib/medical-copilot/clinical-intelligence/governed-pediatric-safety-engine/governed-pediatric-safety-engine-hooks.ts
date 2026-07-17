"use client";
import { useCallback, useEffect, useState } from "react";
import { governedPediatricSafetyEngineReadAdapter, type GovernedPediatricSafetyEngineReadAdapter } from "./governed-pediatric-safety-engine-adapter";
import type { GovernedPediatricSafetyEngineResult } from "./governed-pediatric-safety-engine";
export type UseGovernedPediatricSafetyEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPediatricSafetyEngineReadAdapter };
export type UseGovernedPediatricSafetyEngineResult = { loading: boolean; error: string | null; result: GovernedPediatricSafetyEngineResult | null; refresh: () => void };
export function useGovernedPediatricSafetyEngine(options: UseGovernedPediatricSafetyEngineOptions): UseGovernedPediatricSafetyEngineResult {
  const { sessionId, enabled = true, adapter = governedPediatricSafetyEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPediatricSafetyEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedPediatricSafetyEngine(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
