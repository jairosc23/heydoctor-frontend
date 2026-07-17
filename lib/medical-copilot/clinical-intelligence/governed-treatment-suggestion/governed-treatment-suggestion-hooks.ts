"use client";
import { useCallback, useEffect, useState } from "react";
import { governedTreatmentSuggestionReadAdapter, type GovernedTreatmentSuggestionReadAdapter } from "./governed-treatment-suggestion-adapter";
import type { GovernedTreatmentSuggestionResult } from "./governed-treatment-suggestion";

export type UseGovernedTreatmentSuggestionOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedTreatmentSuggestionReadAdapter };
export type UseGovernedTreatmentSuggestionResult = { loading: boolean; error: string | null; result: GovernedTreatmentSuggestionResult | null; refresh: () => void };

export function useGovernedTreatmentSuggestion(options: UseGovernedTreatmentSuggestionOptions): UseGovernedTreatmentSuggestionResult {
  const { sessionId, enabled = true, adapter = governedTreatmentSuggestionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedTreatmentSuggestionResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedTreatmentSuggestion(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
