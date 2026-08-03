"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedDiagnosticPrioritizationDiagnosticIntelEngineReadAdapter, type GovernedDiagnosticPrioritizationDiagnosticIntelEngineReadAdapter } from "./governed-diagnostic-prioritization-diagnostic-intel-engine-adapter";
import type { GovernedDiagnosticPrioritizationDiagnosticIntelEngineResult } from "./governed-diagnostic-prioritization-diagnostic-intel-engine";
export type UseGovernedDiagnosticPrioritizationDiagnosticIntelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiagnosticPrioritizationDiagnosticIntelEngineReadAdapter };
export type UseGovernedDiagnosticPrioritizationDiagnosticIntelEngineResult = { loading: boolean; error: string | null; result: GovernedDiagnosticPrioritizationDiagnosticIntelEngineResult | null; refresh: () => void };
export function useGovernedDiagnosticPrioritizationDiagnosticIntelEngine(options: UseGovernedDiagnosticPrioritizationDiagnosticIntelEngineOptions): UseGovernedDiagnosticPrioritizationDiagnosticIntelEngineResult {
  const { sessionId, enabled = true, adapter = governedDiagnosticPrioritizationDiagnosticIntelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiagnosticPrioritizationDiagnosticIntelEngineResult | null>(null);
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
