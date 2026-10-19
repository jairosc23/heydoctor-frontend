"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalGuidelinesWorkflowReadAdapter, type GovernedClinicalGuidelinesWorkflowReadAdapter } from "./governed-clinical-guidelines-workflow-adapter";
import type { GovernedClinicalGuidelinesWorkflowResult } from "./governed-clinical-guidelines-workflow";
export type UseGovernedClinicalGuidelinesWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalGuidelinesWorkflowReadAdapter };
export type UseGovernedClinicalGuidelinesWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalGuidelinesWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalGuidelinesWorkflow(options: UseGovernedClinicalGuidelinesWorkflowOptions): UseGovernedClinicalGuidelinesWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalGuidelinesWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalGuidelinesWorkflowResult | null>(null);
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
