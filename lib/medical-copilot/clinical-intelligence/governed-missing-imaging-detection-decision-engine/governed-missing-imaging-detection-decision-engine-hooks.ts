"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedMissingImagingDetectionEngineReadAdapter, type GovernedMissingImagingDetectionEngineReadAdapter } from "./governed-missing-imaging-detection-decision-engine-adapter";
import type { GovernedMissingImagingDetectionEngineResult } from "./governed-missing-imaging-detection-decision-engine";
export type UseGovernedMissingImagingDetectionEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedMissingImagingDetectionEngineReadAdapter };
export type UseGovernedMissingImagingDetectionEngineResult = { loading: boolean; error: string | null; result: GovernedMissingImagingDetectionEngineResult | null; refresh: () => void };
export function useGovernedMissingImagingDetectionEngine(options: UseGovernedMissingImagingDetectionEngineOptions): UseGovernedMissingImagingDetectionEngineResult {
  const { sessionId, enabled = true, adapter = governedMissingImagingDetectionEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedMissingImagingDetectionEngineResult | null>(null);
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
