"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalEvidenceWorkflowReadAdapter, type GovernedClinicalEvidenceWorkflowReadAdapter } from "./governed-clinical-evidence-workflow-adapter";
import type { GovernedClinicalEvidenceWorkflowResult } from "./governed-clinical-evidence-workflow";
export type UseGovernedClinicalEvidenceWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalEvidenceWorkflowReadAdapter };
export type UseGovernedClinicalEvidenceWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalEvidenceWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalEvidenceWorkflow(options: UseGovernedClinicalEvidenceWorkflowOptions): UseGovernedClinicalEvidenceWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalEvidenceWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalEvidenceWorkflowResult | null>(null);
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
