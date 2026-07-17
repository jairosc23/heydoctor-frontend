"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalFunctionalIntelligencePackageReadAdapter, type GovernedClinicalFunctionalIntelligencePackageReadAdapter } from "./governed-clinical-functional-intelligence-package-adapter";
import type { GovernedClinicalFunctionalIntelligencePackageResult } from "./governed-clinical-functional-intelligence-package";
export type UseGovernedClinicalFunctionalIntelligencePackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalFunctionalIntelligencePackageReadAdapter };
export type UseGovernedClinicalFunctionalIntelligencePackageResult = { loading: boolean; error: string | null; result: GovernedClinicalFunctionalIntelligencePackageResult | null; refresh: () => void };
export function useGovernedClinicalFunctionalIntelligencePackage(options: UseGovernedClinicalFunctionalIntelligencePackageOptions): UseGovernedClinicalFunctionalIntelligencePackageResult {
  const { sessionId, enabled = true, adapter = governedClinicalFunctionalIntelligencePackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalFunctionalIntelligencePackageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false; setLoading(true); setError(null);
    void adapter.getGovernedClinicalFunctionalIntelligencePackage(sessionId).then((next) => { if (!cancelled) setResult(next); }).catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
