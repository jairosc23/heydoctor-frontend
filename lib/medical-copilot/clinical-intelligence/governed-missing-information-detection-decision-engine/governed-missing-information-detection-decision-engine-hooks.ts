"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedMissingInformationDetectionEngineReadAdapter, type GovernedMissingInformationDetectionEngineReadAdapter } from "./governed-missing-information-detection-decision-engine-adapter";
import type { GovernedMissingInformationDetectionEngineResult } from "./governed-missing-information-detection-decision-engine";
export type UseGovernedMissingInformationDetectionEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedMissingInformationDetectionEngineReadAdapter };
export type UseGovernedMissingInformationDetectionEngineResult = { loading: boolean; error: string | null; result: GovernedMissingInformationDetectionEngineResult | null; refresh: () => void };
export function useGovernedMissingInformationDetectionEngine(options: UseGovernedMissingInformationDetectionEngineOptions): UseGovernedMissingInformationDetectionEngineResult {
  const { sessionId, enabled = true, adapter = governedMissingInformationDetectionEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedMissingInformationDetectionEngineResult | null>(null);
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
