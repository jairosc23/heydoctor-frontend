"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedDiagnosticReviewDiagnosticIntelEngineReadAdapter, type GovernedDiagnosticReviewDiagnosticIntelEngineReadAdapter } from "./governed-diagnostic-review-diagnostic-intel-engine-adapter";
import type { GovernedDiagnosticReviewDiagnosticIntelEngineResult } from "./governed-diagnostic-review-diagnostic-intel-engine";
export type UseGovernedDiagnosticReviewDiagnosticIntelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiagnosticReviewDiagnosticIntelEngineReadAdapter };
export type UseGovernedDiagnosticReviewDiagnosticIntelEngineResult = { loading: boolean; error: string | null; result: GovernedDiagnosticReviewDiagnosticIntelEngineResult | null; refresh: () => void };
export function useGovernedDiagnosticReviewDiagnosticIntelEngine(options: UseGovernedDiagnosticReviewDiagnosticIntelEngineOptions): UseGovernedDiagnosticReviewDiagnosticIntelEngineResult {
  const { sessionId, enabled = true, adapter = governedDiagnosticReviewDiagnosticIntelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiagnosticReviewDiagnosticIntelEngineResult | null>(null);
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
