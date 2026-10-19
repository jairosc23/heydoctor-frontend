"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { HcxText } from "../primitive/HcxText";
import { HcxPressable } from "../primitive/HcxPressable";

export type HcxToastTone = "info" | "success" | "warning" | "critical";

export type HcxToast = {
  id: string;
  title: string;
  body?: string;
  tone?: HcxToastTone;
};

type ToastContextValue = {
  push: (toast: Omit<HcxToast, "id"> & { id?: string }) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useHcxToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useHcxToast must be used within HcxToastProvider");
  }
  return ctx;
}

/**
 * Toast infrastructure — non-clinical, non-authority.
 * Critical clinical truth must not rely on toast alone (HCX law).
 */
export function HcxToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<HcxToast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((toast: Omit<HcxToast, "id"> & { id?: string }) => {
    const id = toast.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        data-testid="hcx-toast-region"
        aria-live="polite"
        aria-relevant="additions"
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          zIndex: 80,
          display: "flex",
          flexDirection: "column",
          gap: "var(--hcx-space-2)",
          maxWidth: 360,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            data-testid="hcx-toast"
            style={{
              background: "var(--hcx-color-bg-raised)",
              border: "1px solid var(--hcx-color-border-subtle)",
              borderLeft: `4px solid var(--hcx-color-brand-500)`,
              borderRadius: "var(--hcx-radius-md)",
              padding: "var(--hcx-space-3)",
              boxShadow: "var(--hcx-elevation-2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <HcxText variant="bodySm" weight="semibold">
                {t.title}
              </HcxText>
              <HcxPressable
                aria-label="Cerrar aviso"
                onClick={() => dismiss(t.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--hcx-color-text-muted)",
                }}
              >
                ×
              </HcxPressable>
            </div>
            {t.body ? (
              <HcxText variant="meta" tone="secondary">
                {t.body}
              </HcxText>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Notification region landmark — inbox chrome shell, not clinical alerts. */
export function HcxNotificationRegion({ children }: { children?: ReactNode }) {
  return (
    <section
      aria-label="Notificaciones"
      data-testid="hcx-notification-region"
      style={{
        padding: "var(--hcx-space-4)",
        background: "var(--hcx-color-bg-muted)",
        borderRadius: "var(--hcx-radius-lg)",
        border: "1px solid var(--hcx-color-border-subtle)",
        minHeight: 80,
      }}
    >
      {children ?? (
        <HcxText variant="bodySm" tone="muted">
          Región de notificaciones (vacía) — sin alertas clínicas en Phase 14.
        </HcxText>
      )}
    </section>
  );
}
