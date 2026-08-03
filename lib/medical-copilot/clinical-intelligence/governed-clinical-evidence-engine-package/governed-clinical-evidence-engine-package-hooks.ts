"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalEvidenceEnginePackageReadAdapter, type GovernedClinicalEvidenceEnginePackageReadAdapter } from "./governed-clinical-evidence-engine-package-adapter";
import type { GovernedClinicalEvidenceEnginePackageResult } from "./governed-clinical-evidence-engine-package";
export type UseGovernedClinicalEvidenceEnginePackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalEvidenceEnginePackageReadAdapter };
export type UseGovernedClinicalEvidenceEnginePackageResult = { loading: boolean; error: string | null; result: GovernedClinicalEvidenceEnginePackageResult | null; refresh: () => void };
export function useGovernedClinicalEvidenceEnginePackage(options: UseGovernedClinicalEvidenceEnginePackageOptions): UseGovernedClinicalEvidenceEnginePackageResult {
  const { sessionId, enabled = true, adapter = governedClinicalEvidenceEnginePackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalEvidenceEnginePackageResult | null>(null);
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
