"use client";
import { useCallback, useEffect, useState } from "react";
import { translationReadAdapter, type GovernedTranslatedProviderPayloadReadAdapter } from "./governed-provider-payload-translation-adapter";
import type { GovernedTranslatedProviderPayloadBuilderResult } from "./governed-provider-payload-translation";

export type UseGovernedTranslatedProviderPayloadOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedTranslatedProviderPayloadReadAdapter;
};
export type UseGovernedTranslatedProviderPayloadResult = {
  loading: boolean;
  error: string | null;
  result: GovernedTranslatedProviderPayloadBuilderResult | null;
  refresh: () => void;
};

export function useGovernedProviderPayloadTranslation(options: UseGovernedTranslatedProviderPayloadOptions): UseGovernedTranslatedProviderPayloadResult {
  const { sessionId, enabled = true, adapter = translationReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedTranslatedProviderPayloadBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedProviderPayloadTranslation(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
