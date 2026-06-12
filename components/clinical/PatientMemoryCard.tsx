"use client";

import React from "react";
import { usePatientClinicalMemory } from "@/hooks/usePatientClinicalMemory";
import { cn } from "@/lib/utils";

export interface PatientMemoryCardProps {
  patientId: string;
  className?: string;
}

function MemoryAccordion({
  title,
  count,
  defaultOpen = false,
  children,
  emptyLabel,
}: {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  emptyLabel: string;
}) {
  const isEmpty = count === 0;
  return (
    <details
      open={defaultOpen && !isEmpty}
      className="group border-b border-slate-100 py-1.5 last:border-0"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 hover:text-slate-800 [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span className="flex items-center gap-1.5 text-[10px] font-normal normal-case text-slate-400">
          {isEmpty ? "vacío" : `${count}`}
          <span className="group-open:rotate-180 transition-transform" aria-hidden>
            ▾
          </span>
        </span>
      </summary>
      <div className="pb-2 pt-1">
        {isEmpty ? (
          <p className="text-xs text-slate-400">{emptyLabel}</p>
        ) : (
          <div className="space-y-1">{children}</div>
        )}
      </div>
    </details>
  );
}

export function PatientMemoryCard({ patientId, className = "" }: PatientMemoryCardProps) {
  const { data, loading, error } = usePatientClinicalMemory(patientId);

  if (loading) {
    return (
      <section
        className={cn(
          "rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500",
          className,
        )}
        aria-label="Memoria clínica"
      >
        Cargando memoria clínica…
      </section>
    );
  }

  if (error) {
    return (
      <section
        className={cn(
          "rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700",
          className,
        )}
        aria-label="Memoria clínica"
      >
        No se pudo cargar la memoria clínica.
      </section>
    );
  }

  return (
    <section
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-3 shadow-sm",
        className,
      )}
      aria-label="Memoria clínica"
    >
      <header className="mb-2">
        <h3 className="text-sm font-semibold text-slate-800">Memoria clínica</h3>
        <p className="text-[11px] text-slate-500">Contexto estructurado del paciente</p>
      </header>

      <MemoryAccordion
        title="Condiciones activas"
        count={data.activeConditions.length}
        defaultOpen
        emptyLabel="Sin condiciones registradas"
      >
        {data.activeConditions.map((item) => (
          <p key={`${item.code ?? item.label}-${item.source}`} className="text-sm text-slate-800">
            {item.code ? (
              <span className="mr-1 font-mono text-indigo-700">{item.code}</span>
            ) : null}
            {item.label}
          </p>
        ))}
      </MemoryAccordion>

      <MemoryAccordion
        title="Diagnósticos recientes"
        count={data.recentDiagnoses.length}
        emptyLabel="Sin diagnósticos recientes"
      >
        {data.recentDiagnoses.map((item) => (
          <p key={`${item.code ?? item.label}-recent`} className="text-sm text-slate-800">
            {item.code ? (
              <span className="mr-1 font-mono text-indigo-700">{item.code}</span>
            ) : null}
            {item.label}
          </p>
        ))}
      </MemoryAccordion>

      <MemoryAccordion
        title="Medicación actual"
        count={data.currentMedications.length}
        defaultOpen
        emptyLabel="Sin medicación activa"
      >
        {data.currentMedications.map((med) => (
          <p key={med.drugPresentationId ?? med.name} className="text-sm text-slate-800">
            {med.name}
          </p>
        ))}
      </MemoryAccordion>

      <MemoryAccordion
        title="Laboratorios pendientes"
        count={data.pendingLabs.length}
        emptyLabel="Sin órdenes pendientes"
      >
        {data.pendingLabs.map((lab) => (
          <p key={`${lab.labOrderId}-${lab.exam}`} className="text-sm text-slate-800">
            {lab.exam}
          </p>
        ))}
      </MemoryAccordion>

      <MemoryAccordion
        title="Alertas clínicas"
        count={data.alerts.length}
        defaultOpen={data.alerts.some((a) => a.severity === "critical" || a.severity === "warning")}
        emptyLabel="Sin alertas"
      >
        {data.alerts.map((alert) => (
          <div
            key={`${alert.code}-${alert.message}`}
            className={cn(
              "rounded px-2 py-1 text-sm",
              alert.severity === "critical"
                ? "bg-red-100 text-red-800"
                : alert.severity === "warning"
                  ? "bg-amber-50 text-amber-800"
                  : "bg-blue-50 text-blue-800",
            )}
          >
            {alert.message}
          </div>
        ))}
      </MemoryAccordion>

      <MemoryAccordion
        title="Consultas recientes"
        count={data.recentConsultations.length}
        emptyLabel="Sin consultas previas"
      >
        <ul className="space-y-1">
          {data.recentConsultations.map((c) => (
            <li key={c.id} className="flex flex-wrap gap-x-2 text-sm text-slate-700">
              <span className="text-xs text-slate-400">
                {new Date(c.createdAt).toLocaleDateString("es-CL")}
              </span>
              {c.diagnosisCode ? (
                <span className="font-mono text-indigo-700">{c.diagnosisCode}</span>
              ) : null}
              <span>{c.diagnosisLabel ?? "—"}</span>
              <span className="text-xs text-slate-400">({c.status})</span>
            </li>
          ))}
        </ul>
      </MemoryAccordion>
    </section>
  );
}
