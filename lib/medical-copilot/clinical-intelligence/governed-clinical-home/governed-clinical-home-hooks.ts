"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalHomeReadAdapter,
  type GovernedClinicalHomeReadAdapter,
} from "./governed-clinical-home-adapter";
import type { GovernedClinicalHomeResult } from "./governed-clinical-home";

export type UseGovernedClinicalHomeOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalHomeReadAdapter;
};

export type UseGovernedClinicalHomeResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalHomeResult | null;
  refresh: () => void;
};

export function useGovernedClinicalHome(
  options: UseGovernedClinicalHomeOptions,
): UseGovernedClinicalHomeResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalHomeReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalHomeResult | null>(null);
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
      .getGovernedClinicalHome(sessionId)
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
