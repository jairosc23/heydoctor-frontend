"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalCalculationSystemPackageReadAdapter, type GovernedClinicalCalculationSystemPackageReadAdapter } from "./governed-clinical-calculation-system-package-adapter";
import type { GovernedClinicalCalculationSystemPackageResult } from "./governed-clinical-calculation-system-package";
export type UseGovernedClinicalCalculationSystemPackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalCalculationSystemPackageReadAdapter };
export type UseGovernedClinicalCalculationSystemPackageResult = { loading: boolean; error: string | null; result: GovernedClinicalCalculationSystemPackageResult | null; refresh: () => void };
export function useGovernedClinicalCalculationSystemPackage(options: UseGovernedClinicalCalculationSystemPackageOptions): UseGovernedClinicalCalculationSystemPackageResult {
  const { sessionId, enabled = true, adapter = governedClinicalCalculationSystemPackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalCalculationSystemPackageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
