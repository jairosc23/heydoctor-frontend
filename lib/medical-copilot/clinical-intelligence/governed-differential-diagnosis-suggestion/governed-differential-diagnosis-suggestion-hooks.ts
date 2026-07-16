"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDifferentialDiagnosisSuggestionReadAdapter, type GovernedDifferentialDiagnosisSuggestionReadAdapter } from "./governed-differential-diagnosis-suggestion-adapter";
import type { GovernedDifferentialDiagnosisSuggestionResult } from "./governed-differential-diagnosis-suggestion";

export type UseGovernedDifferentialDiagnosisSuggestionOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDifferentialDiagnosisSuggestionReadAdapter };
export type UseGovernedDifferentialDiagnosisSuggestionResult = { loading: boolean; error: string | null; result: GovernedDifferentialDiagnosisSuggestionResult | null; refresh: () => void };

export function useGovernedDifferentialDiagnosisSuggestion(options: UseGovernedDifferentialDiagnosisSuggestionOptions): UseGovernedDifferentialDiagnosisSuggestionResult {
  const { sessionId, enabled = true, adapter = governedDifferentialDiagnosisSuggestionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDifferentialDiagnosisSuggestionResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedDifferentialDiagnosisSuggestion(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
