"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import type { AuthTelemetryEvent } from "@/lib/auth-telemetry";
import { getApiBase } from "@/lib/api-base";
import { logger } from "@/lib/logger";

type ConnectivityState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "ok"; latencyMs: number; httpStatus: number }
  | { status: "fail"; latencyMs: number; error: string; httpStatus?: number };

type WebrtcSnapshot = {
  connectionState: string | null;
  iceConnectionState: string | null;
  quality: string | null;
  reconnecting: boolean | null;
  updatedAtMs: number | null;
};

type TelemetrySnapshot = {
  lastEvent: AuthTelemetryEvent | null;
  lastEventAtMs: number | null;
  refreshTimeoutAtMs: number | null;
  refreshFailAtMs: number | null;
  bootstrapTimeoutAtMs: number | null;
  csrfTimeoutAtMs: number | null;
  unauthorizedAtMs: number | null;
};

function formatAge(ms: number | null): string {
  if (!ms) return "—";
  const delta = Date.now() - ms;
  if (delta < 0) return "—";
  if (delta < 1000) return `${delta}ms`;
  const s = Math.round(delta / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  return `${m}m`;
}

function safeHasCookie(name: string): boolean | "unknown" {
  // If HttpOnly, this will be unknown (cannot read). We do NOT print cookie values.
  try {
    if (typeof document === "undefined") return "unknown";
    const cookies = document.cookie || "";
    if (!cookies) return false;
    return cookies.split(";").some((c) => c.trim().startsWith(`${name}=`));
  } catch {
    return "unknown";
  }
}

function devOnly(): boolean {
  return process.env.NODE_ENV !== "production";
}

export function DevSessionDiagnosticsPanel() {
  const isDev = devOnly();
  const pathname = usePathname();
  const { user, isAuthenticated, loading, sessionRevalidating } = useAuth();

  const [open, setOpen] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetrySnapshot>({
    lastEvent: null,
    lastEventAtMs: null,
    refreshTimeoutAtMs: null,
    refreshFailAtMs: null,
    bootstrapTimeoutAtMs: null,
    csrfTimeoutAtMs: null,
    unauthorizedAtMs: null,
  });
  const [connectivity, setConnectivity] = useState<ConnectivityState>({
    status: "idle",
  });
  const [webrtc, setWebrtc] = useState<WebrtcSnapshot>({
    connectionState: null,
    iceConnectionState: null,
    quality: null,
    reconnecting: null,
    updatedAtMs: null,
  });

  const panelId = useMemo(
    () => `devdiag_${Math.random().toString(16).slice(2)}`,
    [],
  );

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Auth telemetry hook (dev-only): passive listener. No tokens/cookies.
  useEffect(() => {
    if (!isDev) return;
    if (typeof window === "undefined") return;

    const prev = window.__HEYDOCTOR_AUTH_TELEMETRY__;
    window.__HEYDOCTOR_AUTH_TELEMETRY__ = (event, detail) => {
      try {
        prev?.(event, detail);
      } catch {
        /* noop */
      }
      const now = Date.now();
      setTelemetry((t) => {
        const next: TelemetrySnapshot = {
          ...t,
          lastEvent: event,
          lastEventAtMs: now,
        };
        if (event === "refresh_timeout") next.refreshTimeoutAtMs = now;
        if (event === "refresh_fail") next.refreshFailAtMs = now;
        if (event === "bootstrap_timeout") next.bootstrapTimeoutAtMs = now;
        if (event === "csrf_bootstrap_timeout") next.csrfTimeoutAtMs = now;
        if (event === "unauthorized") next.unauthorizedAtMs = now;
        return next;
      });
    };

    return () => {
      // Restore previous handler.
      window.__HEYDOCTOR_AUTH_TELEMETRY__ = prev;
    };
  }, [isDev]);

  // WebRTC state (dev-only): listen for hook-emitted events.
  useEffect(() => {
    if (!isDev) return;
    if (typeof window === "undefined") return;

    const onWebrtc = (e: Event) => {
      const ce = e as CustomEvent<Partial<WebrtcSnapshot>>;
      const d = ce.detail ?? {};
      setWebrtc((w) => ({
        connectionState:
          typeof d.connectionState === "string" || d.connectionState === null
            ? d.connectionState
            : w.connectionState,
        iceConnectionState:
          typeof d.iceConnectionState === "string" || d.iceConnectionState === null
            ? d.iceConnectionState
            : w.iceConnectionState,
        quality:
          typeof d.quality === "string" || d.quality === null ? d.quality : w.quality,
        reconnecting:
          typeof d.reconnecting === "boolean" || d.reconnecting === null
            ? d.reconnecting
            : w.reconnecting,
        updatedAtMs: Date.now(),
      }));
    };
    window.addEventListener("heydoctor:webrtc-state", onWebrtc as EventListener);
    return () =>
      window.removeEventListener(
        "heydoctor:webrtc-state",
        onWebrtc as EventListener,
      );
  }, [isDev]);

  const ssrSessionDetected = safeHasCookie("heydoctor_session");
  const ssrAccessFallbackDetected = safeHasCookie("access_token");

  const isTelemedicineRoute =
    typeof pathname === "string" &&
    (pathname.startsWith("/teleconsulta") ||
      /\/panel\/consultas\/[^/]+\/teleconsulta$/.test(pathname));

  async function checkApiConnectivity() {
    if (!isDev) return;
    if (connectivity.status === "checking") return;
    const start = performance.now();
    setConnectivity({ status: "checking" });
    const url = `${getApiBase()}/health/version`;
    try {
      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const latencyMs = Math.round(performance.now() - start);
      if (!mountedRef.current) return;
      if (res.ok) {
        setConnectivity({ status: "ok", latencyMs, httpStatus: res.status });
      } else {
        setConnectivity({
          status: "fail",
          latencyMs,
          httpStatus: res.status,
          error: `HTTP ${res.status}`,
        });
      }
    } catch (e) {
      const latencyMs = Math.round(performance.now() - start);
      if (!mountedRef.current) return;
      setConnectivity({
        status: "fail",
        latencyMs,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  if (!isDev) return null;

  return (
    <div
      data-dev-session-diagnostics={panelId}
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 2147483647,
        width: open ? 360 : 170,
        maxWidth: "calc(100vw - 24px)",
        fontFamily: "Open Sans, sans-serif",
      }}
    >
      <div
        style={{
          background: "#0b1220",
          color: "#e2e8f0",
          borderRadius: 14,
          border: "1px solid rgba(148,163,184,0.25)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            background: "transparent",
            color: "inherit",
            border: "none",
            cursor: "pointer",
          }}
        >
          <span style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700 }}>
            DEV Session
          </span>
          <span style={{ opacity: 0.85, fontSize: 12 }}>
            {open ? "Cerrar" : "Abrir"}
          </span>
        </button>

        {open && (
          <div style={{ padding: "10px 12px 12px" }}>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
              Ruta: <code>{pathname ?? "—"}</code>
            </div>

            <Section title="SSR / Middleware">
              <Row
                k="SSR sesión (heydoctor_session)"
                v={
                  ssrSessionDetected === "unknown"
                    ? "desconocido (HttpOnly?)"
                    : ssrSessionDetected
                      ? "sí"
                      : "no"
                }
              />
              <Row
                k="Fallback access_token (no recomendado SSR)"
                v={
                  ssrAccessFallbackDetected === "unknown"
                    ? "desconocido"
                    : ssrAccessFallbackDetected
                      ? "sí"
                      : "no"
                }
              />
              <Row
                k="Sync status"
                v={
                  ssrSessionDetected === true
                    ? "sincronizado"
                    : ssrSessionDetected === false && isAuthenticated
                      ? "posible des-sync (SSR cookie ausente)"
                      : "—"
                }
              />
            </Section>

            <Section title="Auth bootstrap / refresh">
              <Row k="Auth loading" v={loading ? "sí" : "no"} />
              <Row k="Session revalidating" v={sessionRevalidating ? "sí" : "no"} />
              <Row k="isAuthenticated" v={isAuthenticated ? "sí" : "no"} />
              <Row k="User loaded" v={user ? "sí" : "no"} />
              <Row k="Último evento" v={telemetry.lastEvent ?? "—"} />
              <Row k="Último evento hace" v={formatAge(telemetry.lastEventAtMs)} />
              <Row
                k="Refresh timeout hace"
                v={formatAge(telemetry.refreshTimeoutAtMs)}
              />
              <Row k="Refresh fail hace" v={formatAge(telemetry.refreshFailAtMs)} />
              <Row
                k="Bootstrap timeout hace"
                v={formatAge(telemetry.bootstrapTimeoutAtMs)}
              />
              <Row
                k="CSRF timeout hace"
                v={formatAge(telemetry.csrfTimeoutAtMs)}
              />
              <Row
                k="Unauthorized hace"
                v={formatAge(telemetry.unauthorizedAtMs)}
              />
            </Section>

            <Section title="API connectivity">
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    void checkApiConnectivity().catch((e) =>
                      logger.warn("[API] connectivity check failed", e),
                    );
                  }}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid rgba(148,163,184,0.25)",
                    background: "#111827",
                    color: "#e2e8f0",
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                  }}
                >
                  {connectivity.status === "checking" ? "Chequeando…" : "Chequear"}
                </button>
                <span style={{ fontSize: 12, opacity: 0.85 }}>
                  {connectivity.status === "idle" && "—"}
                  {connectivity.status === "checking" && "…"}
                  {connectivity.status === "ok" &&
                    `OK (${connectivity.httpStatus}) · ${connectivity.latencyMs}ms`}
                  {connectivity.status === "fail" &&
                    `FAIL · ${connectivity.error} · ${connectivity.latencyMs}ms`}
                </span>
              </div>
              <div style={{ marginTop: 6, fontSize: 11, opacity: 0.75 }}>
                Ping: <code>{`${getApiBase()}/health/version`}</code>
              </div>
            </Section>

            <Section title="WebRTC signaling">
              <Row k="En ruta telemedicina" v={isTelemedicineRoute ? "sí" : "no"} />
              <Row k="PC connectionState" v={webrtc.connectionState ?? "—"} />
              <Row k="ICE connectionState" v={webrtc.iceConnectionState ?? "—"} />
              <Row k="Quality" v={webrtc.quality ?? "—"} />
              <Row
                k="Reconnecting"
                v={
                  webrtc.reconnecting == null
                    ? "—"
                    : webrtc.reconnecting
                      ? "sí"
                      : "no"
                }
              />
              <Row k="Update hace" v={formatAge(webrtc.updatedAtMs)} />
              <div style={{ marginTop: 6, fontSize: 11, opacity: 0.75 }}>
                (dev-only) eventos: <code>heydoctor:webrtc-state</code>
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: 12,
          fontWeight: 800,
          color: "#93c5fd",
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div
        style={{
          border: "1px solid rgba(148,163,184,0.18)",
          borderRadius: 12,
          padding: 10,
          background: "rgba(15,23,42,0.55)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        fontSize: 12,
        lineHeight: 1.4,
        padding: "3px 0",
      }}
    >
      <span style={{ opacity: 0.85 }}>{k}</span>
      <span style={{ textAlign: "right", maxWidth: 190, wordBreak: "break-word" }}>
        {v}
      </span>
    </div>
  );
}

