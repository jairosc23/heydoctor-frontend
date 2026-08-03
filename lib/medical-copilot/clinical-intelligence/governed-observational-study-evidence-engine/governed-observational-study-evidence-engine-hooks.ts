"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedObservationalStudyEvidenceEngineReadAdapter, type GovernedObservationalStudyEvidenceEngineReadAdapter } from "./governed-observational-study-evidence-engine-adapter";
import type { GovernedObservationalStudyEvidenceEngineResult } from "./governed-observational-study-evidence-engine";
export type UseGovernedObservationalStudyEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedObservationalStudyEvidenceEngineReadAdapter };
export type UseGovernedObservationalStudyEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedObservationalStudyEvidenceEngineResult | null; refresh: () => void };
export function useGovernedObservationalStudyEvidenceEngine(options: UseGovernedObservationalStudyEvidenceEngineOptions): UseGovernedObservationalStudyEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedObservationalStudyEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedObservationalStudyEvidenceEngineResult | null>(null);
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
