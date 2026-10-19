"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedGoldGuidelineEngineReadAdapter, type GovernedGoldGuidelineEngineReadAdapter } from "./governed-gold-guideline-engine-adapter";
import type { GovernedGoldGuidelineEngineResult } from "./governed-gold-guideline-engine";
export type UseGovernedGoldGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedGoldGuidelineEngineReadAdapter };
export type UseGovernedGoldGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedGoldGuidelineEngineResult | null; refresh: () => void };
export function useGovernedGoldGuidelineEngine(options: UseGovernedGoldGuidelineEngineOptions): UseGovernedGoldGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedGoldGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedGoldGuidelineEngineResult | null>(null);
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
