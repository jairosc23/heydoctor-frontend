"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedConsultationPackageReadAdapter,
  type GovernedConsultationPackageReadAdapter,
} from "./governed-consultation-package-adapter";
import type { GovernedConsultationPackageResult } from "./governed-consultation-package";

export type UseGovernedConsultationPackageOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedConsultationPackageReadAdapter;
};

export type UseGovernedConsultationPackageResult = {
  loading: boolean;
  error: string | null;
  result: GovernedConsultationPackageResult | null;
  refresh: () => void;
};

export function useGovernedConsultationPackage(
  options: UseGovernedConsultationPackageOptions,
): UseGovernedConsultationPackageResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedConsultationPackageReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedConsultationPackageResult | null>(null);
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
      .getGovernedConsultationPackage(sessionId)
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
