"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { reasoningStageManagerReadAdapter, type ReasoningStageManagerReadAdapter } from "./reasoning-stage-manager-adapter";
import type { ReasoningStageManagerBuilderResult } from "./reasoning-stage-manager";
export type UseReasoningStageManagerOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ReasoningStageManagerReadAdapter; };
export type UseReasoningStageManagerResult = { loading: boolean; error: string | null; result: ReasoningStageManagerBuilderResult | null; refresh: () => void; };
export function useReasoningStageManager(options: UseReasoningStageManagerOptions): UseReasoningStageManagerResult {
  const { sessionId, enabled = true, adapter = reasoningStageManagerReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReasoningStageManagerBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getReasoningStageManager(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
