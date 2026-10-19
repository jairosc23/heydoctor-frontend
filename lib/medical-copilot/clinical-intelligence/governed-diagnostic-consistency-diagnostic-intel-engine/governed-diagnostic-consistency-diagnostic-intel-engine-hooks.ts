"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedDiagnosticConsistencyDiagnosticIntelEngineReadAdapter, type GovernedDiagnosticConsistencyDiagnosticIntelEngineReadAdapter } from "./governed-diagnostic-consistency-diagnostic-intel-engine-adapter";
import type { GovernedDiagnosticConsistencyDiagnosticIntelEngineResult } from "./governed-diagnostic-consistency-diagnostic-intel-engine";
export type UseGovernedDiagnosticConsistencyDiagnosticIntelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiagnosticConsistencyDiagnosticIntelEngineReadAdapter };
export type UseGovernedDiagnosticConsistencyDiagnosticIntelEngineResult = { loading: boolean; error: string | null; result: GovernedDiagnosticConsistencyDiagnosticIntelEngineResult | null; refresh: () => void };
export function useGovernedDiagnosticConsistencyDiagnosticIntelEngine(options: UseGovernedDiagnosticConsistencyDiagnosticIntelEngineOptions): UseGovernedDiagnosticConsistencyDiagnosticIntelEngineResult {
  const { sessionId, enabled = true, adapter = governedDiagnosticConsistencyDiagnosticIntelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiagnosticConsistencyDiagnosticIntelEngineResult | null>(null);
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
