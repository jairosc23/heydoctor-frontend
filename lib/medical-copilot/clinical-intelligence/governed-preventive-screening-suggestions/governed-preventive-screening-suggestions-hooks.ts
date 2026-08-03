"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedPreventiveScreeningSuggestionsReadAdapter, type GovernedPreventiveScreeningSuggestionsReadAdapter } from "./governed-preventive-screening-suggestions-adapter";
import type { GovernedPreventiveScreeningSuggestionsResult } from "./governed-preventive-screening-suggestions";

export type UseGovernedPreventiveScreeningSuggestionsOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPreventiveScreeningSuggestionsReadAdapter };
export type UseGovernedPreventiveScreeningSuggestionsResult = { loading: boolean; error: string | null; result: GovernedPreventiveScreeningSuggestionsResult | null; refresh: () => void };

export function useGovernedPreventiveScreeningSuggestions(options: UseGovernedPreventiveScreeningSuggestionsOptions): UseGovernedPreventiveScreeningSuggestionsResult {
  const { sessionId, enabled = true, adapter = governedPreventiveScreeningSuggestionsReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPreventiveScreeningSuggestionsResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedPreventiveScreeningSuggestions(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
