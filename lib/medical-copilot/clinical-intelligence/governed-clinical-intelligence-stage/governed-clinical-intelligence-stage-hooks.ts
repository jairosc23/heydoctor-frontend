"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalIntelligenceStageReadAdapter, type GovernedClinicalIntelligenceStageReadAdapter } from "./governed-clinical-intelligence-stage-adapter";
import type { GovernedClinicalIntelligenceStageResult } from "./governed-clinical-intelligence-stage";
export type UseGovernedClinicalIntelligenceStageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalIntelligenceStageReadAdapter };
export type UseGovernedClinicalIntelligenceStageResult = { loading: boolean; error: string | null; result: GovernedClinicalIntelligenceStageResult | null; refresh: () => void };
export function useGovernedClinicalIntelligenceStage(options: UseGovernedClinicalIntelligenceStageOptions): UseGovernedClinicalIntelligenceStageResult {
  const { sessionId, enabled = true, adapter = governedClinicalIntelligenceStageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalIntelligenceStageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalIntelligenceStage(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
