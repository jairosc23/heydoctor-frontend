"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { reasoningPreparationReadAdapter, type PhysicianReasoningPreparationReadAdapter } from "./physician-reasoning-preparation-adapter";
import type { PhysicianReasoningPreparationBuilderResult } from "./physician-reasoning-preparation";

export type UsePhysicianReasoningPreparationOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: PhysicianReasoningPreparationReadAdapter;
};
export type UsePhysicianReasoningPreparationResult = {
  loading: boolean;
  error: string | null;
  result: PhysicianReasoningPreparationBuilderResult | null;
  refresh: () => void;
};

export function usePhysicianReasoningPreparation(options: UsePhysicianReasoningPreparationOptions): UsePhysicianReasoningPreparationResult {
  const { sessionId, enabled = true, adapter = reasoningPreparationReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhysicianReasoningPreparationBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getPhysicianReasoningPreparation(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
