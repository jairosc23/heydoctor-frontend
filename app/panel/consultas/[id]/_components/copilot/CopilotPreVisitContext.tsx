"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import type { PreVisitContextView } from "@/lib/epic3/pre-visit-context";

function Field({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised px-hd-2 py-hd-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={
          mono
            ? "mt-0.5 font-mono text-xs text-slate-800"
            : "mt-0.5 text-xs leading-snug text-slate-800"
        }
      >
        {value}
      </p>
    </div>
  );
}

function motivoSourceLabel(source: PreVisitContextView["motivoSource"]): string {
  switch (source) {
    case "agenda":
      return "Agenda";
    case "foundation_reason":
      return "Consulta";
    case "foundation_chief_complaint":
      return "Motivo clínico";
    default:
      return "No disponible";
  }
}

function sessionLabel(status: PreVisitContextView["sessionStatus"]): string {
  switch (status) {
    case "ready":
      return "Sesión lista";
    case "loading":
      return "Preparando sesión…";
    case "unavailable":
      return "Sesión no disponible";
    default:
      return "Sin sesión";
  }
}

export function CopilotPreVisitContext({
  view,
  agendaLoading = false,
}: {
  view: PreVisitContextView;
  agendaLoading?: boolean;
}) {
  const health = view.bundleHealth;
  const healthBits = health
    ? [
        health.memoryLoaded ? "Memoria" : null,
        health.intelligenceLoaded ? "Inteligencia" : null,
        health.prescriptionsLoaded ? "Rx" : null,
        health.labsLoaded ? "Labs" : null,
        health.referralsLoaded ? "Interconsultas" : null,
      ].filter(Boolean)
    : [];

  return (
    <section
      aria-label="Pre-visita — contexto clínico"
      data-testid="copilot-pre-visit-context"
      className="space-y-hd-3"
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
          EPIC-3 · Prep · Solo lectura
        </p>
        <h3 className={CLINICAL_SECTION_TITLE}>Contexto pre-consulta</h3>
        <p className="text-[11px] text-slate-500">
          Agenda → Clinical Foundation → Daily Hub
        </p>
      </div>

      <div className="rounded-hd-md border border-primary/20 bg-primaryLight/30 px-hd-3 py-hd-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
          Motivo de consulta
          <span className="ml-1 font-normal text-slate-500">
            · {motivoSourceLabel(view.motivoSource)}
            {agendaLoading ? " · agenda…" : ""}
          </span>
        </p>
        <p className="mt-1 text-sm leading-snug text-slate-900">{view.motivo}</p>
      </div>

      <div className="grid grid-cols-1 gap-hd-2 sm:grid-cols-2">
        <Field
          label="Paciente"
          value={view.patient?.displayName ?? "Cargando…"}
        />
        <Field
          label="Estado del encounter"
          value={view.encounter?.statusLabel ?? "Cargando…"}
        />
        {view.patient?.documentLabel ? (
          <Field label="Documento" value={view.patient.documentLabel} mono />
        ) : null}
        {view.patient?.sex ? (
          <Field label="Sexo" value={view.patient.sex} />
        ) : null}
        {view.patient?.birthDate ? (
          <Field label="Fecha de nacimiento" value={view.patient.birthDate} mono />
        ) : null}
        {view.agenda.startsAt ? (
          <Field label="Cita (Agenda)" value={view.agenda.startsAt} mono />
        ) : null}
      </div>

      <div className="rounded-hd-md border border-hd-border-subtle bg-slate-50/80 px-hd-3 py-hd-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Clinical Foundation
        </p>
        {view.foundationError ? (
          <p className="mt-1 text-[11px] text-amber-800">{view.foundationError}</p>
        ) : view.foundationReady ? (
          <p className="mt-1 text-[11px] text-slate-700">
            Contexto consolidado
            {healthBits.length > 0 ? `: ${healthBits.join(" · ")}` : "."}
          </p>
        ) : (
          <p className="mt-1 text-[11px] text-slate-500">
            Cargando Clinical Foundation…
          </p>
        )}
        <p className="mt-1 text-[11px] text-slate-500">
          HeyDoctor Copilot Session: {sessionLabel(view.sessionStatus)}
          {view.sessionId ? (
            <span className="ml-1 font-mono text-[10px] text-slate-400">
              ({view.sessionId.slice(0, 8)}…)
            </span>
          ) : null}
        </p>
      </div>
    </section>
  );
}
