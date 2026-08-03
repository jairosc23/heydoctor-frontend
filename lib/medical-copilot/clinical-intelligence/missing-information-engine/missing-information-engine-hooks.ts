"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { missingInformationReadAdapter, type MissingInformationEngineReadAdapter } from "./missing-information-engine-adapter";
import type { MissingInformationEngineResultBuilderResult } from "./missing-information-engine";

export type UseMissingInformationEngineResultOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: MissingInformationEngineReadAdapter;
};
export type UseMissingInformationEngineResultResult = {
  loading: boolean;
  error: string | null;
  result: MissingInformationEngineResultBuilderResult | null;
  refresh: () => void;
};

export function useMissingInformationEngine(options: UseMissingInformationEngineResultOptions): UseMissingInformationEngineResultResult {
  const { sessionId, enabled = true, adapter = missingInformationReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MissingInformationEngineResultBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getMissingInformationEngine(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
