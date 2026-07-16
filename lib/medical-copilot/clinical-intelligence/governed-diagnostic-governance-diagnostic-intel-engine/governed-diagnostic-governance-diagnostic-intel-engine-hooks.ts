"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDiagnosticGovernanceDiagnosticIntelEngineReadAdapter, type GovernedDiagnosticGovernanceDiagnosticIntelEngineReadAdapter } from "./governed-diagnostic-governance-diagnostic-intel-engine-adapter";
import type { GovernedDiagnosticGovernanceDiagnosticIntelEngineResult } from "./governed-diagnostic-governance-diagnostic-intel-engine";
export type UseGovernedDiagnosticGovernanceDiagnosticIntelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiagnosticGovernanceDiagnosticIntelEngineReadAdapter };
export type UseGovernedDiagnosticGovernanceDiagnosticIntelEngineResult = { loading: boolean; error: string | null; result: GovernedDiagnosticGovernanceDiagnosticIntelEngineResult | null; refresh: () => void };
export function useGovernedDiagnosticGovernanceDiagnosticIntelEngine(options: UseGovernedDiagnosticGovernanceDiagnosticIntelEngineOptions): UseGovernedDiagnosticGovernanceDiagnosticIntelEngineResult {
  const { sessionId, enabled = true, adapter = governedDiagnosticGovernanceDiagnosticIntelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiagnosticGovernanceDiagnosticIntelEngineResult | null>(null);
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
