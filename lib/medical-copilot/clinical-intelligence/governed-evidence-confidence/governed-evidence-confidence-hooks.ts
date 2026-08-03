"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedEvidenceConfidenceReadAdapter, type GovernedEvidenceConfidenceReadAdapter } from "./governed-evidence-confidence-adapter";
import type { GovernedEvidenceConfidenceResult } from "./governed-evidence-confidence";

export type UseGovernedEvidenceConfidenceOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEvidenceConfidenceReadAdapter };
export type UseGovernedEvidenceConfidenceResult = { loading: boolean; error: string | null; result: GovernedEvidenceConfidenceResult | null; refresh: () => void };

export function useGovernedEvidenceConfidence(options: UseGovernedEvidenceConfidenceOptions): UseGovernedEvidenceConfidenceResult {
  const { sessionId, enabled = true, adapter = governedEvidenceConfidenceReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEvidenceConfidenceResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedEvidenceConfidence(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
