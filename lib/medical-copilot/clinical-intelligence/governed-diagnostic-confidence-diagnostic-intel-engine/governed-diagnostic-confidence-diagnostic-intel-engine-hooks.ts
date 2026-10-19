"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedDiagnosticConfidenceDiagnosticIntelEngineReadAdapter, type GovernedDiagnosticConfidenceDiagnosticIntelEngineReadAdapter } from "./governed-diagnostic-confidence-diagnostic-intel-engine-adapter";
import type { GovernedDiagnosticConfidenceDiagnosticIntelEngineResult } from "./governed-diagnostic-confidence-diagnostic-intel-engine";
export type UseGovernedDiagnosticConfidenceDiagnosticIntelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiagnosticConfidenceDiagnosticIntelEngineReadAdapter };
export type UseGovernedDiagnosticConfidenceDiagnosticIntelEngineResult = { loading: boolean; error: string | null; result: GovernedDiagnosticConfidenceDiagnosticIntelEngineResult | null; refresh: () => void };
export function useGovernedDiagnosticConfidenceDiagnosticIntelEngine(options: UseGovernedDiagnosticConfidenceDiagnosticIntelEngineOptions): UseGovernedDiagnosticConfidenceDiagnosticIntelEngineResult {
  const { sessionId, enabled = true, adapter = governedDiagnosticConfidenceDiagnosticIntelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiagnosticConfidenceDiagnosticIntelEngineResult | null>(null);
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
