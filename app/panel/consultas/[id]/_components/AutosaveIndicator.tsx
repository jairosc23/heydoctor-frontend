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
      <span data-testid="autosave-syncing" className={cn(className)}>
        <ClinicalStatusBadge
          status={autosaveStatusToClinical(status)}
          label="Sincronizando…"
        />
      </span>
    );
  }

  if (status === "error" && errorMessage) {
    return (
      <span className={cn(className)} role="alert" data-testid="autosave-error">
        <ClinicalStatusBadge
          status="critical"
          label="No se pudo sincronizar. Use Guardar."
          showDot={false}
        />
      </span>
    );
  }

  if (lastSavedAt && (status === "saved" || status === "idle")) {
    const ago = formatSecondsAgo(lastSavedAt);
    if (ago) {
      return (
        <span data-testid="autosave-synced" className={cn(className)}>
          <ClinicalStatusBadge
            status={autosaveStatusToClinical("saved")}
            label={`Sincronizado hace ${ago}`}
          />
        </span>
      );
    }
  }

  return null;
}
