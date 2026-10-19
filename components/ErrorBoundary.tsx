"use client";

import React from "react";
import * as Sentry from "@sentry/nextjs";

type FallbackRender = (args: {
  error: Error;
  reset: () => void;
  errorId: string;
  digest?: string;
}) => React.ReactNode;

export type ErrorBoundaryProps = {
  /** Nombre lógico del área (dashboard, telemedicine, root, etc.). */
  name: string;
  children: React.ReactNode;
  /** UI de fallback; si se omite usa una por defecto. */
  fallback?: FallbackRender;
  /** Incluir detalles (stack/digest) solo en desarrollo. */
  showDiagnosticsInDev?: boolean;
  /** Callback opcional (p.ej. logging adicional). */
  onError?: (error: Error, info: React.ErrorInfo) => void;
};

type ErrorBoundaryState = {
  error: Error | null;
  digest?: string;
  errorId: string | null;
};

function safeErrorId(): string {
  try {
    // crypto.randomUUID en navegadores modernos; fallback simple.
    // No usar datos de sesión.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `err_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  } catch {
    return `err_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
}

function DefaultFallback({
  name,
  error,
  reset,
  errorId,
  digest,
  showDiagnosticsInDev,
}: {
  name: string;
  error: Error;
  reset: () => void;
  errorId: string;
  digest?: string;
  showDiagnosticsInDev: boolean;
}) {
  const isDev = process.env.NODE_ENV !== "production";
  const showDiag = isDev && showDiagnosticsInDev;
  return (
    <div
      style={{
        minHeight: 280,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "Open Sans, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 16,
          padding: "28px 22px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          border: "1px solid #fecaca",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flex: "0 0 auto",
            }}
          >
            !
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "#991b1b",
              }}
            >
              Algo salió mal
            </div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>
              Área: <b>{name}</b> · ID: <code>{errorId}</code>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, color: "#6b7280", fontSize: 14 }}>
          {error.message || "Ocurrió un error inesperado."}
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "10px 16px",
              fontSize: 14,
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 600,
              color: "#fff",
              background: "#078a92",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 16px",
              fontSize: 14,
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 600,
              color: "#0f172a",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            Recargar
          </button>
        </div>

        {showDiag && (
          <details style={{ marginTop: 14 }}>
            <summary style={{ cursor: "pointer", color: "#334155" }}>
              Diagnóstico (solo dev)
            </summary>
            <pre
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 12,
                background: "#0b1220",
                color: "#e2e8f0",
                fontSize: 12,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(
                {
                  message: error.message,
                  name: error.name,
                  digest,
                  stack: error.stack,
                },
                null,
                2,
              )}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null, errorId: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      error,
      // Next app router errors sometimes add digest; keep optional.
      digest: (error as Error & { digest?: string }).digest,
      errorId: safeErrorId(),
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    try {
      // Production-safe capture: no cookies/tokens in metadata.
      Sentry.captureException(error, {
        tags: { area: this.props.name },
        extra: {
          componentStack: info.componentStack,
          errorId: this.state.errorId ?? undefined,
          digest: (error as Error & { digest?: string }).digest,
        },
      });
    } catch {
      /* noop */
    }
    try {
      this.props.onError?.(error, info);
    } catch {
      /* noop */
    }
  }

  private reset = () => {
    this.setState({ error: null, digest: undefined, errorId: null });
  };

  render() {
    const { error, digest, errorId } = this.state;
    if (!error || !errorId) {
      return this.props.children;
    }

    const showDiagnosticsInDev = this.props.showDiagnosticsInDev ?? true;
    const fallback = this.props.fallback;
    if (fallback) {
      return fallback({
        error,
        reset: this.reset,
        errorId,
        digest,
      });
    }

    return (
      <DefaultFallback
        name={this.props.name}
        error={error}
        reset={this.reset}
        errorId={errorId}
        digest={digest}
        showDiagnosticsInDev={showDiagnosticsInDev}
      />
    );
  }
}

