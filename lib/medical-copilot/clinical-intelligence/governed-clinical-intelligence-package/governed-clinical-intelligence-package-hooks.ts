"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalIntelligencePackageReadAdapter, type GovernedClinicalIntelligencePackageReadAdapter } from "./governed-clinical-intelligence-package-adapter";
import type { GovernedClinicalIntelligencePackageBuilderResult } from "./governed-clinical-intelligence-package";

export type UseGovernedClinicalIntelligencePackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalIntelligencePackageReadAdapter };
export type UseGovernedClinicalIntelligencePackageResult = { loading: boolean; error: string | null; result: GovernedClinicalIntelligencePackageBuilderResult | null; refresh: () => void };

export function useGovernedClinicalIntelligencePackage(options: UseGovernedClinicalIntelligencePackageOptions): UseGovernedClinicalIntelligencePackageResult {
  const { sessionId, enabled = true, adapter = governedClinicalIntelligencePackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalIntelligencePackageBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalIntelligencePackage(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
