"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalExplainabilityEngineReadAdapter, type GovernedClinicalExplainabilityEngineReadAdapter } from "./governed-clinical-explainability-decision-engine-adapter";
import type { GovernedClinicalExplainabilityEngineResult } from "./governed-clinical-explainability-decision-engine";
export type UseGovernedClinicalExplainabilityEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalExplainabilityEngineReadAdapter };
export type UseGovernedClinicalExplainabilityEngineResult = { loading: boolean; error: string | null; result: GovernedClinicalExplainabilityEngineResult | null; refresh: () => void };
export function useGovernedClinicalExplainabilityEngine(options: UseGovernedClinicalExplainabilityEngineOptions): UseGovernedClinicalExplainabilityEngineResult {
  const { sessionId, enabled = true, adapter = governedClinicalExplainabilityEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalExplainabilityEngineResult | null>(null);
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
