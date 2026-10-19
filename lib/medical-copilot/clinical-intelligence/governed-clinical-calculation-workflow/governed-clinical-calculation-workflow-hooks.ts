"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalCalculationWorkflowReadAdapter, type GovernedClinicalCalculationWorkflowReadAdapter } from "./governed-clinical-calculation-workflow-adapter";
import type { GovernedClinicalCalculationWorkflowResult } from "./governed-clinical-calculation-workflow";
export type UseGovernedClinicalCalculationWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalCalculationWorkflowReadAdapter };
export type UseGovernedClinicalCalculationWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalCalculationWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalCalculationWorkflow(options: UseGovernedClinicalCalculationWorkflowOptions): UseGovernedClinicalCalculationWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalCalculationWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalCalculationWorkflowResult | null>(null);
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
