"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedMissingDiagnosisDetectionDiagnosticIntelEngineReadAdapter, type GovernedMissingDiagnosisDetectionDiagnosticIntelEngineReadAdapter } from "./governed-missing-diagnosis-detection-diagnostic-intel-engine-adapter";
import type { GovernedMissingDiagnosisDetectionDiagnosticIntelEngineResult } from "./governed-missing-diagnosis-detection-diagnostic-intel-engine";
export type UseGovernedMissingDiagnosisDetectionDiagnosticIntelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedMissingDiagnosisDetectionDiagnosticIntelEngineReadAdapter };
export type UseGovernedMissingDiagnosisDetectionDiagnosticIntelEngineResult = { loading: boolean; error: string | null; result: GovernedMissingDiagnosisDetectionDiagnosticIntelEngineResult | null; refresh: () => void };
export function useGovernedMissingDiagnosisDetectionDiagnosticIntelEngine(options: UseGovernedMissingDiagnosisDetectionDiagnosticIntelEngineOptions): UseGovernedMissingDiagnosisDetectionDiagnosticIntelEngineResult {
  const { sessionId, enabled = true, adapter = governedMissingDiagnosisDetectionDiagnosticIntelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedMissingDiagnosisDetectionDiagnosticIntelEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false; setLoading(true); setError(null);
    void adapter.get(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
