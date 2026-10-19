"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { evidenceCorrelationReadAdapter, type EvidenceCorrelationWorkspaceReadAdapter } from "./evidence-correlation-workspace-adapter";
import type { EvidenceCorrelationWorkspaceBuilderResult } from "./evidence-correlation-workspace";

export type UseEvidenceCorrelationWorkspaceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: EvidenceCorrelationWorkspaceReadAdapter;
};
export type UseEvidenceCorrelationWorkspaceResult = {
  loading: boolean;
  error: string | null;
  result: EvidenceCorrelationWorkspaceBuilderResult | null;
  refresh: () => void;
};

export function useEvidenceCorrelationWorkspace(options: UseEvidenceCorrelationWorkspaceOptions): UseEvidenceCorrelationWorkspaceResult {
  const { sessionId, enabled = true, adapter = evidenceCorrelationReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvidenceCorrelationWorkspaceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getEvidenceCorrelationWorkspace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
