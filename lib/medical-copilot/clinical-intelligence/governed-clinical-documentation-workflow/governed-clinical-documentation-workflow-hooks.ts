"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalDocumentationWorkflowReadAdapter, type GovernedClinicalDocumentationWorkflowReadAdapter } from "./governed-clinical-documentation-workflow-adapter";
import type { GovernedClinicalDocumentationWorkflowResult } from "./governed-clinical-documentation-workflow";
export type UseGovernedClinicalDocumentationWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalDocumentationWorkflowReadAdapter };
export type UseGovernedClinicalDocumentationWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalDocumentationWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalDocumentationWorkflow(options: UseGovernedClinicalDocumentationWorkflowOptions): UseGovernedClinicalDocumentationWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalDocumentationWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalDocumentationWorkflowResult | null>(null);
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
