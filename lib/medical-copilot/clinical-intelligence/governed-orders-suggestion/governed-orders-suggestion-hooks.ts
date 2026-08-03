"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedOrdersSuggestionReadAdapter, type GovernedOrdersSuggestionReadAdapter } from "./governed-orders-suggestion-adapter";
import type { GovernedOrdersSuggestionResult } from "./governed-orders-suggestion";

export type UseGovernedOrdersSuggestionOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedOrdersSuggestionReadAdapter };
export type UseGovernedOrdersSuggestionResult = { loading: boolean; error: string | null; result: GovernedOrdersSuggestionResult | null; refresh: () => void };

export function useGovernedOrdersSuggestion(options: UseGovernedOrdersSuggestionOptions): UseGovernedOrdersSuggestionResult {
  const { sessionId, enabled = true, adapter = governedOrdersSuggestionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedOrdersSuggestionResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedOrdersSuggestion(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
