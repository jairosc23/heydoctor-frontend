"use client";
import { useCallback, useEffect, useState } from "react";
import { governedRandomizedTrialEvidenceEngineReadAdapter, type GovernedRandomizedTrialEvidenceEngineReadAdapter } from "./governed-randomized-trial-evidence-engine-adapter";
import type { GovernedRandomizedTrialEvidenceEngineResult } from "./governed-randomized-trial-evidence-engine";
export type UseGovernedRandomizedTrialEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedRandomizedTrialEvidenceEngineReadAdapter };
export type UseGovernedRandomizedTrialEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedRandomizedTrialEvidenceEngineResult | null; refresh: () => void };
export function useGovernedRandomizedTrialEvidenceEngine(options: UseGovernedRandomizedTrialEvidenceEngineOptions): UseGovernedRandomizedTrialEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedRandomizedTrialEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedRandomizedTrialEvidenceEngineResult | null>(null);
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
