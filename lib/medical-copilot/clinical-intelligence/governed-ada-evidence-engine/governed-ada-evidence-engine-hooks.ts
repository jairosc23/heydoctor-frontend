"use client";
import { useCallback, useEffect, useState } from "react";
import { governedAdaEvidenceEngineReadAdapter, type GovernedAdaEvidenceEngineReadAdapter } from "./governed-ada-evidence-engine-adapter";
import type { GovernedAdaEvidenceEngineResult } from "./governed-ada-evidence-engine";
export type UseGovernedAdaEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedAdaEvidenceEngineReadAdapter };
export type UseGovernedAdaEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedAdaEvidenceEngineResult | null; refresh: () => void };
export function useGovernedAdaEvidenceEngine(options: UseGovernedAdaEvidenceEngineOptions): UseGovernedAdaEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedAdaEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAdaEvidenceEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
