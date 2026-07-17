"use client";
import { useCallback, useEffect, useState } from "react";
import { governedMissingLaboratoryDetectionEngineReadAdapter, type GovernedMissingLaboratoryDetectionEngineReadAdapter } from "./governed-missing-laboratory-detection-decision-engine-adapter";
import type { GovernedMissingLaboratoryDetectionEngineResult } from "./governed-missing-laboratory-detection-decision-engine";
export type UseGovernedMissingLaboratoryDetectionEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedMissingLaboratoryDetectionEngineReadAdapter };
export type UseGovernedMissingLaboratoryDetectionEngineResult = { loading: boolean; error: string | null; result: GovernedMissingLaboratoryDetectionEngineResult | null; refresh: () => void };
export function useGovernedMissingLaboratoryDetectionEngine(options: UseGovernedMissingLaboratoryDetectionEngineOptions): UseGovernedMissingLaboratoryDetectionEngineResult {
  const { sessionId, enabled = true, adapter = governedMissingLaboratoryDetectionEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedMissingLaboratoryDetectionEngineResult | null>(null);
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
