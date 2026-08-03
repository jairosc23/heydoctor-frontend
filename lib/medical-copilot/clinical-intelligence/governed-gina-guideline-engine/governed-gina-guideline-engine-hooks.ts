"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedGinaGuidelineEngineReadAdapter, type GovernedGinaGuidelineEngineReadAdapter } from "./governed-gina-guideline-engine-adapter";
import type { GovernedGinaGuidelineEngineResult } from "./governed-gina-guideline-engine";
export type UseGovernedGinaGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedGinaGuidelineEngineReadAdapter };
export type UseGovernedGinaGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedGinaGuidelineEngineResult | null; refresh: () => void };
export function useGovernedGinaGuidelineEngine(options: UseGovernedGinaGuidelineEngineOptions): UseGovernedGinaGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedGinaGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedGinaGuidelineEngineResult | null>(null);
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
