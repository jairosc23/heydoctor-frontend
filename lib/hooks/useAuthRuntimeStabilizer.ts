"use client";

import { useEffect, useRef } from "react";
import {
  createAuthStabilizer,
  type AuthStabilizerSnapshot,
} from "@/lib/runtime-stabilizer";

const STABILIZER_TICK_MS = 1_000;

export type UseAuthRuntimeStabilizerOptions = {
  loading: boolean;
  sessionRevalidating: boolean;
  onOverlayRecovery?: () => void;
  onHydrationRecovery?: () => void;
  onStaleLoadingReset?: () => void;
};

export function useAuthRuntimeStabilizer(
  options: UseAuthRuntimeStabilizerOptions,
): void {
  const loadingSinceRef = useRef<number | null>(null);
  const revalidatingSinceRef = useRef<number | null>(null);
  const stabilizerRef = useRef(createAuthStabilizer());

  const callbacksRef = useRef({
    onOverlayRecovery: options.onOverlayRecovery,
    onHydrationRecovery: options.onHydrationRecovery,
    onStaleLoadingReset: options.onStaleLoadingReset,
  });
  callbacksRef.current = {
    onOverlayRecovery: options.onOverlayRecovery,
    onHydrationRecovery: options.onHydrationRecovery,
    onStaleLoadingReset: options.onStaleLoadingReset,
  };

  useEffect(() => {
    stabilizerRef.current = createAuthStabilizer({
      onOverlayRecovery: () => callbacksRef.current.onOverlayRecovery?.(),
      onHydrationRecovery: () => callbacksRef.current.onHydrationRecovery?.(),
      onStaleLoadingReset: () => callbacksRef.current.onStaleLoadingReset?.(),
    });
  }, []);

  useEffect(() => {
    if (options.loading) {
      if (loadingSinceRef.current == null) {
        loadingSinceRef.current = Date.now();
      }
    } else {
      loadingSinceRef.current = null;
    }
  }, [options.loading]);

  useEffect(() => {
    if (options.sessionRevalidating) {
      if (revalidatingSinceRef.current == null) {
        revalidatingSinceRef.current = Date.now();
      }
    } else {
      revalidatingSinceRef.current = null;
    }
  }, [options.sessionRevalidating]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const snapshot: AuthStabilizerSnapshot = {
        loading: options.loading,
        sessionRevalidating: options.sessionRevalidating,
        loadingSinceMs: loadingSinceRef.current,
        revalidatingSinceMs: revalidatingSinceRef.current,
      };
      stabilizerRef.current.tick(snapshot);
    }, STABILIZER_TICK_MS);

    return () => clearInterval(intervalId);
  }, [options.loading, options.sessionRevalidating]);
}
