"use client";
import { useCallback, useEffect, useState } from "react";
import { governedAhaEvidenceEngineReadAdapter, type GovernedAhaEvidenceEngineReadAdapter } from "./governed-aha-evidence-engine-adapter";
import type { GovernedAhaEvidenceEngineResult } from "./governed-aha-evidence-engine";
export type UseGovernedAhaEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedAhaEvidenceEngineReadAdapter };
export type UseGovernedAhaEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedAhaEvidenceEngineResult | null; refresh: () => void };
export function useGovernedAhaEvidenceEngine(options: UseGovernedAhaEvidenceEngineOptions): UseGovernedAhaEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedAhaEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAhaEvidenceEngineResult | null>(null);
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
