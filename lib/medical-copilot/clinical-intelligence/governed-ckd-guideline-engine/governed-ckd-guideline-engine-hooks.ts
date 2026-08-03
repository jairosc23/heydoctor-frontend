"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedCkdGuidelineEngineReadAdapter, type GovernedCkdGuidelineEngineReadAdapter } from "./governed-ckd-guideline-engine-adapter";
import type { GovernedCkdGuidelineEngineResult } from "./governed-ckd-guideline-engine";
export type UseGovernedCkdGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedCkdGuidelineEngineReadAdapter };
export type UseGovernedCkdGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedCkdGuidelineEngineResult | null; refresh: () => void };
export function useGovernedCkdGuidelineEngine(options: UseGovernedCkdGuidelineEngineOptions): UseGovernedCkdGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedCkdGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedCkdGuidelineEngineResult | null>(null);
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
