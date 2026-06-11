"use client";

import React from "react";
import { usePatientClinicalMemory } from "@/hooks/usePatientClinicalMemory";

export interface PatientMemoryCardProps {
  patientId: string;
  className?: string;
}

function MemorySection({
  title,
  emptyLabel,
  children,
}: {
  title: string;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  const isEmpty = React.Children.count(children) === 0;
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
        {title}
      </h4>
      {isEmpty ? (
        <p className="text-xs text-slate-400">{emptyLabel}</p>
      ) : (
        <div className="space-y-1">{children}</div>
      )}
    </div>
  );
}

export function PatientMemoryCard({ patientId, className = "" }: PatientMemoryCardProps) {
  const { data, loading, error } = usePatientClinicalMemory(patientId);

  if (loading) {
    return (
      <section
        className={`rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 ${className}`}
        aria-label="Clinical Memory"
      >
        Cargando memoria clínica...
      </section>
    );
  }

  if (error) {
    return (
      <section
        className={`rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700 ${className}`}
        aria-label="Clinical Memory"
      >
        No se pudo cargar la memoria clínica.
      </section>
    );
  }

  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white p-4 space-y-4 shadow-sm ${className}`}
      aria-label="Clinical Memory"
    >
      <header>
        <h3 className="text-sm font-semibold text-slate-800">Clinical Memory™</h3>
        <p className="text-xs text-slate-500">Contexto clínico estructurado del paciente</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-1">
        <MemorySection title="Condiciones activas" emptyLabel="Sin condiciones registradas">
          {data.activeConditions.map((item) => (
            <p key={`${item.code ?? item.label}-${item.source}`} className="text-sm text-slate-800">
              {item.code ? (
                <span className="font-mono text-indigo-700 mr-1">{item.code}</span>
              ) : null}
              {item.label}
            </p>
          ))}
        </MemorySection>

        <MemorySection title="Diagnósticos recientes" emptyLabel="Sin diagnósticos recientes">
          {data.recentDiagnoses.map((item) => (
            <p key={`${item.code ?? item.label}-recent`} className="text-sm text-slate-800">
              {item.code ? (
                <span className="font-mono text-indigo-700 mr-1">{item.code}</span>
              ) : null}
              {item.label}
            </p>
          ))}
        </MemorySection>

        <MemorySection title="Medicación actual" emptyLabel="Sin medicación activa">
          {data.currentMedications.map((med) => (
            <p key={med.drugPresentationId ?? med.name} className="text-sm text-slate-800">
              {med.name}
            </p>
          ))}
        </MemorySection>

        <MemorySection title="Laboratorios pendientes" emptyLabel="Sin órdenes pendientes">
          {data.pendingLabs.map((lab) => (
            <p key={`${lab.labOrderId}-${lab.exam}`} className="text-sm text-slate-800">
              {lab.exam}
            </p>
          ))}
        </MemorySection>
      </div>

      <MemorySection title="Alertas clínicas" emptyLabel="Sin alertas">
        {data.alerts.map((alert) => (
          <div
            key={`${alert.code}-${alert.message}`}
            className={`text-sm rounded px-2 py-1 ${
              alert.severity === "critical"
                ? "bg-red-100 text-red-800"
                : alert.severity === "warning"
                  ? "bg-amber-50 text-amber-800"
                  : "bg-blue-50 text-blue-800"
            }`}
          >
            {alert.message}
          </div>
        ))}
      </MemorySection>

      <MemorySection title="Consultas recientes" emptyLabel="Sin consultas previas">
        <ul className="space-y-1">
          {data.recentConsultations.map((c) => (
            <li key={c.id} className="text-sm text-slate-700 flex flex-wrap gap-x-2">
              <span className="text-xs text-slate-400">
                {new Date(c.createdAt).toLocaleDateString("es-CL")}
              </span>
              {c.diagnosisCode && (
                <span className="font-mono text-indigo-700">{c.diagnosisCode}</span>
              )}
              <span>{c.diagnosisLabel ?? "—"}</span>
              <span className="text-xs text-slate-400">({c.status})</span>
            </li>
          ))}
        </ul>
      </MemorySection>
    </section>
  );
}
