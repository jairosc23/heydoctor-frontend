"use client";
import { useCallback, useEffect, useState } from "react";
import { evidenceReasoningEngineReadAdapter, type EvidenceReasoningEngineReadAdapter } from "./evidence-reasoning-engine-adapter";
import type { EvidenceReasoningEngineBuilderResult } from "./evidence-reasoning-engine";
export type UseEvidenceReasoningEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: EvidenceReasoningEngineReadAdapter; };
export type UseEvidenceReasoningEngineResult = { loading: boolean; error: string | null; result: EvidenceReasoningEngineBuilderResult | null; refresh: () => void; };
export function useEvidenceReasoningEngine(options: UseEvidenceReasoningEngineOptions): UseEvidenceReasoningEngineResult {
  const { sessionId, enabled = true, adapter = evidenceReasoningEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EvidenceReasoningEngineBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getEvidenceReasoningEngine(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
