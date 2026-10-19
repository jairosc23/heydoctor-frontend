"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedOutcomeTrackingLongitudinalEngineReadAdapter, type GovernedOutcomeTrackingLongitudinalEngineReadAdapter } from "./governed-outcome-tracking-longitudinal-engine-adapter";
import type { GovernedOutcomeTrackingLongitudinalEngineResult } from "./governed-outcome-tracking-longitudinal-engine";
export type UseGovernedOutcomeTrackingLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedOutcomeTrackingLongitudinalEngineReadAdapter };
export type UseGovernedOutcomeTrackingLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedOutcomeTrackingLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedOutcomeTrackingLongitudinalEngine(options: UseGovernedOutcomeTrackingLongitudinalEngineOptions): UseGovernedOutcomeTrackingLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedOutcomeTrackingLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedOutcomeTrackingLongitudinalEngineResult | null>(null);
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
