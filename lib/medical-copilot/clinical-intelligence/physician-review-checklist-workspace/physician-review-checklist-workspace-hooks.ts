"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { checklistWorkspaceReadAdapter, type PhysicianReviewChecklistWorkspaceReadAdapter } from "./physician-review-checklist-workspace-adapter";
import type { PhysicianReviewChecklistWorkspaceBuilderResult } from "./physician-review-checklist-workspace";

export type UsePhysicianReviewChecklistWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: PhysicianReviewChecklistWorkspaceReadAdapter;
};
export type UsePhysicianReviewChecklistWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: PhysicianReviewChecklistWorkspaceBuilderResult | null;
  refresh: () => void;
};

export function usePhysicianReviewChecklistWorkspace(options: UsePhysicianReviewChecklistWorkspaceOptions): UsePhysicianReviewChecklistWorkspaceResult {
  const { sessionId, enabled = true, adapter = checklistWorkspaceReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhysicianReviewChecklistWorkspaceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getPhysicianReviewChecklistWorkspace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
