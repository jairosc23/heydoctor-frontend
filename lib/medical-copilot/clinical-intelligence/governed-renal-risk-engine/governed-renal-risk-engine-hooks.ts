"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedRenalRiskEngineReadAdapter, type GovernedRenalRiskEngineReadAdapter } from "./governed-renal-risk-engine-adapter";
import type { GovernedRenalRiskEngineResult } from "./governed-renal-risk-engine";
export type UseGovernedRenalRiskEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedRenalRiskEngineReadAdapter };
export type UseGovernedRenalRiskEngineResult = { loading: boolean; error: string | null; result: GovernedRenalRiskEngineResult | null; refresh: () => void };
export function useGovernedRenalRiskEngine(options: UseGovernedRenalRiskEngineOptions): UseGovernedRenalRiskEngineResult {
  const { sessionId, enabled = true, adapter = governedRenalRiskEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedRenalRiskEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedRenalRiskEngine(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
