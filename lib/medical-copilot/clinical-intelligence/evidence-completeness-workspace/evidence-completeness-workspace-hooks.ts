"use client";
import { useCallback, useEffect, useState } from "react";
import { evidenceCompletenessReadAdapter, type EvidenceCompletenessWorkspaceReadAdapter } from "./evidence-completeness-workspace-adapter";
import type { EvidenceCompletenessWorkspaceBuilderResult } from "./evidence-completeness-workspace";

export type UseEvidenceCompletenessWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: EvidenceCompletenessWorkspaceReadAdapter;
};
export type UseEvidenceCompletenessWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: EvidenceCompletenessWorkspaceBuilderResult | null;
  refresh: () => void;
};

export function useEvidenceCompletenessWorkspace(options: UseEvidenceCompletenessWorkspaceOptions): UseEvidenceCompletenessWorkspaceResult {
  const { sessionId, enabled = true, adapter = evidenceCompletenessReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvidenceCompletenessWorkspaceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getEvidenceCompletenessWorkspace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
