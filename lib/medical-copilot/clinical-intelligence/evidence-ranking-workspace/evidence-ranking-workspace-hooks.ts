"use client";
import { useCallback, useEffect, useState } from "react";
import { evidenceRankingWorkspaceReadAdapter, type EvidenceRankingWorkspaceReadAdapter } from "./evidence-ranking-workspace-adapter";
import type { EvidenceRankingWorkspaceBuilderResult } from "./evidence-ranking-workspace";
export type UseEvidenceRankingWorkspaceOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: EvidenceRankingWorkspaceReadAdapter; };
export type UseEvidenceRankingWorkspaceResult = { loading: boolean; error: string | null; result: EvidenceRankingWorkspaceBuilderResult | null; refresh: () => void; };
export function useEvidenceRankingWorkspace(options: UseEvidenceRankingWorkspaceOptions): UseEvidenceRankingWorkspaceResult {
  const { sessionId, enabled = true, adapter = evidenceRankingWorkspaceReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvidenceRankingWorkspaceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getEvidenceRankingWorkspace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
