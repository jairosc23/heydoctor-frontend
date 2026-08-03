"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedGuidelineCorrelationEngineReadAdapter, type GovernedGuidelineCorrelationEngineReadAdapter } from "./governed-guideline-correlation-decision-engine-adapter";
import type { GovernedGuidelineCorrelationEngineResult } from "./governed-guideline-correlation-decision-engine";
export type UseGovernedGuidelineCorrelationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedGuidelineCorrelationEngineReadAdapter };
export type UseGovernedGuidelineCorrelationEngineResult = { loading: boolean; error: string | null; result: GovernedGuidelineCorrelationEngineResult | null; refresh: () => void };
export function useGovernedGuidelineCorrelationEngine(options: UseGovernedGuidelineCorrelationEngineOptions): UseGovernedGuidelineCorrelationEngineResult {
  const { sessionId, enabled = true, adapter = governedGuidelineCorrelationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedGuidelineCorrelationEngineResult | null>(null);
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
