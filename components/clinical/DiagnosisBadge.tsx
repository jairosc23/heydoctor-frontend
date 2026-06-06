"use client";

import React from "react";
import type { DiagnosisBadgeVariant } from "@/lib/services/consultation-diagnosis";

interface DiagnosisBadgeProps {
  code?: string | null;
  description?: string | null;
  /** structured = FK real; parsed = código visual sin FK; free_text = texto libre */
  variant?: DiagnosisBadgeVariant | null;
  className?: string;
}

/**
 * Diagnóstico CIE-10 en el workspace.
 * Muestra advertencia cuando hay código visual pero no FK (`variant="parsed"`).
 */
export function DiagnosisBadge({
  code,
  description,
  variant = "structured",
  className = "",
}: DiagnosisBadgeProps) {
  if (!code && !description) {
    return null;
  }

  const showUnlinkedWarning = variant === "parsed" && Boolean(code?.trim());

  return (
    <div
      className={`flex flex-col gap-1 text-sm ${className}`}
      data-testid="diagnosis-badge"
      data-variant={variant ?? undefined}
    >
      <div className="flex flex-wrap items-center gap-2">
        {code ? (
          <span
            className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${
              variant === "structured"
                ? "bg-indigo-100 text-indigo-800"
                : variant === "parsed"
                  ? "bg-amber-100 text-amber-900"
                  : "bg-slate-100 text-slate-700"
            }`}
          >
            [{code}]
          </span>
        ) : null}
        {description ? (
          <span className="text-slate-800">{description}</span>
        ) : null}
      </div>
      {showUnlinkedWarning ? (
        <p
          className="text-xs text-amber-800"
          data-testid="diagnosis-badge-unlinked-warning"
        >
          Sin código CIE-10 vinculado — selecciona de nuevo en el buscador para
          persistir la FK.
        </p>
      ) : null}
    </div>
  );
}
