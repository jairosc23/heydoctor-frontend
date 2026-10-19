"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedCopdGuidelineEngineReadAdapter, type GovernedCopdGuidelineEngineReadAdapter } from "./governed-copd-guideline-engine-adapter";
import type { GovernedCopdGuidelineEngineResult } from "./governed-copd-guideline-engine";
export type UseGovernedCopdGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCopdGuidelineEngineReadAdapter };
export type UseGovernedCopdGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedCopdGuidelineEngineResult | null; refresh: () => void };
export function useGovernedCopdGuidelineEngine(options: UseGovernedCopdGuidelineEngineOptions): UseGovernedCopdGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedCopdGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCopdGuidelineEngineResult | null>(null);
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
