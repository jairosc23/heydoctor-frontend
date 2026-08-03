"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { differentialReasoningEngineReadAdapter, type DifferentialReasoningEngineReadAdapter } from "./differential-reasoning-engine-adapter";
import type { DifferentialReasoningEngineBuilderResult } from "./differential-reasoning-engine";
export type UseDifferentialReasoningEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: DifferentialReasoningEngineReadAdapter; };
export type UseDifferentialReasoningEngineResult = { loading: boolean; error: string | null; result: DifferentialReasoningEngineBuilderResult | null; refresh: () => void; };
export function useDifferentialReasoningEngine(options: UseDifferentialReasoningEngineOptions): UseDifferentialReasoningEngineResult {
  const { sessionId, enabled = true, adapter = differentialReasoningEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DifferentialReasoningEngineBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getDifferentialReasoningEngine(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
