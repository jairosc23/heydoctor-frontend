"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { reasoningStateMachineReadAdapter, type ReasoningStateMachineReadAdapter } from "./reasoning-state-machine-adapter";
import type { ReasoningStateMachineBuilderResult } from "./reasoning-state-machine";
export type UseReasoningStateMachineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ReasoningStateMachineReadAdapter; };
export type UseReasoningStateMachineResult = { loading: boolean; error: string | null; result: ReasoningStateMachineBuilderResult | null; refresh: () => void; };
export function useReasoningStateMachine(options: UseReasoningStateMachineOptions): UseReasoningStateMachineResult {
  const { sessionId, enabled = true, adapter = reasoningStateMachineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReasoningStateMachineBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getReasoningStateMachine(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
