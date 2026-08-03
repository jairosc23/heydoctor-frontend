"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedAsthmaGuidelineEngineReadAdapter, type GovernedAsthmaGuidelineEngineReadAdapter } from "./governed-asthma-guideline-engine-adapter";
import type { GovernedAsthmaGuidelineEngineResult } from "./governed-asthma-guideline-engine";
export type UseGovernedAsthmaGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedAsthmaGuidelineEngineReadAdapter };
export type UseGovernedAsthmaGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedAsthmaGuidelineEngineResult | null; refresh: () => void };
export function useGovernedAsthmaGuidelineEngine(options: UseGovernedAsthmaGuidelineEngineOptions): UseGovernedAsthmaGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedAsthmaGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAsthmaGuidelineEngineResult | null>(null);
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
