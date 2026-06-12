"use client";

import React from "react";
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

function TimelineNode({
  event,
  isLastInSection,
}: {
  event: ClinicalTimelineEvent;
  isLastInSection?: boolean;
}) {
  return (
    <li className={cn("relative pb-3", isLastInSection && "pb-0")}>
      <span
        className={cn(
          "absolute -left-[1.125rem] top-1.5 flex h-2 w-2 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white",
          event.kind === "diagnosis" && "bg-indigo-500",
          event.kind === "consultation" && "bg-slate-400",
          event.kind === "medication" && "bg-teal-500",
          event.kind === "lab" && "bg-amber-500",
        )}
        aria-hidden
      />
      <div className="min-w-0 pl-1">
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {KIND_LABEL[event.kind]}
          </span>
          {event.code ? (
            <span className="font-mono text-[10px] text-indigo-600">{event.code}</span>
          ) : null}
        </div>
        <p className="text-sm font-medium leading-snug text-slate-800">{event.title}</p>
        {event.subtitle ? (
          <p className="text-[11px] text-slate-500">{event.subtitle}</p>
        ) : null}
      </div>
    </li>
  );
}

function YearGroup({ group }: { group: ClinicalTimelineGroup }) {
  return (
    <div className="relative">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-mono text-xs font-bold tabular-nums text-slate-900">
          {group.year}
        </span>
        <span className="h-px flex-1 bg-slate-200" aria-hidden />
      </div>
      <ol className="relative m-0 list-none pl-4">
        {group.events.map((event, index) => (
          <TimelineNode
            key={event.id}
            event={event}
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
    <div className="mb-3 space-y-1 border-b border-slate-100 pb-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Alertas ({alerts.length})
      </p>
      <ul className="space-y-1">
        {alerts.map((alert) => (
          <li
            key={`${alert.code}-${alert.message}`}
            className={cn(
              "rounded px-2 py-1 text-[11px] leading-snug",
              alert.severity === "critical"
                ? "bg-red-50 text-red-800"
                : alert.severity === "warning"
                  ? "bg-amber-50 text-amber-900"
                  : "bg-slate-50 text-slate-700",
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
    <section className={cn(className)} aria-label="Clinical Timeline">
      <details open={defaultExpanded} className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-1 [&::-webkit-details-marker]:hidden">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Clinical Timeline™</h3>
            <p className="text-[10px] text-slate-500">Línea temporal del paciente</p>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-slate-400">
            {model.isEmpty ? "vacío" : `${model.groups.length + (model.undated.length ? 1 : 0)} períodos`}
            <span className="group-open:rotate-180 transition-transform" aria-hidden>
              ▾
            </span>
          </span>
        </summary>

        <div className="pt-2">
          <AlertsStrip alerts={data.alerts} />

          {model.isEmpty ? (
            <p className="text-xs text-slate-400">
              Sin eventos clínicos registrados en la memoria del paciente.
            </p>
          ) : (
            <div className="relative ml-2 border-l border-slate-200 pl-4">
              {model.undated.length > 0 ? (
                <div className="relative mb-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Antecedentes</span>
                    <span className="h-px flex-1 bg-slate-200" aria-hidden />
                  </div>
                  <ol className="relative m-0 list-none pl-4">
                    {model.undated.map((event, index) => (
                      <TimelineNode
                        key={event.id}
                        event={event}
                        isLastInSection={index === model.undated.length - 1}
                      />
                    ))}
                  </ol>
                </div>
              ) : null}

              <div className="space-y-4">
                {model.groups.map((group) => (
                  <YearGroup key={group.year} group={group} />
                ))}
              </div>

              <div className="relative mt-4 border-t border-dashed border-slate-200 pt-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="font-mono text-xs font-bold tabular-nums text-primary">
                    {currentYear}
                  </span>
                  <span className="h-px flex-1 bg-primary/20" aria-hidden />
                </div>
                <div className="relative pl-4">
                  <span
                    className="absolute -left-[1.125rem] top-1 flex h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-primary ring-2 ring-primary/25"
                    aria-hidden
                  />
                  <p className="text-sm font-semibold text-primary">Consulta actual</p>
                  <p className="text-[11px] text-slate-500">Encuentro en curso</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
