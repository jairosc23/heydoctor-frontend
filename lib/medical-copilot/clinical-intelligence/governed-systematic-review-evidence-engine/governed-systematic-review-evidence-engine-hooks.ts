"use client";
import { useCallback, useEffect, useState } from "react";
import { governedSystematicReviewEvidenceEngineReadAdapter, type GovernedSystematicReviewEvidenceEngineReadAdapter } from "./governed-systematic-review-evidence-engine-adapter";
import type { GovernedSystematicReviewEvidenceEngineResult } from "./governed-systematic-review-evidence-engine";
export type UseGovernedSystematicReviewEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedSystematicReviewEvidenceEngineReadAdapter };
export type UseGovernedSystematicReviewEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedSystematicReviewEvidenceEngineResult | null; refresh: () => void };
export function useGovernedSystematicReviewEvidenceEngine(options: UseGovernedSystematicReviewEvidenceEngineOptions): UseGovernedSystematicReviewEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedSystematicReviewEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedSystematicReviewEvidenceEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
