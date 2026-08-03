"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { reasoningRulePipelineReadAdapter, type ReasoningRulePipelineReadAdapter } from "./reasoning-rule-pipeline-adapter";
import type { ReasoningRulePipelineBuilderResult } from "./reasoning-rule-pipeline";
export type UseReasoningRulePipelineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ReasoningRulePipelineReadAdapter; };
export type UseReasoningRulePipelineResult = { loading: boolean; error: string | null; result: ReasoningRulePipelineBuilderResult | null; refresh: () => void; };
export function useReasoningRulePipeline(options: UseReasoningRulePipelineOptions): UseReasoningRulePipelineResult {
  const { sessionId, enabled = true, adapter = reasoningRulePipelineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReasoningRulePipelineBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getReasoningRulePipeline(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
