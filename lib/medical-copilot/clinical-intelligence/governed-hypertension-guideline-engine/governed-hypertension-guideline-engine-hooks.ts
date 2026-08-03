"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedHypertensionGuidelineEngineReadAdapter, type GovernedHypertensionGuidelineEngineReadAdapter } from "./governed-hypertension-guideline-engine-adapter";
import type { GovernedHypertensionGuidelineEngineResult } from "./governed-hypertension-guideline-engine";
export type UseGovernedHypertensionGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedHypertensionGuidelineEngineReadAdapter };
export type UseGovernedHypertensionGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedHypertensionGuidelineEngineResult | null; refresh: () => void };
export function useGovernedHypertensionGuidelineEngine(options: UseGovernedHypertensionGuidelineEngineOptions): UseGovernedHypertensionGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedHypertensionGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedHypertensionGuidelineEngineResult | null>(null);
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
