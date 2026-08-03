"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedFollowUpSuggestionReadAdapter, type GovernedFollowUpSuggestionReadAdapter } from "./governed-follow-up-suggestion-adapter";
import type { GovernedFollowUpSuggestionResult } from "./governed-follow-up-suggestion";

export type UseGovernedFollowUpSuggestionOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedFollowUpSuggestionReadAdapter };
export type UseGovernedFollowUpSuggestionResult = { loading: boolean; error: string | null; result: GovernedFollowUpSuggestionResult | null; refresh: () => void };

export function useGovernedFollowUpSuggestion(options: UseGovernedFollowUpSuggestionOptions): UseGovernedFollowUpSuggestionResult {
  const { sessionId, enabled = true, adapter = governedFollowUpSuggestionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedFollowUpSuggestionResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedFollowUpSuggestion(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
