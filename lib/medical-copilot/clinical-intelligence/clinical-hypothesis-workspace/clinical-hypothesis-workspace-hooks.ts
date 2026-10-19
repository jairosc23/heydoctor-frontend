"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { clinicalHypothesisWorkspaceReadAdapter, type ClinicalHypothesisWorkspaceReadAdapter } from "./clinical-hypothesis-workspace-adapter";
import type { ClinicalHypothesisWorkspaceBuilderResult } from "./clinical-hypothesis-workspace";
export type UseClinicalHypothesisWorkspaceOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalHypothesisWorkspaceReadAdapter; };
export type UseClinicalHypothesisWorkspaceResult = { loading: boolean; error: string | null; result: ClinicalHypothesisWorkspaceBuilderResult | null; refresh: () => void; };
export function useClinicalHypothesisWorkspace(options: UseClinicalHypothesisWorkspaceOptions): UseClinicalHypothesisWorkspaceResult {
  const { sessionId, enabled = true, adapter = clinicalHypothesisWorkspaceReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalHypothesisWorkspaceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalHypothesisWorkspace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
