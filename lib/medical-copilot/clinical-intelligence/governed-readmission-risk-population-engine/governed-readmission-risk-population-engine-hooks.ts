"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedReadmissionRiskPopulationEngineReadAdapter, type GovernedReadmissionRiskPopulationEngineReadAdapter } from "./governed-readmission-risk-population-engine-adapter";
import type { GovernedReadmissionRiskPopulationEngineResult } from "./governed-readmission-risk-population-engine";
export type UseGovernedReadmissionRiskPopulationEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedReadmissionRiskPopulationEngineReadAdapter };
export type UseGovernedReadmissionRiskPopulationEngineResult = { loading: boolean; error: string | null; result: GovernedReadmissionRiskPopulationEngineResult | null; refresh: () => void };
export function useGovernedReadmissionRiskPopulationEngine(options: UseGovernedReadmissionRiskPopulationEngineOptions): UseGovernedReadmissionRiskPopulationEngineResult {
  const { sessionId, enabled = true, adapter = governedReadmissionRiskPopulationEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedReadmissionRiskPopulationEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false; setLoading(true); setError(null);
    void adapter.get(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
