"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistenceNavigationReadAdapter,
  type GovernedPersistenceNavigationReadAdapter,
} from "./governed-persistence-navigation-adapter";
import type { GovernedPersistenceNavigationResult } from "./governed-persistence-navigation";

export type UseGovernedPersistenceNavigationOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistenceNavigationReadAdapter;
};

export type UseGovernedPersistenceNavigationResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistenceNavigationResult | null;
  refresh: () => void;
};

export function useGovernedPersistenceNavigation(
  options: UseGovernedPersistenceNavigationOptions,
): UseGovernedPersistenceNavigationResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistenceNavigationReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistenceNavigationResult | null>(null);
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
      .getGovernedPersistenceNavigation(sessionId)
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
