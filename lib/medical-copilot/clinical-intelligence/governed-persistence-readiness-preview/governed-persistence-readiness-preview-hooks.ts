"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceReadinessPreviewReadAdapter,
  type GovernedPersistenceReadinessPreviewReadAdapter,
} from "./governed-persistence-readiness-preview-adapter";
import type { GovernedPersistenceReadinessPreviewResult } from "./governed-persistence-readiness-preview";

export type UseGovernedPersistenceReadinessPreviewOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceReadinessPreviewReadAdapter;
};

export type UseGovernedPersistenceReadinessPreviewResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceReadinessPreviewResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceReadinessPreview(
  options: UseGovernedPersistenceReadinessPreviewOptions,
): UseGovernedPersistenceReadinessPreviewResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceReadinessPreviewReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceReadinessPreviewResult | null>(null);
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
      .getGovernedPersistenceReadinessPreview(sessionId)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(toAiClinicalUserMessage(err));
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
