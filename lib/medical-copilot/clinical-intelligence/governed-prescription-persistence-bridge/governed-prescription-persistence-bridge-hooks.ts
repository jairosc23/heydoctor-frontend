"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedPrescriptionPersistenceBridgeReadAdapter,
  type GovernedPrescriptionPersistenceBridgeReadAdapter,
} from "./governed-prescription-persistence-bridge-adapter";
import type { GovernedPrescriptionPersistenceBridgeResult } from "./governed-prescription-persistence-bridge";

export type UseGovernedPrescriptionPersistenceBridgeOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPrescriptionPersistenceBridgeReadAdapter;
};

export type UseGovernedPrescriptionPersistenceBridgeResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPrescriptionPersistenceBridgeResult | null;
  refresh: () => void;
};

export function useGovernedPrescriptionPersistenceBridge(
  options: UseGovernedPrescriptionPersistenceBridgeOptions,
): UseGovernedPrescriptionPersistenceBridgeResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPrescriptionPersistenceBridgeReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPrescriptionPersistenceBridgeResult | null>(null);
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
      .getGovernedPrescriptionPersistenceBridge(sessionId)
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
