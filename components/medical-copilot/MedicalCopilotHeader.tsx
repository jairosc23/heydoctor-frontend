"use client";

import { ClinicalStatusBadge } from "@/components/clinical/design";
import { cn } from "@/lib/utils";

export function MedicalCopilotHeader({
  consultationId,
  sessionId,
  className,
}: {
  consultationId: string;
  sessionId?: string | null;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Medical Copilot
        </p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
          Workspace clínico
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Vista gobernada de la consulta. No es un chat: resume artifacts,
          timeline, memoria clínica efímera y acciones elegibles para revisión
          médica.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ClinicalStatusBadge status="pending" label="HITL" />
        <ClinicalStatusBadge status="unexecuted" label="Sin ejecución" />
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
          Consulta {consultationId.slice(0, 8)}…
        </span>
        {sessionId ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            Sesión {sessionId.slice(0, 8)}…
          </span>
        ) : null}
      </div>
    </header>
  );
}
