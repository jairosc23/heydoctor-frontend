"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedTherapeuticGoalTrackingTherapeuticEngineReadAdapter, type GovernedTherapeuticGoalTrackingTherapeuticEngineReadAdapter } from "./governed-therapeutic-goal-tracking-therapeutic-engine-adapter";
import type { GovernedTherapeuticGoalTrackingTherapeuticEngineResult } from "./governed-therapeutic-goal-tracking-therapeutic-engine";
export type UseGovernedTherapeuticGoalTrackingTherapeuticEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedTherapeuticGoalTrackingTherapeuticEngineReadAdapter };
export type UseGovernedTherapeuticGoalTrackingTherapeuticEngineResult = { loading: boolean; error: string | null; result: GovernedTherapeuticGoalTrackingTherapeuticEngineResult | null; refresh: () => void };
export function useGovernedTherapeuticGoalTrackingTherapeuticEngine(options: UseGovernedTherapeuticGoalTrackingTherapeuticEngineOptions): UseGovernedTherapeuticGoalTrackingTherapeuticEngineResult {
  const { sessionId, enabled = true, adapter = governedTherapeuticGoalTrackingTherapeuticEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedTherapeuticGoalTrackingTherapeuticEngineResult | null>(null);
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
