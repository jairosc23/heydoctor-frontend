"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedEvidenceConfidenceEngineReadAdapter, type GovernedEvidenceConfidenceEngineReadAdapter } from "./governed-evidence-confidence-engine-adapter";
import type { GovernedEvidenceConfidenceEngineResult } from "./governed-evidence-confidence-engine";
export type UseGovernedEvidenceConfidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEvidenceConfidenceEngineReadAdapter };
export type UseGovernedEvidenceConfidenceEngineResult = { loading: boolean; error: string | null; result: GovernedEvidenceConfidenceEngineResult | null; refresh: () => void };
export function useGovernedEvidenceConfidenceEngine(options: UseGovernedEvidenceConfidenceEngineOptions): UseGovernedEvidenceConfidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedEvidenceConfidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEvidenceConfidenceEngineResult | null>(null);
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
