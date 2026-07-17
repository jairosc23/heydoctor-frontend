"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalPhysicianReviewWorkflowReadAdapter, type GovernedClinicalPhysicianReviewWorkflowReadAdapter } from "./governed-clinical-physician-review-workflow-adapter";
import type { GovernedClinicalPhysicianReviewWorkflowResult } from "./governed-clinical-physician-review-workflow";
export type UseGovernedClinicalPhysicianReviewWorkflowOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalPhysicianReviewWorkflowReadAdapter };
export type UseGovernedClinicalPhysicianReviewWorkflowResult = { loading: boolean; error: string | null; result: GovernedClinicalPhysicianReviewWorkflowResult | null; refresh: () => void };
export function useGovernedClinicalPhysicianReviewWorkflow(options: UseGovernedClinicalPhysicianReviewWorkflowOptions): UseGovernedClinicalPhysicianReviewWorkflowResult {
  const { sessionId, enabled = true, adapter = clinicalPhysicianReviewWorkflowReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalPhysicianReviewWorkflowResult | null>(null);
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
