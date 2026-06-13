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
  dense = false,
}: {
  event: ClinicalTimelineEvent;
  isLastInSection?: boolean;
  currentYear: number;
  dense?: boolean;
}) {
  const recent = isRecentEvent(event, currentYear);
  const isDiagnosis = event.kind === "diagnosis";

  return (
    <li
      className={cn(
        "clinical-timeline-item relative",
        dense ? "pb-hd-2" : "pb-hd-4",
        isLastInSection && "pb-0",
      )}
    >
      <span
        className={cn(
          "absolute -left-[1.625rem] top-3 flex -translate-x-1/2 items-center justify-center rounded-full border-2 border-white shadow-sm",
          dense ? "h-2 w-2" : "top-4 h-2.5 w-2.5",
          event.kind === "diagnosis" && "bg-indigo-500",
          event.kind === "consultation" && "bg-slate-400",
          event.kind === "medication" && "bg-teal-500",
          event.kind === "lab" && "bg-amber-500",
          recent && !dense && "ring-2 ring-primary/20",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "min-w-0 rounded-hd-md border border-l-[3px] border-hd-border-subtle transition-all duration-hd-base",
          KIND_ACCENT[event.kind],
          dense ? "px-hd-2 py-hd-1.5" : "px-hd-3 py-hd-2.5",
          recent && !dense && "shadow-hd-1",
          isDiagnosis && !dense && "ring-1 ring-indigo-100/80",
        )}
      >
        {dense ? (
          <p className="truncate text-[11px] leading-snug text-slate-800">
            <span className="font-semibold text-slate-500">
              {KIND_LABEL[event.kind]}
            </span>
            {" · "}
            {event.code ? (
              <span className="font-mono text-[10px] text-indigo-700">
                {event.code}{" "}
              </span>
            ) : null}
            <span className={isDiagnosis ? "font-semibold" : "font-medium"}>
              {event.title}
            </span>
          </p>
        ) : (
          <>
            <div className="space-y-1.5">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {KIND_LABEL[event.kind]}
              </span>
              {recent || event.code ? (
                <div className="flex flex-wrap items-center gap-2">
                  {recent ? (
                    <ClinicalStatusBadge status="active" label="Reciente" />
                  ) : null}
                  {event.code ? (
                    <span className="font-mono text-[10px] font-medium text-indigo-700">
                      {event.code}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
            <p
              className={cn(
                "mt-hd-2 leading-snug text-slate-800",
                isDiagnosis ? "text-sm font-semibold" : "text-sm font-medium",
              )}
            >
              {event.title}
            </p>
            {event.subtitle ? (
              <p className="text-[11px] text-slate-500">{event.subtitle}</p>
            ) : null}
          </>
        )}
      </div>
    </li>
  );
}

function YearGroup({
  group,
  currentYear,
  dense = false,
}: {
  group: ClinicalTimelineGroup;
  currentYear: number;
  dense?: boolean;
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
      <ol className="relative m-0 list-none pl-5">
        {group.events.map((event, index) => (
          <TimelineNode
            key={event.id}
            event={event}
            currentYear={currentYear}
            dense={dense}
            isLastInSection={index === group.events.length - 1}
          />
        ))}
      </ol>
    </div>
  );
}

function AlertsStrip({
  alerts,
  dense = false,
}: {
  alerts: ClinicalMemoryAlert[];
  dense?: boolean;
}) {
  if (alerts.length === 0) return null;
  return (
    <div
      className={cn(
        "border-b border-hd-border-subtle",
        dense ? "mb-hd-2 space-y-hd-1 pb-hd-2" : "mb-hd-3 space-y-hd-1 pb-hd-3",
      )}
    >
      <p className="heydoctor-presence text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Alertas ({alerts.length})
      </p>
      <ul className="space-y-hd-1">
        {alerts.map((alert) => (
          <li
            key={`${alert.code}-${alert.message}`}
            className={cn(
              "rounded-hd-md leading-snug",
              dense ? "px-hd-1.5 py-0.5 text-[10px]" : "px-hd-2 py-hd-1 text-[11px]",
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
  /** Phase 4.3 — colapsado por defecto + histórico anidado. */
  progressiveDisclosure?: boolean;
  /** Phase 4.4A — nodos compactos al expandir. */
  dense?: boolean;
}

function countTimelineEvents(model: ReturnType<typeof buildClinicalTimeline>): number {
  return (
    model.groups.reduce((total, group) => total + group.events.length, 0) +
    model.undated.length
  );
}

function latestTimelineEvent(
  model: ReturnType<typeof buildClinicalTimeline>,
): ClinicalTimelineEvent | null {
  const all = [
    ...model.undated,
    ...model.groups.flatMap((group) => group.events),
  ];
  if (all.length === 0) return null;
  return [...all].sort((a, b) => b.sortAt - a.sortAt)[0] ?? null;
}

export function ClinicalTimeline({
  data,
  currentConsultationId,
  className,
  defaultExpanded = true,
  progressiveDisclosure = false,
  dense = false,
}: ClinicalTimelineProps) {
  const model = buildClinicalTimeline(data, { currentConsultationId });
  const currentYear = new Date().getFullYear();
  const isOpenByDefault = progressiveDisclosure ? false : defaultExpanded;
  const totalEvents = countTimelineEvents(model);
  const latestEvent = latestTimelineEvent(model);
  const recentGroups = model.groups.filter((group) => group.year >= currentYear - 1);
  const historicalGroups = model.groups.filter((group) => group.year < currentYear - 1);

  return (
    <section
      className={cn("clinical-timeline-elevated", className)}
      aria-label="Clinical Timeline"
      data-progressive={progressiveDisclosure ? "true" : undefined}
      data-dense={dense ? "true" : undefined}
    >
      <details open={isOpenByDefault} className="group">
        <summary className="clinical-interactive flex cursor-pointer list-none items-center justify-between gap-hd-2 rounded-hd-md py-hd-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 [&::-webkit-details-marker]:hidden">
          <div className="heydoctor-presence min-w-0">
            <h3 className="text-sm font-semibold text-slate-900">
              Clinical Timeline™
            </h3>
            {progressiveDisclosure ? (
              <>
                <p className="truncate text-[10px] text-slate-500 group-open:hidden">
                  {totalEvents} eventos
                  {latestEvent ? ` · ${latestEvent.title}` : ""}
                </p>
                <p className="hidden text-[10px] text-slate-500 group-open:block">
                  Historia clínica visual
                </p>
              </>
            ) : (
              <p className="text-[10px] text-slate-500">Historia clínica visual</p>
            )}
          </div>
          <span className="flex shrink-0 items-center gap-1 text-[10px] text-slate-400">
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

        <div className={cn(dense ? "pt-hd-2" : "pt-hd-3")}>
          <AlertsStrip alerts={data.alerts} dense={dense} />

          {model.isEmpty ? (
            <p className="text-xs text-slate-400">
              Sin eventos clínicos registrados en la memoria del paciente.
            </p>
          ) : (
            <div className="relative ml-2 border-l-2 border-gradient-to-b border-slate-200 pl-5">
              {model.undated.length > 0 ? (
                <div className="relative mb-hd-4">
                  <div className="mb-hd-2 flex items-center gap-hd-2">
                    <span className="text-xs font-bold text-slate-500">
                      Antecedentes
                    </span>
                    <span className="h-px flex-1 bg-slate-200" aria-hidden />
                  </div>
                  <ol className="relative m-0 list-none pl-5">
                    {model.undated.map((event, index) => (
                      <TimelineNode
                        key={event.id}
                        event={event}
                        currentYear={currentYear}
                        dense={dense}
                        isLastInSection={index === model.undated.length - 1}
                      />
                    ))}
                  </ol>
                </div>
              ) : null}

              <div className={cn(dense ? "space-y-hd-2" : "space-y-hd-4")}>
                {(progressiveDisclosure ? recentGroups : model.groups).map((group) => (
                  <YearGroup
                    key={group.year}
                    group={group}
                    currentYear={currentYear}
                    dense={dense}
                  />
                ))}
              </div>

              {progressiveDisclosure && historicalGroups.length > 0 ? (
                <details className={dense ? "mt-hd-2" : "mt-hd-3"}>
                  <summary className="clinical-interactive cursor-pointer list-none rounded-hd-md py-hd-1 text-[11px] font-semibold text-slate-600 hover:text-primary [&::-webkit-details-marker]:hidden">
                    Histórico ({historicalGroups[0]?.year}–
                    {historicalGroups[historicalGroups.length - 1]?.year}) ·{" "}
                    {historicalGroups.reduce((n, g) => n + g.events.length, 0)}{" "}
                    eventos
                  </summary>
                  <div className={cn(dense ? "mt-hd-1 space-y-hd-2" : "mt-hd-2 space-y-hd-4")}>
                    {historicalGroups.map((group) => (
                      <YearGroup
                        key={group.year}
                        group={group}
                        currentYear={currentYear}
                        dense={dense}
                      />
                    ))}
                  </div>
                </details>
              ) : null}

              <div
                className={cn(
                  "relative rounded-hd-md border border-primary/20 bg-primaryLight/30",
                  dense ? "mt-hd-2 px-hd-2 py-hd-2" : "mt-hd-4 px-hd-3 py-hd-3",
                )}
              >
                <div className={cn(dense ? "mb-hd-2 space-y-1" : "mb-hd-3 space-y-1.5")}>
                  <div className="flex items-center gap-hd-2">
                    <span className="font-mono text-xs font-bold tabular-nums text-primary">
                      {currentYear}
                    </span>
                    <span className="h-px flex-1 bg-primary/25" aria-hidden />
                  </div>
                  <ClinicalStatusBadge
                    status="active"
                    label="Consulta actual"
                    className="w-fit"
                  />
                </div>
                <div className="relative pl-5">
                  <span
                    className={cn(
                      "absolute -left-[1.625rem] flex -translate-x-1/2 rounded-full bg-primary ring-4 ring-primary/15",
                      dense ? "top-1 h-2.5 w-2.5" : "top-1.5 h-3 w-3",
                    )}
                    aria-hidden
                  />
                  <p className={cn("font-semibold text-primary", dense ? "text-xs" : "text-sm")}>
                    Encuentro en curso
                  </p>
                  {!dense ? (
                    <p className="mt-1 text-[11px] text-slate-600">
                      Punto activo de la línea temporal
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </details>
    </section>
  );
}
