"use client";

import { ClinicalCard } from "@/components/clinical/design";
import { ClinicalStatusBadge } from "@/components/clinical/design";
import type { MedicalCopilotSessionSummary } from "@/lib/medical-copilot/types";
import type { ClinicalStatusKey } from "@/lib/clinical-status-language";

function mapSessionStatus(status?: string): ClinicalStatusKey {
  switch (status) {
    case "active":
      return "active";
    case "completed":
      return "completed";
    case "failed":
    case "cancelled":
      return "critical";
    default:
      return "draft";
  }
}

export function MedicalCopilotSessionCard({
  session,
}: {
  session: MedicalCopilotSessionSummary | null;
}) {
  if (!session) return null;

  return (
    <ClinicalCard className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Sesión del Copiloto
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Contenedor clínico gobernado — no representa una conversación.
          </p>
        </div>
        <ClinicalStatusBadge
          status={mapSessionStatus(session.status)}
          label={session.status ?? "created"}
        />
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Session
          </dt>
          <dd className="mt-1 font-mono text-xs text-slate-800">
            {session.sessionId}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Consulta
          </dt>
          <dd className="mt-1 font-mono text-xs text-slate-800">
            {session.consultationId}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Paciente
          </dt>
          <dd className="mt-1 font-mono text-xs text-slate-800">
            {session.patientId}
          </dd>
        </div>
      </dl>
    </ClinicalCard>
  );
}
