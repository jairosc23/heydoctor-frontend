"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedConsultationHomeReadAdapter,
  type GovernedConsultationHomeReadAdapter,
} from "./governed-consultation-home-adapter";
import type { GovernedConsultationHomeResult } from "./governed-consultation-home";

export type UseGovernedConsultationHomeOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedConsultationHomeReadAdapter;
};

export type UseGovernedConsultationHomeResult = {
  loading: boolean;
  error: string | null;
  result: GovernedConsultationHomeResult | null;
  refresh: () => void;
};

export function useGovernedConsultationHome(
  options: UseGovernedConsultationHomeOptions,
): UseGovernedConsultationHomeResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedConsultationHomeReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedConsultationHomeResult | null>(null);
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
      .getGovernedConsultationHome(sessionId)
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
