"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedSideEffectSurveillanceTherapeuticEngineReadAdapter, type GovernedSideEffectSurveillanceTherapeuticEngineReadAdapter } from "./governed-side-effect-surveillance-therapeutic-engine-adapter";
import type { GovernedSideEffectSurveillanceTherapeuticEngineResult } from "./governed-side-effect-surveillance-therapeutic-engine";
export type UseGovernedSideEffectSurveillanceTherapeuticEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedSideEffectSurveillanceTherapeuticEngineReadAdapter };
export type UseGovernedSideEffectSurveillanceTherapeuticEngineResult = { loading: boolean; error: string | null; result: GovernedSideEffectSurveillanceTherapeuticEngineResult | null; refresh: () => void };
export function useGovernedSideEffectSurveillanceTherapeuticEngine(options: UseGovernedSideEffectSurveillanceTherapeuticEngineOptions): UseGovernedSideEffectSurveillanceTherapeuticEngineResult {
  const { sessionId, enabled = true, adapter = governedSideEffectSurveillanceTherapeuticEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedSideEffectSurveillanceTherapeuticEngineResult | null>(null);
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
