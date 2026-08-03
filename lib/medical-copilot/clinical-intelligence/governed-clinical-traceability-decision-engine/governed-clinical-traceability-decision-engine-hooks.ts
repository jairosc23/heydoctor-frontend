"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalTraceabilityEngineReadAdapter, type GovernedClinicalTraceabilityEngineReadAdapter } from "./governed-clinical-traceability-decision-engine-adapter";
import type { GovernedClinicalTraceabilityEngineResult } from "./governed-clinical-traceability-decision-engine";
export type UseGovernedClinicalTraceabilityEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalTraceabilityEngineReadAdapter };
export type UseGovernedClinicalTraceabilityEngineResult = { loading: boolean; error: string | null; result: GovernedClinicalTraceabilityEngineResult | null; refresh: () => void };
export function useGovernedClinicalTraceabilityEngine(options: UseGovernedClinicalTraceabilityEngineOptions): UseGovernedClinicalTraceabilityEngineResult {
  const { sessionId, enabled = true, adapter = governedClinicalTraceabilityEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalTraceabilityEngineResult | null>(null);
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
