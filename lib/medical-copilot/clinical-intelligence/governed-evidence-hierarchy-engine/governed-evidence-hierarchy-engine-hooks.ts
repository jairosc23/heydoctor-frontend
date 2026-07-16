"use client";
import { useCallback, useEffect, useState } from "react";
import { governedEvidenceHierarchyEngineReadAdapter, type GovernedEvidenceHierarchyEngineReadAdapter } from "./governed-evidence-hierarchy-engine-adapter";
import type { GovernedEvidenceHierarchyEngineResult } from "./governed-evidence-hierarchy-engine";
export type UseGovernedEvidenceHierarchyEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEvidenceHierarchyEngineReadAdapter };
export type UseGovernedEvidenceHierarchyEngineResult = { loading: boolean; error: string | null; result: GovernedEvidenceHierarchyEngineResult | null; refresh: () => void };
export function useGovernedEvidenceHierarchyEngine(options: UseGovernedEvidenceHierarchyEngineOptions): UseGovernedEvidenceHierarchyEngineResult {
  const { sessionId, enabled = true, adapter = governedEvidenceHierarchyEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEvidenceHierarchyEngineResult | null>(null);
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
