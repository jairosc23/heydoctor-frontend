"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { reasoningExecutionContextReadAdapter, type ReasoningExecutionContextReadAdapter } from "./reasoning-execution-context-adapter";
import type { ReasoningExecutionContextBuilderResult } from "./reasoning-execution-context";
export type UseReasoningExecutionContextOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ReasoningExecutionContextReadAdapter; };
export type UseReasoningExecutionContextResult = { loading: boolean; error: string | null; result: ReasoningExecutionContextBuilderResult | null; refresh: () => void; };
export function useReasoningExecutionContext(options: UseReasoningExecutionContextOptions): UseReasoningExecutionContextResult {
  const { sessionId, enabled = true, adapter = reasoningExecutionContextReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReasoningExecutionContextBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getReasoningExecutionContext(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
