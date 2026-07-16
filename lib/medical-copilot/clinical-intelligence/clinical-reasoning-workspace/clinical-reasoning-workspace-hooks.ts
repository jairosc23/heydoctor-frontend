"use client";
import { useCallback, useEffect, useState } from "react";
import { reasoningWorkspaceReadAdapter, type ClinicalReasoningWorkspaceReadAdapter } from "./clinical-reasoning-workspace-adapter";
import type { ClinicalReasoningWorkspaceBuilderResult } from "./clinical-reasoning-workspace";

export type UseClinicalReasoningWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalReasoningWorkspaceReadAdapter;
};
export type UseClinicalReasoningWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalReasoningWorkspaceBuilderResult | null;
  refresh: () => void;
};

export function useClinicalReasoningWorkspace(options: UseClinicalReasoningWorkspaceOptions): UseClinicalReasoningWorkspaceResult {
  const { sessionId, enabled = true, adapter = reasoningWorkspaceReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReasoningWorkspaceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalReasoningWorkspace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
