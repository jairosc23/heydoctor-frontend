"use client";
import { useCallback, useEffect, useState } from "react";
import { governedEvidenceTraceReadAdapter, type GovernedEvidenceTraceReadAdapter } from "./governed-evidence-trace-adapter";
import type { GovernedEvidenceTraceResult } from "./governed-evidence-trace";

export type UseGovernedEvidenceTraceOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEvidenceTraceReadAdapter };
export type UseGovernedEvidenceTraceResult = { loading: boolean; error: string | null; result: GovernedEvidenceTraceResult | null; refresh: () => void };

export function useGovernedEvidenceTrace(options: UseGovernedEvidenceTraceOptions): UseGovernedEvidenceTraceResult {
  const { sessionId, enabled = true, adapter = governedEvidenceTraceReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEvidenceTraceResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedEvidenceTrace(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
