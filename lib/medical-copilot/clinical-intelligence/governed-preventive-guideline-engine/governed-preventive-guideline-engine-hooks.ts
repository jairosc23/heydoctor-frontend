"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedPreventiveGuidelineEngineReadAdapter, type GovernedPreventiveGuidelineEngineReadAdapter } from "./governed-preventive-guideline-engine-adapter";
import type { GovernedPreventiveGuidelineEngineResult } from "./governed-preventive-guideline-engine";
export type UseGovernedPreventiveGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPreventiveGuidelineEngineReadAdapter };
export type UseGovernedPreventiveGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedPreventiveGuidelineEngineResult | null; refresh: () => void };
export function useGovernedPreventiveGuidelineEngine(options: UseGovernedPreventiveGuidelineEngineOptions): UseGovernedPreventiveGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedPreventiveGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPreventiveGuidelineEngineResult | null>(null);
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
