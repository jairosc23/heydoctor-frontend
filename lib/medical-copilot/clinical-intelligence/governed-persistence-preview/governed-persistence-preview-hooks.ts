"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistencePreviewReadAdapter,
  type GovernedPersistencePreviewReadAdapter,
} from "./governed-persistence-preview-adapter";
import type { GovernedPersistencePreviewResult } from "./governed-persistence-preview";

export type UseGovernedPersistencePreviewOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistencePreviewReadAdapter;
};

export type UseGovernedPersistencePreviewResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistencePreviewResult | null;
  refresh: () => void;
};

export function useGovernedPersistencePreview(
  options: UseGovernedPersistencePreviewOptions,
): UseGovernedPersistencePreviewResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistencePreviewReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistencePreviewResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!enabled || !sessionId) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void adapter
      .getGovernedPersistencePreview(sessionId)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setResult(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [adapter, enabled, sessionId, tick]);

  return { loading, error, result, refresh };
}
