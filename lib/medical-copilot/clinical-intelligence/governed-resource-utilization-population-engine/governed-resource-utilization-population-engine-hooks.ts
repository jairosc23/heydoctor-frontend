"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedResourceUtilizationPopulationEngineReadAdapter, type GovernedResourceUtilizationPopulationEngineReadAdapter } from "./governed-resource-utilization-population-engine-adapter";
import type { GovernedResourceUtilizationPopulationEngineResult } from "./governed-resource-utilization-population-engine";
export type UseGovernedResourceUtilizationPopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedResourceUtilizationPopulationEngineReadAdapter };
export type UseGovernedResourceUtilizationPopulationEngineResult = { loading: boolean; error: string | null; result: GovernedResourceUtilizationPopulationEngineResult | null; refresh: () => void };
export function useGovernedResourceUtilizationPopulationEngine(options: UseGovernedResourceUtilizationPopulationEngineOptions): UseGovernedResourceUtilizationPopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedResourceUtilizationPopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedResourceUtilizationPopulationEngineResult | null>(null);
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
