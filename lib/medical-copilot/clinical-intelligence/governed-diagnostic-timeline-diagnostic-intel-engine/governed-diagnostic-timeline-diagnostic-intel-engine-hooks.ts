"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedDiagnosticTimelineDiagnosticIntelEngineReadAdapter, type GovernedDiagnosticTimelineDiagnosticIntelEngineReadAdapter } from "./governed-diagnostic-timeline-diagnostic-intel-engine-adapter";
import type { GovernedDiagnosticTimelineDiagnosticIntelEngineResult } from "./governed-diagnostic-timeline-diagnostic-intel-engine";
export type UseGovernedDiagnosticTimelineDiagnosticIntelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiagnosticTimelineDiagnosticIntelEngineReadAdapter };
export type UseGovernedDiagnosticTimelineDiagnosticIntelEngineResult = { loading: boolean; error: string | null; result: GovernedDiagnosticTimelineDiagnosticIntelEngineResult | null; refresh: () => void };
export function useGovernedDiagnosticTimelineDiagnosticIntelEngine(options: UseGovernedDiagnosticTimelineDiagnosticIntelEngineOptions): UseGovernedDiagnosticTimelineDiagnosticIntelEngineResult {
  const { sessionId, enabled = true, adapter = governedDiagnosticTimelineDiagnosticIntelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiagnosticTimelineDiagnosticIntelEngineResult | null>(null);
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
