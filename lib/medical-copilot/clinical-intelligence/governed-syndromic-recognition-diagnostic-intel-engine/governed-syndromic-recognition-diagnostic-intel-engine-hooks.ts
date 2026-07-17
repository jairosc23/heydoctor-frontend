"use client";
import { useCallback, useEffect, useState } from "react";
import { governedSyndromicRecognitionDiagnosticIntelEngineReadAdapter, type GovernedSyndromicRecognitionDiagnosticIntelEngineReadAdapter } from "./governed-syndromic-recognition-diagnostic-intel-engine-adapter";
import type { GovernedSyndromicRecognitionDiagnosticIntelEngineResult } from "./governed-syndromic-recognition-diagnostic-intel-engine";
export type UseGovernedSyndromicRecognitionDiagnosticIntelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedSyndromicRecognitionDiagnosticIntelEngineReadAdapter };
export type UseGovernedSyndromicRecognitionDiagnosticIntelEngineResult = { loading: boolean; error: string | null; result: GovernedSyndromicRecognitionDiagnosticIntelEngineResult | null; refresh: () => void };
export function useGovernedSyndromicRecognitionDiagnosticIntelEngine(options: UseGovernedSyndromicRecognitionDiagnosticIntelEngineOptions): UseGovernedSyndromicRecognitionDiagnosticIntelEngineResult {
  const { sessionId, enabled = true, adapter = governedSyndromicRecognitionDiagnosticIntelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedSyndromicRecognitionDiagnosticIntelEngineResult | null>(null);
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
