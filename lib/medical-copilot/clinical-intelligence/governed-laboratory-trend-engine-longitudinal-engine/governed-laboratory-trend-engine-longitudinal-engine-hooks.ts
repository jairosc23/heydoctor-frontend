"use client";
import { useCallback, useEffect, useState } from "react";
import { governedLaboratoryTrendEngineLongitudinalEngineReadAdapter, type GovernedLaboratoryTrendEngineLongitudinalEngineReadAdapter } from "./governed-laboratory-trend-engine-longitudinal-engine-adapter";
import type { GovernedLaboratoryTrendEngineLongitudinalEngineResult } from "./governed-laboratory-trend-engine-longitudinal-engine";
export type UseGovernedLaboratoryTrendEngineLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedLaboratoryTrendEngineLongitudinalEngineReadAdapter };
export type UseGovernedLaboratoryTrendEngineLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedLaboratoryTrendEngineLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedLaboratoryTrendEngineLongitudinalEngine(options: UseGovernedLaboratoryTrendEngineLongitudinalEngineOptions): UseGovernedLaboratoryTrendEngineLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedLaboratoryTrendEngineLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedLaboratoryTrendEngineLongitudinalEngineResult | null>(null);
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
