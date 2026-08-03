"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedUspstfGuidelineEngineReadAdapter, type GovernedUspstfGuidelineEngineReadAdapter } from "./governed-uspstf-guideline-engine-adapter";
import type { GovernedUspstfGuidelineEngineResult } from "./governed-uspstf-guideline-engine";
export type UseGovernedUspstfGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedUspstfGuidelineEngineReadAdapter };
export type UseGovernedUspstfGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedUspstfGuidelineEngineResult | null; refresh: () => void };
export function useGovernedUspstfGuidelineEngine(options: UseGovernedUspstfGuidelineEngineOptions): UseGovernedUspstfGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedUspstfGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedUspstfGuidelineEngineResult | null>(null);
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
