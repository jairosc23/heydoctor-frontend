"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedSoapPersistenceBridgeReadAdapter,
  type GovernedSoapPersistenceBridgeReadAdapter,
} from "./governed-soap-persistence-bridge-adapter";
import type { GovernedSoapPersistenceBridgeResult } from "./governed-soap-persistence-bridge";

export type UseGovernedSoapPersistenceBridgeOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedSoapPersistenceBridgeReadAdapter;
};

export type UseGovernedSoapPersistenceBridgeResult = {
  loading: boolean;
  error: string | null;
  result: GovernedSoapPersistenceBridgeResult | null;
  refresh: () => void;
};

export function useGovernedSoapPersistenceBridge(
  options: UseGovernedSoapPersistenceBridgeOptions,
): UseGovernedSoapPersistenceBridgeResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedSoapPersistenceBridgeReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedSoapPersistenceBridgeResult | null>(null);
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
      .getGovernedSoapPersistenceBridge(sessionId)
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
