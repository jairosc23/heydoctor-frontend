"use client";
import { useCallback, useEffect, useState } from "react";
import { clinicalPatternReadAdapter, type ClinicalPatternWorkspaceReadAdapter } from "./clinical-pattern-workspace-adapter";
import type { ClinicalPatternWorkspaceBuilderResult } from "./clinical-pattern-workspace";

export type UseClinicalPatternWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalPatternWorkspaceReadAdapter;
};
export type UseClinicalPatternWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalPatternWorkspaceBuilderResult | null;
  refresh: () => void;
};

export function useClinicalPatternWorkspace(options: UseClinicalPatternWorkspaceOptions): UseClinicalPatternWorkspaceResult {
  const { sessionId, enabled = true, adapter = clinicalPatternReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalPatternWorkspaceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalPatternWorkspace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
