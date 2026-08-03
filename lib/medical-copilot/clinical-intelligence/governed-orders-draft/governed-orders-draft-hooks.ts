"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedOrdersDraftReadAdapter,
  type GovernedOrdersDraftReadAdapter,
} from "./governed-orders-draft-adapter";
import type { GovernedOrdersDraftResult } from "./governed-orders-draft";

export type UseGovernedOrdersDraftOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedOrdersDraftReadAdapter;
};

export type UseGovernedOrdersDraftResult = {
  loading: boolean;
  error: string | null;
  result: GovernedOrdersDraftResult | null;
  refresh: () => void;
};

export function useGovernedOrdersDraft(
  options: UseGovernedOrdersDraftOptions,
): UseGovernedOrdersDraftResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedOrdersDraftReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedOrdersDraftResult | null>(null);
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
      .getGovernedOrdersDraft(sessionId)
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
