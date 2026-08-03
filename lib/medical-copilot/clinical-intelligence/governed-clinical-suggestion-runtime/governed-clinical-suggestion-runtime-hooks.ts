"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalSuggestionRuntimeReadAdapter, type GovernedClinicalSuggestionRuntimeReadAdapter } from "./governed-clinical-suggestion-runtime-adapter";
import type { GovernedClinicalSuggestionRuntimeResult } from "./governed-clinical-suggestion-runtime";

export type UseGovernedClinicalSuggestionRuntimeOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalSuggestionRuntimeReadAdapter };
export type UseGovernedClinicalSuggestionRuntimeResult = { loading: boolean; error: string | null; result: GovernedClinicalSuggestionRuntimeResult | null; refresh: () => void };

export function useGovernedClinicalSuggestionRuntime(options: UseGovernedClinicalSuggestionRuntimeOptions): UseGovernedClinicalSuggestionRuntimeResult {
  const { sessionId, enabled = true, adapter = governedClinicalSuggestionRuntimeReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalSuggestionRuntimeResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalSuggestionRuntime(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
