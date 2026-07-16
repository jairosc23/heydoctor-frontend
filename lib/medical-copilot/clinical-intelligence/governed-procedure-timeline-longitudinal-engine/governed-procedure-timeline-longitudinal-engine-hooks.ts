"use client";
import { useCallback, useEffect, useState } from "react";
import { governedProcedureTimelineLongitudinalEngineReadAdapter, type GovernedProcedureTimelineLongitudinalEngineReadAdapter } from "./governed-procedure-timeline-longitudinal-engine-adapter";
import type { GovernedProcedureTimelineLongitudinalEngineResult } from "./governed-procedure-timeline-longitudinal-engine";
export type UseGovernedProcedureTimelineLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedProcedureTimelineLongitudinalEngineReadAdapter };
export type UseGovernedProcedureTimelineLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedProcedureTimelineLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedProcedureTimelineLongitudinalEngine(options: UseGovernedProcedureTimelineLongitudinalEngineOptions): UseGovernedProcedureTimelineLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedProcedureTimelineLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedProcedureTimelineLongitudinalEngineResult | null>(null);
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
