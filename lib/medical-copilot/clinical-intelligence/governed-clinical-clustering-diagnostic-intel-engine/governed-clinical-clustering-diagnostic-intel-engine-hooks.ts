"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalClusteringDiagnosticIntelEngineReadAdapter, type GovernedClinicalClusteringDiagnosticIntelEngineReadAdapter } from "./governed-clinical-clustering-diagnostic-intel-engine-adapter";
import type { GovernedClinicalClusteringDiagnosticIntelEngineResult } from "./governed-clinical-clustering-diagnostic-intel-engine";
export type UseGovernedClinicalClusteringDiagnosticIntelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalClusteringDiagnosticIntelEngineReadAdapter };
export type UseGovernedClinicalClusteringDiagnosticIntelEngineResult = { loading: boolean; error: string | null; result: GovernedClinicalClusteringDiagnosticIntelEngineResult | null; refresh: () => void };
export function useGovernedClinicalClusteringDiagnosticIntelEngine(options: UseGovernedClinicalClusteringDiagnosticIntelEngineOptions): UseGovernedClinicalClusteringDiagnosticIntelEngineResult {
  const { sessionId, enabled = true, adapter = governedClinicalClusteringDiagnosticIntelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalClusteringDiagnosticIntelEngineResult | null>(null);
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
