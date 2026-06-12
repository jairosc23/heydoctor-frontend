"use client";

import React from "react";
import { ClinicalStatusBadge } from "@/components/clinical/design";
import type { ClinicalMemoryAlert } from "@/lib/types/clinical-memory";
import {
  buildClinicalTimeline,
  type ClinicalTimelineEvent,
  type ClinicalTimelineGroup,
} from "@/lib/clinical-timeline-events";
import type { PatientClinicalMemory } from "@/lib/types/clinical-memory";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<ClinicalTimelineEvent["kind"], string> = {
  diagnosis: "Diagnóstico",
  consultation: "Consulta",
  medication: "Medicación",
  lab: "Laboratorio",
};

const KIND_ACCENT: Record<ClinicalTimelineEvent["kind"], string> = {
  diagnosis: "border-l-indigo-400/70 bg-indigo-50/40",
  consultation: "border-l-slate-400/60 bg-slate-50/50",
  medication: "border-l-teal-400/70 bg-teal-50/35",
  lab: "border-l-amber-400/70 bg-amber-50/35",
};

function isRecentEvent(event: ClinicalTimelineEvent, currentYear: number): boolean {
  return event.year >= currentYear - 1 && event.sortAt > 0;
}

function TimelineNode({
  event,
  isLastInSection,
  currentYear,
}: {
  event: ClinicalTimelineEvent;
  isLastInSection?: boolean;
  currentYear: number;
}) {
  const recent = isRecentEvent(event, currentYear);
  const isDiagnosis = event.kind === "diagnosis";

  return (
    <li
      className={cn(
        "clinical-timeline-item relative pb-hd-3",
        isLastInSection && "pb-0",
      )}
    >
      <span
        className={cn(
          "absolute -left-[1.35rem] top-3 flex h-2.5 w-2.5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white shadow-sm",
          event.kind === "diagnosis" && "bg-indigo-500",
          event.kind === "consultation" && "bg-slate-400",
          event.kind === "medication" && "bg-teal-500",
          event.kind === "lab" && "bg-amber-500",
          recent && "ring-2 ring-primary/20",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "min-w-0 rounded-hd-md border border-l-[3px] border-hd-border-subtle px-hd-2 py-hd-2 transition-all duration-hd-base",
          KIND_ACCENT[event.kind],
          recent && "shadow-hd-1",
          isDiagnosis && "ring-1 ring-indigo-100/80",
        )}
      >
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            {KIND_LABEL[event.kind]}
          </span>
          {recent ? (
            <ClinicalStatusBadge status="active" label="Reciente" />
          ) : null}
          {event.code ? (
            <span className="font-mono text-[10px] font-medium text-indigo-700">
              {event.code}
            </span>
          ) : null}
        </div>
        <p
          className={cn(
            "leading-snug text-slate-800",
            isDiagnosis ? "text-sm font-semibold" : "text-sm font-medium",
          )}
        >
          {event.title}
        </p>
        {event.subtitle ? (
          <p className="text-[11px] text-slate-500">{event.subtitle}</p>
        ) : null}
      </div>
    </li>
  );
}

function YearGroup({
  group,
  currentYear,
}: {
  group: ClinicalTimelineGroup;
  currentYear: number;
}) {
  const isCurrentYear = group.year === currentYear;

  return (
    <div className="relative">
      <div className="mb-hd-2 flex items-center gap-hd-2">
        <span
          className={cn(
            "font-mono text-xs font-bold tabular-nums",
            isCurrentYear ? "text-primary" : "text-slate-900",
          )}
        >
          {group.year}
        </span>
        <span
          className={cn(
            "h-px flex-1",
            isCurrentYear ? "bg-primary/25" : "bg-slate-200",
          )}
          aria-hidden
        />
      </div>
      <ol className="relative m-0 list-none pl-4">
        {group.events.map((event, index) => (
          <TimelineNode
            key={event.id}
            event={event}
            currentYear={currentYear}
            isLastInSection={index === group.events.length - 1}
          />
        ))}
      </ol>
    </div>
  );
}

function AlertsStrip({ alerts }: { alerts: ClinicalMemoryAlert[] }) {
  if (alerts.length === 0) return null;
  return (
    <div className="mb-hd-3 space-y-hd-1 border-b border-hd-border-subtle pb-hd-3">
      <p className="heydoctor-presence text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Alertas ({alerts.length})
      </p>
      <ul className="space-y-hd-1">
        {alerts.map((alert) => (
          <li
            key={`${alert.code}-${alert.message}`}
            className={cn(
              "rounded-hd-md px-hd-2 py-hd-1 text-[11px] leading-snug",
              alert.severity === "critical"
                ? "clinical-status clinical-status--critical border"
                : alert.severity === "warning"
                  ? "clinical-status clinical-status--pending border"
                  : "clinical-status clinical-status--draft border",
            )}
          >
            {alert.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface ClinicalTimelineProps {
  data: PatientClinicalMemory;
  currentConsultationId?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export function ClinicalTimeline({
  data,
  currentConsultationId,
  className,
  defaultExpanded = true,
}: ClinicalTimelineProps) {
  const model = buildClinicalTimeline(data, { currentConsultationId });
  const currentYear = new Date().getFullYear();

  return (
    <section
      className={cn("clinical-timeline-elevated", className)}
      aria-label="Clinical Timeline"
    >
      <details open={defaultExpanded} className="group">
        <summary className="clinical-interactive flex cursor-pointer list-none items-center justify-between gap-hd-2 rounded-hd-md py-hd-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 [&::-webkit-details-marker]:hidden">
          <div className="heydoctor-presence">
            <h3 className="text-sm font-semibold text-slate-900">
              Clinical Timeline™
            </h3>
            <p className="text-[10px] text-slate-500">Historia clínica visual</p>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            {model.isEmpty
              ? "vacío"
              : `${model.groups.length + (model.undated.length ? 1 : 0)} períodos`}
            <span
              className="transition-transform duration-hd-base group-open:rotate-180"
              aria-hidden
            >
              ▾
            </span>
          </span>
        </summary>

        <div className="pt-hd-2">
          <AlertsStrip alerts={data.alerts} />

          {model.isEmpty ? (
            <p className="text-xs text-slate-400">
              Sin eventos clínicos registrados en la memoria del paciente.
            </p>
          ) : (
            <div className="relative ml-2 border-l-2 border-gradient-to-b border-slate-200 pl-4">
              {model.undated.length > 0 ? (
                <div className="relative mb-hd-4">
                  <div className="mb-hd-2 flex items-center gap-hd-2">
                    <span className="text-xs font-bold text-slate-500">
                      Antecedentes
                    </span>
                    <span className="h-px flex-1 bg-slate-200" aria-hidden />
                  </div>
                  <ol className="relative m-0 list-none pl-4">
                    {model.undated.map((event, index) => (
                      <TimelineNode
                        key={event.id}
                        event={event}
                        currentYear={currentYear}
                        isLastInSection={index === model.undated.length - 1}
                      />
                    ))}
                  </ol>
                </div>
              ) : null}

              <div className="space-y-hd-4">
                {model.groups.map((group) => (
                  <YearGroup
                    key={group.year}
                    group={group}
                    currentYear={currentYear}
                  />
                ))}
              </div>

              <div className="relative mt-hd-4 rounded-hd-md border border-primary/20 bg-primaryLight/30 px-hd-3 py-hd-3">
                <div className="mb-hd-2 flex items-center gap-hd-2">
                  <span className="font-mono text-xs font-bold tabular-nums text-primary">
                    {currentYear}
                  </span>
                  <span className="h-px flex-1 bg-primary/25" aria-hidden />
                  <ClinicalStatusBadge status="active" label="Consulta actual" />
                </div>
                <div className="relative pl-4">
                  <span
                    className="absolute -left-[1.35rem] top-1 flex h-3 w-3 -translate-x-1/2 rounded-full bg-primary ring-4 ring-primary/15"
                    aria-hidden
                  />
                  <p className="text-sm font-semibold text-primary">
                    Encuentro en curso
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Punto activo de la línea temporal
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
