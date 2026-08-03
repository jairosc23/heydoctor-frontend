"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedGuidelineTraceabilityEngineReadAdapter, type GovernedGuidelineTraceabilityEngineReadAdapter } from "./governed-guideline-traceability-engine-adapter";
import type { GovernedGuidelineTraceabilityEngineResult } from "./governed-guideline-traceability-engine";
export type UseGovernedGuidelineTraceabilityEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedGuidelineTraceabilityEngineReadAdapter };
export type UseGovernedGuidelineTraceabilityEngineResult = { loading: boolean; error: string | null; result: GovernedGuidelineTraceabilityEngineResult | null; refresh: () => void };
export function useGovernedGuidelineTraceabilityEngine(options: UseGovernedGuidelineTraceabilityEngineOptions): UseGovernedGuidelineTraceabilityEngineResult {
  const { sessionId, enabled = true, adapter = governedGuidelineTraceabilityEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedGuidelineTraceabilityEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
