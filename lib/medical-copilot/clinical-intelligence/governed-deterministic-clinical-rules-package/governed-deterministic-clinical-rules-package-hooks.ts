"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDeterministicClinicalRulesPackageReadAdapter, type GovernedDeterministicClinicalRulesPackageReadAdapter } from "./governed-deterministic-clinical-rules-package-adapter";
import type { GovernedDeterministicClinicalRulesPackageResult } from "./governed-deterministic-clinical-rules-package";
export type UseGovernedDeterministicClinicalRulesPackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDeterministicClinicalRulesPackageReadAdapter };
export type UseGovernedDeterministicClinicalRulesPackageResult = { loading: boolean; error: string | null; result: GovernedDeterministicClinicalRulesPackageResult | null; refresh: () => void };
export function useGovernedDeterministicClinicalRulesPackage(options: UseGovernedDeterministicClinicalRulesPackageOptions): UseGovernedDeterministicClinicalRulesPackageResult {
  const { sessionId, enabled = true, adapter = governedDeterministicClinicalRulesPackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDeterministicClinicalRulesPackageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedDeterministicClinicalRulesPackage(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
