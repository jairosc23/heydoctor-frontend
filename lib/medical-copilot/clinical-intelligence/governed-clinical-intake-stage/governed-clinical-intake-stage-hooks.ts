"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalIntakeStageReadAdapter, type GovernedClinicalIntakeStageReadAdapter } from "./governed-clinical-intake-stage-adapter";
import type { GovernedClinicalIntakeStageResult } from "./governed-clinical-intake-stage";
export type UseGovernedClinicalIntakeStageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalIntakeStageReadAdapter };
export type UseGovernedClinicalIntakeStageResult = { loading: boolean; error: string | null; result: GovernedClinicalIntakeStageResult | null; refresh: () => void };
export function useGovernedClinicalIntakeStage(options: UseGovernedClinicalIntakeStageOptions): UseGovernedClinicalIntakeStageResult {
  const { sessionId, enabled = true, adapter = governedClinicalIntakeStageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalIntakeStageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalIntakeStage(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
