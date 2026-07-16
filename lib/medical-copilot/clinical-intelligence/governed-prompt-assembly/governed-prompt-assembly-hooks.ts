"use client";
import { useCallback, useEffect, useState } from "react";
import { assembledPromptReadAdapter, type GovernedAssembledPromptReadAdapter } from "./governed-prompt-assembly-adapter";
import type { GovernedAssembledPromptBuilderResult } from "./governed-prompt-assembly";

export type UseGovernedAssembledPromptOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedAssembledPromptReadAdapter;
};
export type UseGovernedAssembledPromptResult = {
  loading: boolean;
  error: string | null;
  result: GovernedAssembledPromptBuilderResult | null;
  refresh: () => void;
};

export function useGovernedPromptAssembly(options: UseGovernedAssembledPromptOptions): UseGovernedAssembledPromptResult {
  const { sessionId, enabled = true, adapter = assembledPromptReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAssembledPromptBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedPromptAssembly(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
