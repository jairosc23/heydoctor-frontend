"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedPersistencePackageReadAdapter,
  type GovernedPersistencePackageReadAdapter,
} from "./governed-persistence-package-adapter";
import type { GovernedPersistencePackageResult } from "./governed-persistence-package";

export type UseGovernedPersistencePackageOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPersistencePackageReadAdapter;
};

export type UseGovernedPersistencePackageResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPersistencePackageResult | null;
  refresh: () => void;
};

export function useGovernedPersistencePackage(
  options: UseGovernedPersistencePackageOptions,
): UseGovernedPersistencePackageResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPersistencePackageReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPersistencePackageResult | null>(null);
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
      .getGovernedPersistencePackage(sessionId)
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
