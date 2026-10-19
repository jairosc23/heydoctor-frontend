"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedAccGuidelineEngineReadAdapter, type GovernedAccGuidelineEngineReadAdapter } from "./governed-acc-guideline-engine-adapter";
import type { GovernedAccGuidelineEngineResult } from "./governed-acc-guideline-engine";
export type UseGovernedAccGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedAccGuidelineEngineReadAdapter };
export type UseGovernedAccGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedAccGuidelineEngineResult | null; refresh: () => void };
export function useGovernedAccGuidelineEngine(options: UseGovernedAccGuidelineEngineOptions): UseGovernedAccGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedAccGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAccGuidelineEngineResult | null>(null);
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
