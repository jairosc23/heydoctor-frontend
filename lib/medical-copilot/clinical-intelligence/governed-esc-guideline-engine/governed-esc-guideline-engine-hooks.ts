"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedEscGuidelineEngineReadAdapter, type GovernedEscGuidelineEngineReadAdapter } from "./governed-esc-guideline-engine-adapter";
import type { GovernedEscGuidelineEngineResult } from "./governed-esc-guideline-engine";
export type UseGovernedEscGuidelineEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEscGuidelineEngineReadAdapter };
export type UseGovernedEscGuidelineEngineResult = { loading: boolean; error: string | null; result: GovernedEscGuidelineEngineResult | null; refresh: () => void };
export function useGovernedEscGuidelineEngine(options: UseGovernedEscGuidelineEngineOptions): UseGovernedEscGuidelineEngineResult {
  const { sessionId, enabled = true, adapter = governedEscGuidelineEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEscGuidelineEngineResult | null>(null);
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
