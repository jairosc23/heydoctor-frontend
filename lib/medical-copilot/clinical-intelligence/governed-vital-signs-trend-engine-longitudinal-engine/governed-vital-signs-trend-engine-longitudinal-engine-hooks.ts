"use client";
import { useCallback, useEffect, useState } from "react";
import { governedVitalSignsTrendEngineLongitudinalEngineReadAdapter, type GovernedVitalSignsTrendEngineLongitudinalEngineReadAdapter } from "./governed-vital-signs-trend-engine-longitudinal-engine-adapter";
import type { GovernedVitalSignsTrendEngineLongitudinalEngineResult } from "./governed-vital-signs-trend-engine-longitudinal-engine";
export type UseGovernedVitalSignsTrendEngineLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedVitalSignsTrendEngineLongitudinalEngineReadAdapter };
export type UseGovernedVitalSignsTrendEngineLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedVitalSignsTrendEngineLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedVitalSignsTrendEngineLongitudinalEngine(options: UseGovernedVitalSignsTrendEngineLongitudinalEngineOptions): UseGovernedVitalSignsTrendEngineLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedVitalSignsTrendEngineLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedVitalSignsTrendEngineLongitudinalEngineResult | null>(null);
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
