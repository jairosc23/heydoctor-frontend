"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedChronicDiseaseTimelineLongitudinalEngineReadAdapter, type GovernedChronicDiseaseTimelineLongitudinalEngineReadAdapter } from "./governed-chronic-disease-timeline-longitudinal-engine-adapter";
import type { GovernedChronicDiseaseTimelineLongitudinalEngineResult } from "./governed-chronic-disease-timeline-longitudinal-engine";
export type UseGovernedChronicDiseaseTimelineLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedChronicDiseaseTimelineLongitudinalEngineReadAdapter };
export type UseGovernedChronicDiseaseTimelineLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedChronicDiseaseTimelineLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedChronicDiseaseTimelineLongitudinalEngine(options: UseGovernedChronicDiseaseTimelineLongitudinalEngineOptions): UseGovernedChronicDiseaseTimelineLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedChronicDiseaseTimelineLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedChronicDiseaseTimelineLongitudinalEngineResult | null>(null);
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
