"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MedicalCopilotEmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      ) : null}
      {action ? <div className="mt-3 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function MedicalCopilotLoadingState({
  label = "Cargando Medical Copilot…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("space-y-3", className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <p className="text-sm text-slate-500">{label}</p>
      <MedicalCopilotSkeleton />
    </div>
  );
}

export function MedicalCopilotSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-12 animate-pulse rounded-lg bg-slate-200/80"
        />
      ))}
    </div>
  );
}

export function MedicalCopilotErrorState({
  title = "No se pudo cargar el Medical Copilot",
  message,
  onRetry,
  className,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-rose-200 bg-rose-50 px-4 py-5 text-center",
        className,
      )}
      role="alert"
    >
      <p className="text-sm font-semibold text-rose-800">{title}</p>
      {message ? <p className="mt-1 text-sm text-rose-700">{message}</p> : null}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm font-medium text-rose-800 underline"
        >
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
