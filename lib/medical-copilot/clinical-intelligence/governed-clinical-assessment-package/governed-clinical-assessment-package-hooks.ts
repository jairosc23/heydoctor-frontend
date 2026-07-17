"use client";
import { useCallback, useEffect, useState } from "react";
import { assessmentPackageReadAdapter, type GovernedClinicalAssessmentPackageReadAdapter } from "./governed-clinical-assessment-package-adapter";
import type { GovernedClinicalAssessmentPackageBuilderResult } from "./governed-clinical-assessment-package";

export type UseGovernedClinicalAssessmentPackageOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalAssessmentPackageReadAdapter;
};
export type UseGovernedClinicalAssessmentPackageResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalAssessmentPackageBuilderResult | null;
  refresh: () => void;
};

export function useGovernedClinicalAssessmentPackage(options: UseGovernedClinicalAssessmentPackageOptions): UseGovernedClinicalAssessmentPackageResult {
  const { sessionId, enabled = true, adapter = assessmentPackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalAssessmentPackageBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalAssessmentPackage(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
