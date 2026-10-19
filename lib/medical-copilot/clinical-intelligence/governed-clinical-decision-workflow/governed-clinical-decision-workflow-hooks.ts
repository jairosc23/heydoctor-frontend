"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalDecisionWorkflowReadAdapter, type GovernedClinicalDecisionWorkflowReadAdapter } from "./governed-clinical-decision-workflow-adapter";
import type { GovernedClinicalDecisionWorkflowResult } from "./governed-clinical-decision-workflow";
export type UseGovernedClinicalDecisionWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalDecisionWorkflowReadAdapter };
export type UseGovernedClinicalDecisionWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalDecisionWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalDecisionWorkflow(options: UseGovernedClinicalDecisionWorkflowOptions): UseGovernedClinicalDecisionWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalDecisionWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalDecisionWorkflowResult | null>(null);
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
