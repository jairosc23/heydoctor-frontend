"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalSuggestionPackageReadAdapter, type GovernedClinicalSuggestionPackageReadAdapter } from "./governed-clinical-suggestion-package-adapter";
import type { GovernedClinicalSuggestionPackageResult } from "./governed-clinical-suggestion-package";

export type UseGovernedClinicalSuggestionPackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalSuggestionPackageReadAdapter };
export type UseGovernedClinicalSuggestionPackageResult = { loading: boolean; error: string | null; result: GovernedClinicalSuggestionPackageResult | null; refresh: () => void };

export function useGovernedClinicalSuggestionPackage(options: UseGovernedClinicalSuggestionPackageOptions): UseGovernedClinicalSuggestionPackageResult {
  const { sessionId, enabled = true, adapter = governedClinicalSuggestionPackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalSuggestionPackageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalSuggestionPackage(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
