"use client";
import { useCallback, useEffect, useState } from "react";
import { governedEvidenceVersioningEngineReadAdapter, type GovernedEvidenceVersioningEngineReadAdapter } from "./governed-evidence-versioning-engine-adapter";
import type { GovernedEvidenceVersioningEngineResult } from "./governed-evidence-versioning-engine";
export type UseGovernedEvidenceVersioningEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEvidenceVersioningEngineReadAdapter };
export type UseGovernedEvidenceVersioningEngineResult = { loading: boolean; error: string | null; result: GovernedEvidenceVersioningEngineResult | null; refresh: () => void };
export function useGovernedEvidenceVersioningEngine(options: UseGovernedEvidenceVersioningEngineOptions): UseGovernedEvidenceVersioningEngineResult {
  const { sessionId, enabled = true, adapter = governedEvidenceVersioningEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEvidenceVersioningEngineResult | null>(null);
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
