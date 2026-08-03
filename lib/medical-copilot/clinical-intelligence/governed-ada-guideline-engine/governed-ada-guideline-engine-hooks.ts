"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedAdaGuidelineEngineReadAdapter, type GovernedAdaGuidelineEngineReadAdapter } from "./governed-ada-guideline-engine-adapter";
import type { GovernedAdaGuidelineEngineResult } from "./governed-ada-guideline-engine";
export type UseGovernedAdaGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedAdaGuidelineEngineReadAdapter };
export type UseGovernedAdaGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedAdaGuidelineEngineResult | null; refresh: () => void };
export function useGovernedAdaGuidelineEngine(options: UseGovernedAdaGuidelineEngineOptions): UseGovernedAdaGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedAdaGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAdaGuidelineEngineResult | null>(null);
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
