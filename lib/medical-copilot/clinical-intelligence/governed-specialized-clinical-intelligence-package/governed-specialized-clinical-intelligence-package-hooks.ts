"use client";
import { useCallback, useEffect, useState } from "react";
import { governedSpecializedClinicalIntelligencePackageReadAdapter, type GovernedSpecializedClinicalIntelligencePackageReadAdapter } from "./governed-specialized-clinical-intelligence-package-adapter";
import type { GovernedSpecializedClinicalIntelligencePackageResult } from "./governed-specialized-clinical-intelligence-package";
export type UseGovernedSpecializedClinicalIntelligencePackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedSpecializedClinicalIntelligencePackageReadAdapter };
export type UseGovernedSpecializedClinicalIntelligencePackageResult = { loading: boolean; error: string | null; result: GovernedSpecializedClinicalIntelligencePackageResult | null; refresh: () => void };
export function useGovernedSpecializedClinicalIntelligencePackage(options: UseGovernedSpecializedClinicalIntelligencePackageOptions): UseGovernedSpecializedClinicalIntelligencePackageResult {
  const { sessionId, enabled = true, adapter = governedSpecializedClinicalIntelligencePackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedSpecializedClinicalIntelligencePackageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedSpecializedClinicalIntelligencePackage(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
