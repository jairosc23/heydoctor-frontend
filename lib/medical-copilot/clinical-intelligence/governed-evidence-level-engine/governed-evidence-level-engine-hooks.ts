"use client";
import { useCallback, useEffect, useState } from "react";
import { governedEvidenceLevelEngineReadAdapter, type GovernedEvidenceLevelEngineReadAdapter } from "./governed-evidence-level-engine-adapter";
import type { GovernedEvidenceLevelEngineResult } from "./governed-evidence-level-engine";
export type UseGovernedEvidenceLevelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEvidenceLevelEngineReadAdapter };
export type UseGovernedEvidenceLevelEngineResult = { loading: boolean; error: string | null; result: GovernedEvidenceLevelEngineResult | null; refresh: () => void };
export function useGovernedEvidenceLevelEngine(options: UseGovernedEvidenceLevelEngineOptions): UseGovernedEvidenceLevelEngineResult {
  const { sessionId, enabled = true, adapter = governedEvidenceLevelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEvidenceLevelEngineResult | null>(null);
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
