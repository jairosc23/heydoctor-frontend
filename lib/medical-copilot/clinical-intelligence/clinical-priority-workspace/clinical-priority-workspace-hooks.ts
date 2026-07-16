"use client";
import { useCallback, useEffect, useState } from "react";
import { priorityWorkspaceReadAdapter, type ClinicalPriorityWorkspaceReadAdapter } from "./clinical-priority-workspace-adapter";
import type { ClinicalPriorityWorkspaceBuilderResult } from "./clinical-priority-workspace";

export type UseClinicalPriorityWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalPriorityWorkspaceReadAdapter;
};
export type UseClinicalPriorityWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalPriorityWorkspaceBuilderResult | null;
  refresh: () => void;
};

export function useClinicalPriorityWorkspace(options: UseClinicalPriorityWorkspaceOptions): UseClinicalPriorityWorkspaceResult {
  const { sessionId, enabled = true, adapter = priorityWorkspaceReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalPriorityWorkspaceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalPriorityWorkspace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
