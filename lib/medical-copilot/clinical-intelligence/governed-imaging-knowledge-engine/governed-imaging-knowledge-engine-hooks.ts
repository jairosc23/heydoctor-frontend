"use client";
import { useCallback, useEffect, useState } from "react";
import { governedImagingKnowledgeEngineReadAdapter, type GovernedImagingKnowledgeEngineReadAdapter } from "./governed-imaging-knowledge-engine-adapter";
import type { GovernedImagingKnowledgeEngineResult } from "./governed-imaging-knowledge-engine";
export type UseGovernedImagingKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedImagingKnowledgeEngineReadAdapter };
export type UseGovernedImagingKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedImagingKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedImagingKnowledgeEngine(options: UseGovernedImagingKnowledgeEngineOptions): UseGovernedImagingKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedImagingKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedImagingKnowledgeEngineResult | null>(null);
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
