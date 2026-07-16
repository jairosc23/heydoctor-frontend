"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalSessionWorkflowReadAdapter, type GovernedClinicalSessionWorkflowReadAdapter } from "./governed-clinical-session-workflow-adapter";
import type { GovernedClinicalSessionWorkflowResult } from "./governed-clinical-session-workflow";
export type UseGovernedClinicalSessionWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalSessionWorkflowReadAdapter };
export type UseGovernedClinicalSessionWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalSessionWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalSessionWorkflow(options: UseGovernedClinicalSessionWorkflowOptions): UseGovernedClinicalSessionWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalSessionWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalSessionWorkflowResult | null>(null);
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
