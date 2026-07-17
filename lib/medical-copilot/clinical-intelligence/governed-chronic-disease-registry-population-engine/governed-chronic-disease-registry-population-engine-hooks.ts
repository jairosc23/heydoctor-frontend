"use client";
import { useCallback, useEffect, useState } from "react";
import { governedChronicDiseaseRegistryPopulationEngineReadAdapter, type GovernedChronicDiseaseRegistryPopulationEngineReadAdapter } from "./governed-chronic-disease-registry-population-engine-adapter";
import type { GovernedChronicDiseaseRegistryPopulationEngineResult } from "./governed-chronic-disease-registry-population-engine";
export type UseGovernedChronicDiseaseRegistryPopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedChronicDiseaseRegistryPopulationEngineReadAdapter };
export type UseGovernedChronicDiseaseRegistryPopulationEngineResult = { loading: boolean; error: string | null; result: GovernedChronicDiseaseRegistryPopulationEngineResult | null; refresh: () => void };
export function useGovernedChronicDiseaseRegistryPopulationEngine(options: UseGovernedChronicDiseaseRegistryPopulationEngineOptions): UseGovernedChronicDiseaseRegistryPopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedChronicDiseaseRegistryPopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedChronicDiseaseRegistryPopulationEngineResult | null>(null);
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
