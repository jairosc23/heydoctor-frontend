"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalReasoningWorkflowReadAdapter, type GovernedClinicalReasoningWorkflowReadAdapter } from "./governed-clinical-reasoning-workflow-adapter";
import type { GovernedClinicalReasoningWorkflowResult } from "./governed-clinical-reasoning-workflow";
export type UseGovernedClinicalReasoningWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalReasoningWorkflowReadAdapter };
export type UseGovernedClinicalReasoningWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalReasoningWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalReasoningWorkflow(options: UseGovernedClinicalReasoningWorkflowOptions): UseGovernedClinicalReasoningWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalReasoningWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalReasoningWorkflowResult | null>(null);
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
