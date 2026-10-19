"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedPreventiveCareSuggestionsReadAdapter, type GovernedPreventiveCareSuggestionsReadAdapter } from "./governed-preventive-care-suggestions-adapter";
import type { GovernedPreventiveCareSuggestionsResult } from "./governed-preventive-care-suggestions";

export type UseGovernedPreventiveCareSuggestionsOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPreventiveCareSuggestionsReadAdapter };
export type UseGovernedPreventiveCareSuggestionsResult = { loading: boolean; error: string | null; result: GovernedPreventiveCareSuggestionsResult | null; refresh: () => void };

export function useGovernedPreventiveCareSuggestions(options: UseGovernedPreventiveCareSuggestionsOptions): UseGovernedPreventiveCareSuggestionsResult {
  const { sessionId, enabled = true, adapter = governedPreventiveCareSuggestionsReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPreventiveCareSuggestionsResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedPreventiveCareSuggestions(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
