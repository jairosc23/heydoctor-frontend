"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedDiseaseProgressionEngineLongitudinalEngineReadAdapter, type GovernedDiseaseProgressionEngineLongitudinalEngineReadAdapter } from "./governed-disease-progression-engine-longitudinal-engine-adapter";
import type { GovernedDiseaseProgressionEngineLongitudinalEngineResult } from "./governed-disease-progression-engine-longitudinal-engine";
export type UseGovernedDiseaseProgressionEngineLongitudinalEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiseaseProgressionEngineLongitudinalEngineReadAdapter };
export type UseGovernedDiseaseProgressionEngineLongitudinalEngineResult = { loading: boolean; error: string | null; result: GovernedDiseaseProgressionEngineLongitudinalEngineResult | null; refresh: () => void };
export function useGovernedDiseaseProgressionEngineLongitudinalEngine(options: UseGovernedDiseaseProgressionEngineLongitudinalEngineOptions): UseGovernedDiseaseProgressionEngineLongitudinalEngineResult {
  const { sessionId, enabled = true, adapter = governedDiseaseProgressionEngineLongitudinalEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiseaseProgressionEngineLongitudinalEngineResult | null>(null);
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
