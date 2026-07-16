"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDiagnosticAlertsDiagnosticIntelEngineReadAdapter, type GovernedDiagnosticAlertsDiagnosticIntelEngineReadAdapter } from "./governed-diagnostic-alerts-diagnostic-intel-engine-adapter";
import type { GovernedDiagnosticAlertsDiagnosticIntelEngineResult } from "./governed-diagnostic-alerts-diagnostic-intel-engine";
export type UseGovernedDiagnosticAlertsDiagnosticIntelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiagnosticAlertsDiagnosticIntelEngineReadAdapter };
export type UseGovernedDiagnosticAlertsDiagnosticIntelEngineResult = { loading: boolean; error: string | null; result: GovernedDiagnosticAlertsDiagnosticIntelEngineResult | null; refresh: () => void };
export function useGovernedDiagnosticAlertsDiagnosticIntelEngine(options: UseGovernedDiagnosticAlertsDiagnosticIntelEngineOptions): UseGovernedDiagnosticAlertsDiagnosticIntelEngineResult {
  const { sessionId, enabled = true, adapter = governedDiagnosticAlertsDiagnosticIntelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiagnosticAlertsDiagnosticIntelEngineResult | null>(null);
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
