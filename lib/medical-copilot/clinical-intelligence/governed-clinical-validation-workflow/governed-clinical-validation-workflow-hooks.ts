"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalValidationWorkflowReadAdapter, type GovernedClinicalValidationWorkflowReadAdapter } from "./governed-clinical-validation-workflow-adapter";
import type { GovernedClinicalValidationWorkflowResult } from "./governed-clinical-validation-workflow";
export type UseGovernedClinicalValidationWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalValidationWorkflowReadAdapter };
export type UseGovernedClinicalValidationWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalValidationWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalValidationWorkflow(options: UseGovernedClinicalValidationWorkflowOptions): UseGovernedClinicalValidationWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalValidationWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalValidationWorkflowResult | null>(null);
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
