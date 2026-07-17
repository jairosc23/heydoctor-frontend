"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDiagnosticValidationDiagnosticIntelEngineReadAdapter, type GovernedDiagnosticValidationDiagnosticIntelEngineReadAdapter } from "./governed-diagnostic-validation-diagnostic-intel-engine-adapter";
import type { GovernedDiagnosticValidationDiagnosticIntelEngineResult } from "./governed-diagnostic-validation-diagnostic-intel-engine";
export type UseGovernedDiagnosticValidationDiagnosticIntelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiagnosticValidationDiagnosticIntelEngineReadAdapter };
export type UseGovernedDiagnosticValidationDiagnosticIntelEngineResult = { loading: boolean; error: string | null; result: GovernedDiagnosticValidationDiagnosticIntelEngineResult | null; refresh: () => void };
export function useGovernedDiagnosticValidationDiagnosticIntelEngine(options: UseGovernedDiagnosticValidationDiagnosticIntelEngineOptions): UseGovernedDiagnosticValidationDiagnosticIntelEngineResult {
  const { sessionId, enabled = true, adapter = governedDiagnosticValidationDiagnosticIntelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiagnosticValidationDiagnosticIntelEngineResult | null>(null);
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
