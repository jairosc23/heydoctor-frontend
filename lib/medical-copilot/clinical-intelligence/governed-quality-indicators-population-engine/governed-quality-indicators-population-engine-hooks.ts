"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedQualityIndicatorsPopulationEngineReadAdapter, type GovernedQualityIndicatorsPopulationEngineReadAdapter } from "./governed-quality-indicators-population-engine-adapter";
import type { GovernedQualityIndicatorsPopulationEngineResult } from "./governed-quality-indicators-population-engine";
export type UseGovernedQualityIndicatorsPopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedQualityIndicatorsPopulationEngineReadAdapter };
export type UseGovernedQualityIndicatorsPopulationEngineResult = { loading: boolean; error: string | null; result: GovernedQualityIndicatorsPopulationEngineResult | null; refresh: () => void };
export function useGovernedQualityIndicatorsPopulationEngine(options: UseGovernedQualityIndicatorsPopulationEngineOptions): UseGovernedQualityIndicatorsPopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedQualityIndicatorsPopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedQualityIndicatorsPopulationEngineResult | null>(null);
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
