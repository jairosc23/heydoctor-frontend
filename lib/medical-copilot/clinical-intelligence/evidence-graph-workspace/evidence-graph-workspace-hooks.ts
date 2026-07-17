"use client";
import { useCallback, useEffect, useState } from "react";
import { evidenceGraphReadAdapter, type EvidenceGraphWorkspaceReadAdapter } from "./evidence-graph-workspace-adapter";
import type { EvidenceGraphWorkspaceBuilderResult } from "./evidence-graph-workspace";
export type UseEvidenceGraphWorkspaceOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: EvidenceGraphWorkspaceReadAdapter; };
export type UseEvidenceGraphWorkspaceResult = { loading: boolean; error: string | null; result: EvidenceGraphWorkspaceBuilderResult | null; refresh: () => void; };
export function useEvidenceGraphWorkspace(options: UseEvidenceGraphWorkspaceOptions): UseEvidenceGraphWorkspaceResult {
  const { sessionId, enabled = true, adapter = evidenceGraphReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvidenceGraphWorkspaceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getEvidenceGraphWorkspace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
