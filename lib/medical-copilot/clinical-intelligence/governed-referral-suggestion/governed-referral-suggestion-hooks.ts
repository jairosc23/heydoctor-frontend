"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedReferralSuggestionReadAdapter, type GovernedReferralSuggestionReadAdapter } from "./governed-referral-suggestion-adapter";
import type { GovernedReferralSuggestionResult } from "./governed-referral-suggestion";

export type UseGovernedReferralSuggestionOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedReferralSuggestionReadAdapter };
export type UseGovernedReferralSuggestionResult = { loading: boolean; error: string | null; result: GovernedReferralSuggestionResult | null; refresh: () => void };

export function useGovernedReferralSuggestion(options: UseGovernedReferralSuggestionOptions): UseGovernedReferralSuggestionResult {
  const { sessionId, enabled = true, adapter = governedReferralSuggestionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedReferralSuggestionResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedReferralSuggestion(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
