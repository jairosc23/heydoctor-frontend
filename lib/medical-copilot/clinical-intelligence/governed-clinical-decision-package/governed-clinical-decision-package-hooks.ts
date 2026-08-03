"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalDecisionPackageReadAdapter, type GovernedClinicalDecisionPackageReadAdapter } from "./governed-clinical-decision-package-adapter";
import type { GovernedClinicalDecisionPackageResult } from "./governed-clinical-decision-package";

export type UseGovernedClinicalDecisionPackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalDecisionPackageReadAdapter };
export type UseGovernedClinicalDecisionPackageResult = { loading: boolean; error: string | null; result: GovernedClinicalDecisionPackageResult | null; refresh: () => void };

export function useGovernedClinicalDecisionPackage(options: UseGovernedClinicalDecisionPackageOptions): UseGovernedClinicalDecisionPackageResult {
  const { sessionId, enabled = true, adapter = governedClinicalDecisionPackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalDecisionPackageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalDecisionPackage(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
