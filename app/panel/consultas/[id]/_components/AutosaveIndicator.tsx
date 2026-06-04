"use client";

import { useEffect, useState } from "react";
import type { AutosaveStatus } from "@/lib/hooks/useConsultationAutosave";
import { cn } from "@/lib/utils";

function formatSecondsAgo(lastSavedAt: Date | null): string | null {
  if (!lastSavedAt) return null;
  const sec = Math.max(0, Math.floor((Date.now() - lastSavedAt.getTime()) / 1000));
  if (sec === 0) return "ahora";
  if (sec === 1) return "1 segundo";
  return `${sec} segundos`;
}

export function AutosaveIndicator({
  status,
  lastSavedAt,
  errorMessage,
  className,
}: {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  errorMessage: string | null;
  className?: string;
}) {
  const [, tick] = useState(0);

  useEffect(() => {
    if (!lastSavedAt) return;
    const id = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [lastSavedAt]);

  if (status === "saving" || status === "pending") {
    return (
      <p className={cn("text-sm text-slate-500", className)} role="status">
        Guardando…
      </p>
    );
  }

  if (status === "error" && errorMessage) {
    return (
      <p className={cn("text-sm text-red-600", className)} role="alert">
        {errorMessage}
      </p>
    );
  }

  if (lastSavedAt && (status === "saved" || status === "idle")) {
    const ago = formatSecondsAgo(lastSavedAt);
    if (ago) {
      return (
        <p className={cn("text-sm text-green-700", className)} role="status">
          Guardado hace {ago}
        </p>
      );
    }
  }

  return null;
}
