"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalGuidelinesEnginePackageReadAdapter, type GovernedClinicalGuidelinesEnginePackageReadAdapter } from "./governed-clinical-guidelines-engine-package-adapter";
import type { GovernedClinicalGuidelinesEnginePackageResult } from "./governed-clinical-guidelines-engine-package";
export type UseGovernedClinicalGuidelinesEnginePackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalGuidelinesEnginePackageReadAdapter };
export type UseGovernedClinicalGuidelinesEnginePackageResult = { loading: boolean; error: string | null; result: GovernedClinicalGuidelinesEnginePackageResult | null; refresh: () => void };
export function useGovernedClinicalGuidelinesEnginePackage(options: UseGovernedClinicalGuidelinesEnginePackageOptions): UseGovernedClinicalGuidelinesEnginePackageResult {
  const { sessionId, enabled = true, adapter = governedClinicalGuidelinesEnginePackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalGuidelinesEnginePackageResult | null>(null);
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
