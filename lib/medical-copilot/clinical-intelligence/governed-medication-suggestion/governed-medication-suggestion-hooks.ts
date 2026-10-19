"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedMedicationSuggestionReadAdapter, type GovernedMedicationSuggestionReadAdapter } from "./governed-medication-suggestion-adapter";
import type { GovernedMedicationSuggestionResult } from "./governed-medication-suggestion";

export type UseGovernedMedicationSuggestionOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedMedicationSuggestionReadAdapter };
export type UseGovernedMedicationSuggestionResult = { loading: boolean; error: string | null; result: GovernedMedicationSuggestionResult | null; refresh: () => void };

export function useGovernedMedicationSuggestion(options: UseGovernedMedicationSuggestionOptions): UseGovernedMedicationSuggestionResult {
  const { sessionId, enabled = true, adapter = governedMedicationSuggestionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedMedicationSuggestionResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedMedicationSuggestion(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
