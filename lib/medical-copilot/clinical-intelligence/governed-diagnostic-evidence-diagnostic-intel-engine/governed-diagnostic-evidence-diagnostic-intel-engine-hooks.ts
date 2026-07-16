"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDiagnosticEvidenceDiagnosticIntelEngineReadAdapter, type GovernedDiagnosticEvidenceDiagnosticIntelEngineReadAdapter } from "./governed-diagnostic-evidence-diagnostic-intel-engine-adapter";
import type { GovernedDiagnosticEvidenceDiagnosticIntelEngineResult } from "./governed-diagnostic-evidence-diagnostic-intel-engine";
export type UseGovernedDiagnosticEvidenceDiagnosticIntelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiagnosticEvidenceDiagnosticIntelEngineReadAdapter };
export type UseGovernedDiagnosticEvidenceDiagnosticIntelEngineResult = { loading: boolean; error: string | null; result: GovernedDiagnosticEvidenceDiagnosticIntelEngineResult | null; refresh: () => void };
export function useGovernedDiagnosticEvidenceDiagnosticIntelEngine(options: UseGovernedDiagnosticEvidenceDiagnosticIntelEngineOptions): UseGovernedDiagnosticEvidenceDiagnosticIntelEngineResult {
  const { sessionId, enabled = true, adapter = governedDiagnosticEvidenceDiagnosticIntelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiagnosticEvidenceDiagnosticIntelEngineResult | null>(null);
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
