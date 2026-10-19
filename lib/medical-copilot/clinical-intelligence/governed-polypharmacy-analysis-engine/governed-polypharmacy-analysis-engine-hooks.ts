"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedPolypharmacyAnalysisEngineReadAdapter, type GovernedPolypharmacyAnalysisEngineReadAdapter } from "./governed-polypharmacy-analysis-engine-adapter";
import type { GovernedPolypharmacyAnalysisEngineResult } from "./governed-polypharmacy-analysis-engine";
export type UseGovernedPolypharmacyAnalysisEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPolypharmacyAnalysisEngineReadAdapter };
export type UseGovernedPolypharmacyAnalysisEngineResult = { loading: boolean; error: string | null; result: GovernedPolypharmacyAnalysisEngineResult | null; refresh: () => void };
export function useGovernedPolypharmacyAnalysisEngine(options: UseGovernedPolypharmacyAnalysisEngineOptions): UseGovernedPolypharmacyAnalysisEngineResult {
  const { sessionId, enabled = true, adapter = governedPolypharmacyAnalysisEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPolypharmacyAnalysisEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedPolypharmacyAnalysisEngine(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
