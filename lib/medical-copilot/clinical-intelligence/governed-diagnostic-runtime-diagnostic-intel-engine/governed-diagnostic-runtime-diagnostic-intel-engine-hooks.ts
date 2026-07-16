"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDiagnosticRuntimeDiagnosticIntelEngineReadAdapter, type GovernedDiagnosticRuntimeDiagnosticIntelEngineReadAdapter } from "./governed-diagnostic-runtime-diagnostic-intel-engine-adapter";
import type { GovernedDiagnosticRuntimeDiagnosticIntelEngineResult } from "./governed-diagnostic-runtime-diagnostic-intel-engine";
export type UseGovernedDiagnosticRuntimeDiagnosticIntelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiagnosticRuntimeDiagnosticIntelEngineReadAdapter };
export type UseGovernedDiagnosticRuntimeDiagnosticIntelEngineResult = { loading: boolean; error: string | null; result: GovernedDiagnosticRuntimeDiagnosticIntelEngineResult | null; refresh: () => void };
export function useGovernedDiagnosticRuntimeDiagnosticIntelEngine(options: UseGovernedDiagnosticRuntimeDiagnosticIntelEngineOptions): UseGovernedDiagnosticRuntimeDiagnosticIntelEngineResult {
  const { sessionId, enabled = true, adapter = governedDiagnosticRuntimeDiagnosticIntelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiagnosticRuntimeDiagnosticIntelEngineResult | null>(null);
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
