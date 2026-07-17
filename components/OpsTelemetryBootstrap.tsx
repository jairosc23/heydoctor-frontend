"use client";

/**
 * PQ-05 — Passive ops bootstrap: chains existing telemetry hooks → emitOpsEvent.
 * Does not modify clinical / agenda / copilot emitters.
 */

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { AuthTelemetryEvent } from "@/lib/auth-telemetry";
import {
  classifyRoutePath,
  emitOpsEvent,
} from "@/lib/observability/ops-telemetry";

export function OpsTelemetryBootstrap() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  // Navigation (low cardinality path shape)
  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return;
    lastPath.current = pathname;
    emitOpsEvent("navigation", "route_view", {
      path: classifyRoutePath(pathname),
    });
  }, [pathname]);

  // Auth telemetry chain (prod-safe)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prev = window.__HEYDOCTOR_AUTH_TELEMETRY__;
    window.__HEYDOCTOR_AUTH_TELEMETRY__ = (
      event: AuthTelemetryEvent,
      detail?: Record<string, unknown>,
    ) => {
      try {
        prev?.(event, detail);
      } catch {
        /* noop */
      }
      emitOpsEvent("auth", event, detail ?? {});
    };
    return () => {
      window.__HEYDOCTOR_AUTH_TELEMETRY__ = prev;
    };
  }, []);

  // Clinical logger warn/error → ops (existing extension point)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prev = window.__HEYDOCTOR_OBSERVE__;
    window.__HEYDOCTOR_OBSERVE__ = (level, channel, message, extras) => {
      try {
        prev?.(level, channel, message, extras);
      } catch {
        /* noop */
      }
      if (level === "warn" || level === "error") {
        emitOpsEvent("clinical_log", `log_${level}`, {
          channel: String(channel).slice(0, 64),
          message: String(message).slice(0, 160),
        });
      }
    };
    return () => {
      window.__HEYDOCTOR_OBSERVE__ = prev;
    };
  }, []);

  return null;
}
