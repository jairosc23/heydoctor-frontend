"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedCareGapTimelineLongitudinalEngineReadAdapter, type GovernedCareGapTimelineLongitudinalEngineReadAdapter } from "./governed-care-gap-timeline-longitudinal-engine-adapter";
import type { GovernedCareGapTimelineLongitudinalEngineResult } from "./governed-care-gap-timeline-longitudinal-engine";
export type UseGovernedCareGapTimelineLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCareGapTimelineLongitudinalEngineReadAdapter };
export type UseGovernedCareGapTimelineLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedCareGapTimelineLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedCareGapTimelineLongitudinalEngine(options: UseGovernedCareGapTimelineLongitudinalEngineOptions): UseGovernedCareGapTimelineLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedCareGapTimelineLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCareGapTimelineLongitudinalEngineResult | null>(null);
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
