"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedPopulationExplainabilityPopulationEngineReadAdapter, type GovernedPopulationExplainabilityPopulationEngineReadAdapter } from "./governed-population-explainability-population-engine-adapter";
import type { GovernedPopulationExplainabilityPopulationEngineResult } from "./governed-population-explainability-population-engine";
export type UseGovernedPopulationExplainabilityPopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPopulationExplainabilityPopulationEngineReadAdapter };
export type UseGovernedPopulationExplainabilityPopulationEngineResult = { loading: boolean; error: string | null; result: GovernedPopulationExplainabilityPopulationEngineResult | null; refresh: () => void };
export function useGovernedPopulationExplainabilityPopulationEngine(options: UseGovernedPopulationExplainabilityPopulationEngineOptions): UseGovernedPopulationExplainabilityPopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedPopulationExplainabilityPopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPopulationExplainabilityPopulationEngineResult | null>(null);
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
