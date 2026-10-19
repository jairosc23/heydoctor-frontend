"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalPopulationWorkflowReadAdapter, type GovernedClinicalPopulationWorkflowReadAdapter } from "./governed-clinical-population-workflow-adapter";
import type { GovernedClinicalPopulationWorkflowResult } from "./governed-clinical-population-workflow";
export type UseGovernedClinicalPopulationWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalPopulationWorkflowReadAdapter };
export type UseGovernedClinicalPopulationWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalPopulationWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalPopulationWorkflow(options: UseGovernedClinicalPopulationWorkflowOptions): UseGovernedClinicalPopulationWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalPopulationWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalPopulationWorkflowResult | null>(null);
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
