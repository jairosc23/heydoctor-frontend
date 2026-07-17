"use client";
import { useCallback, useEffect, useState } from "react";
import { governedVaccinationGuidelineEngineReadAdapter, type GovernedVaccinationGuidelineEngineReadAdapter } from "./governed-vaccination-guideline-engine-adapter";
import type { GovernedVaccinationGuidelineEngineResult } from "./governed-vaccination-guideline-engine";
export type UseGovernedVaccinationGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedVaccinationGuidelineEngineReadAdapter };
export type UseGovernedVaccinationGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedVaccinationGuidelineEngineResult | null; refresh: () => void };
export function useGovernedVaccinationGuidelineEngine(options: UseGovernedVaccinationGuidelineEngineOptions): UseGovernedVaccinationGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedVaccinationGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedVaccinationGuidelineEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
