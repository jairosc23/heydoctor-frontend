"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { clinicalReasoningEngineCoreReadAdapter, type ClinicalReasoningEngineCoreReadAdapter } from "./clinical-reasoning-engine-core-adapter";
import type { ClinicalReasoningEngineCoreBuilderResult } from "./clinical-reasoning-engine-core";
export type UseClinicalReasoningEngineCoreOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: ClinicalReasoningEngineCoreReadAdapter; };
export type UseClinicalReasoningEngineCoreResult = { loading: boolean; error: string | null; result: ClinicalReasoningEngineCoreBuilderResult | null; refresh: () => void; };
export function useClinicalReasoningEngineCore(options: UseClinicalReasoningEngineCoreOptions): UseClinicalReasoningEngineCoreResult {
  const { sessionId, enabled = true, adapter = clinicalReasoningEngineCoreReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReasoningEngineCoreBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getClinicalReasoningEngineCore(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
