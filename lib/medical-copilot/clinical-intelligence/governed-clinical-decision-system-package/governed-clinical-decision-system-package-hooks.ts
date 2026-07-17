"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalDecisionSystemPackageReadAdapter, type GovernedClinicalDecisionSystemPackageReadAdapter } from "./governed-clinical-decision-system-package-adapter";
import type { GovernedClinicalDecisionSystemPackageResult } from "./governed-clinical-decision-system-package";
export type UseGovernedClinicalDecisionSystemPackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalDecisionSystemPackageReadAdapter };
export type UseGovernedClinicalDecisionSystemPackageResult = { loading: boolean; error: string | null; result: GovernedClinicalDecisionSystemPackageResult | null; refresh: () => void };
export function useGovernedClinicalDecisionSystemPackage(options: UseGovernedClinicalDecisionSystemPackageOptions): UseGovernedClinicalDecisionSystemPackageResult {
  const { sessionId, enabled = true, adapter = governedClinicalDecisionSystemPackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalDecisionSystemPackageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
