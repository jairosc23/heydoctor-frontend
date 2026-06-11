"use client";

import React from "react";
import { useDoctorDna } from "@/hooks/useDoctorDna";

export interface DoctorDnaCardProps {
  className?: string;
}

function DnaSection({
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

function PatternRow({
  label,
  code,
  frequency,
  preferenceScore,
}: {
  label: string;
  code?: string | null;
  frequency: number;
  preferenceScore: number;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 text-sm text-slate-800">
      {code ? <span className="font-mono text-indigo-700">{code}</span> : null}
      <span className="flex-1 min-w-0">{label}</span>
      <span className="text-xs text-slate-400">{frequency}×</span>
      <span className="text-xs font-medium text-emerald-700">{preferenceScore}</span>
    </div>
  );
}

export function DoctorDnaCard({ className = "" }: DoctorDnaCardProps) {
  const { data, loading, error } = useDoctorDna();

  if (loading) {
    return (
      <section
        className={`rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 ${className}`}
        aria-label="Doctor DNA"
      >
        Cargando Doctor DNA™...
      </section>
    );
  }

  if (error) {
    return (
      <section
        className={`rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700 ${className}`}
        aria-label="Doctor DNA"
      >
        No se pudo cargar el perfil clínico del médico.
      </section>
    );
  }

  const metrics = data.practiceMetrics;

  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white p-4 space-y-4 shadow-sm ${className}`}
      aria-label="Doctor DNA"
    >
      <header>
        <h3 className="text-sm font-semibold text-slate-800">Doctor DNA™</h3>
        <p className="text-xs text-slate-500">
          Perfil de práctica clínica basado en actividad real
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-md bg-slate-50 px-2 py-2">
          <p className="text-lg font-semibold text-slate-800">{metrics.consultations30d}</p>
          <p className="text-xs text-slate-500">Consultas 30d</p>
        </div>
        <div className="rounded-md bg-slate-50 px-2 py-2">
          <p className="text-lg font-semibold text-slate-800">{metrics.prescriptions30d}</p>
          <p className="text-xs text-slate-500">Recetas 30d</p>
        </div>
        <div className="rounded-md bg-slate-50 px-2 py-2">
          <p className="text-lg font-semibold text-slate-800">{metrics.labOrders30d}</p>
          <p className="text-xs text-slate-500">Labs 30d</p>
        </div>
        <div className="rounded-md bg-slate-50 px-2 py-2">
          <p className="text-lg font-semibold text-slate-800">{metrics.uniquePatients30d}</p>
          <p className="text-xs text-slate-500">Pacientes 30d</p>
        </div>
      </div>

      <div className="space-y-3">
        <DnaSection title="Diagnósticos más usados" emptyLabel="Sin patrones aún">
          {data.topDiagnoses.map((item) => (
            <PatternRow
              key={item.id}
              label={item.label}
              code={item.code}
              frequency={item.frequency}
              preferenceScore={item.preferenceScore}
            />
          ))}
        </DnaSection>

        <DnaSection title="Medicamentos más prescritos" emptyLabel="Sin patrones aún">
          {data.topMedications.map((item) => (
            <PatternRow
              key={item.id}
              label={item.label}
              frequency={item.frequency}
              preferenceScore={item.preferenceScore}
            />
          ))}
        </DnaSection>
      </div>
    </section>
  );
}
