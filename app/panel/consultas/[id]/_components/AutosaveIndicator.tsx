"use client";

import { useEffect, useState } from "react";
import { ClinicalStatusBadge } from "@/components/clinical/design";
import { autosaveStatusToClinical } from "@/lib/clinical-status-language";
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
      <ClinicalStatusBadge
        status={autosaveStatusToClinical(status)}
        label="Guardando…"
        className={cn(className)}
      />
    );
  }

  if (status === "error" && errorMessage) {
    return (
      <span className={cn(className)} role="alert">
        <ClinicalStatusBadge
          status="critical"
          label={errorMessage}
          showDot={false}
        />
      </span>
    );
  }

  if (lastSavedAt && (status === "saved" || status === "idle")) {
    const ago = formatSecondsAgo(lastSavedAt);
    if (ago) {
      return (
        <ClinicalStatusBadge
          status={autosaveStatusToClinical("saved")}
          label={`Guardado hace ${ago}`}
          className={cn(className)}
        />
      );
    }
  }

  return null;
}
