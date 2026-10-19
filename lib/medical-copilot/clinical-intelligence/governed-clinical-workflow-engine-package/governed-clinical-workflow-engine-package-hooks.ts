"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalWorkflowEnginePackageReadAdapter, type GovernedClinicalWorkflowEnginePackageReadAdapter } from "./governed-clinical-workflow-engine-package-adapter";
import type { GovernedClinicalWorkflowEnginePackageResult } from "./governed-clinical-workflow-engine-package";
export type UseGovernedClinicalWorkflowEnginePackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalWorkflowEnginePackageReadAdapter };
export type UseGovernedClinicalWorkflowEnginePackageResult = { loading: boolean; error: string | null; result: GovernedClinicalWorkflowEnginePackageResult | null; refresh: () => void };
export function useGovernedClinicalWorkflowEnginePackage(options: UseGovernedClinicalWorkflowEnginePackageOptions): UseGovernedClinicalWorkflowEnginePackageResult {
  const { sessionId, enabled = true, adapter = clinicalWorkflowEnginePackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalWorkflowEnginePackageResult | null>(null);
  const refresh = useCallback(() => {
    if (!sessionId || !enabled) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    adapter.get(sessionId).then((mapped) => { if (!cancelled) { setResult(mapped); setLoading(false); } })
      .catch((e) => { if (!cancelled) { setError(e instanceof Error ? e.message : "Error"); setLoading(false); } });
    return () => { cancelled = true; };
  }, [sessionId, enabled, adapter]);
  useEffect(() => { const cancel = refresh(); return typeof cancel === "function" ? cancel : undefined; }, [refresh]);
  return { loading, error, result, refresh: () => { refresh(); } };
}
