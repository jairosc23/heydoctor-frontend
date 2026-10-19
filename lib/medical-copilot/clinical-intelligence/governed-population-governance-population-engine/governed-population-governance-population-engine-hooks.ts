"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedPopulationGovernancePopulationEngineReadAdapter, type GovernedPopulationGovernancePopulationEngineReadAdapter } from "./governed-population-governance-population-engine-adapter";
import type { GovernedPopulationGovernancePopulationEngineResult } from "./governed-population-governance-population-engine";
export type UseGovernedPopulationGovernancePopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPopulationGovernancePopulationEngineReadAdapter };
export type UseGovernedPopulationGovernancePopulationEngineResult = { loading: boolean; error: string | null; result: GovernedPopulationGovernancePopulationEngineResult | null; refresh: () => void };
export function useGovernedPopulationGovernancePopulationEngine(options: UseGovernedPopulationGovernancePopulationEngineOptions): UseGovernedPopulationGovernancePopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedPopulationGovernancePopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPopulationGovernancePopulationEngineResult | null>(null);
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
