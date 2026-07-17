"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedReferralPersistenceBridgeReadAdapter,
  type GovernedReferralPersistenceBridgeReadAdapter,
} from "./governed-referral-persistence-bridge-adapter";
import type { GovernedReferralPersistenceBridgeResult } from "./governed-referral-persistence-bridge";

export type UseGovernedReferralPersistenceBridgeOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedReferralPersistenceBridgeReadAdapter;
};

export type UseGovernedReferralPersistenceBridgeResult = {
  loading: boolean;
  error: string | null;
  result: GovernedReferralPersistenceBridgeResult | null;
  refresh: () => void;
};

export function useGovernedReferralPersistenceBridge(
  options: UseGovernedReferralPersistenceBridgeOptions,
): UseGovernedReferralPersistenceBridgeResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedReferralPersistenceBridgeReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedReferralPersistenceBridgeResult | null>(null);
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
      .getGovernedReferralPersistenceBridge(sessionId)
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
