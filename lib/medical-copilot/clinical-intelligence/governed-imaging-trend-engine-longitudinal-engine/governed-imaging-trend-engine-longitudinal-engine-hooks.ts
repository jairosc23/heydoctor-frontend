"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedImagingTrendEngineLongitudinalEngineReadAdapter, type GovernedImagingTrendEngineLongitudinalEngineReadAdapter } from "./governed-imaging-trend-engine-longitudinal-engine-adapter";
import type { GovernedImagingTrendEngineLongitudinalEngineResult } from "./governed-imaging-trend-engine-longitudinal-engine";
export type UseGovernedImagingTrendEngineLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedImagingTrendEngineLongitudinalEngineReadAdapter };
export type UseGovernedImagingTrendEngineLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedImagingTrendEngineLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedImagingTrendEngineLongitudinalEngine(options: UseGovernedImagingTrendEngineLongitudinalEngineOptions): UseGovernedImagingTrendEngineLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedImagingTrendEngineLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedImagingTrendEngineLongitudinalEngineResult | null>(null);
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
