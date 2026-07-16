"use client";
import { useCallback, useEffect, useState } from "react";
import { evidenceWorkspaceReadAdapter, type DiagnosticEvidenceWorkspaceReadAdapter } from "./diagnostic-evidence-workspace-adapter";
import type { DiagnosticEvidenceWorkspaceBuilderResult } from "./diagnostic-evidence-workspace";

export type UseDiagnosticEvidenceWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: DiagnosticEvidenceWorkspaceReadAdapter;
};
export type UseDiagnosticEvidenceWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: DiagnosticEvidenceWorkspaceBuilderResult | null;
  refresh: () => void;
};

export function useDiagnosticEvidenceWorkspace(options: UseDiagnosticEvidenceWorkspaceOptions): UseDiagnosticEvidenceWorkspaceResult {
  const { sessionId, enabled = true, adapter = evidenceWorkspaceReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosticEvidenceWorkspaceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getDiagnosticEvidenceWorkspace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
