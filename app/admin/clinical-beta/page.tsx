"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/heydoctor-api";

type CountMap = Record<string, number>;

type ClinicalBetaDashboard = {
  windowHours: number;
  generatedAt: string;
  physicians: {
    enrolled: number;
    active: number;
    countries: CountMap;
    specialties: CountMap;
  };
  clinicalSessions: number;
  feedback: {
    received: number;
    byCategory: CountMap;
    bySource: CountMap;
  };
  errors: {
    open: number;
    resolved: number;
    meanResolutionSeconds: number;
  };
  intelligence: CountMap;
  privacy: {
    storesPatientData: boolean;
    storesIdentifiableClinicalContent: boolean;
    returnsScreenshots: boolean;
  };
};

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-hd-border-subtle bg-white p-4 shadow-hd-1">
      <p className="text-xs uppercase tracking-wide text-primaryDark/60">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-primary">{value}</p>
    </div>
  );
}

function CountList({ title, values }: { title: string; values: CountMap }) {
  const entries = Object.entries(values);
  return (
    <section className="rounded-2xl border border-hd-border-subtle bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-primaryDark">{title}</h2>
      {entries.length === 0 ? (
        <p className="text-sm text-primaryDark/60">Sin datos aún</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {entries.map(([key, count]) => (
            <li key={key} className="flex justify-between gap-4">
              <span>{key}</span>
              <span className="font-medium">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function ClinicalBetaAdminPage() {
  const [data, setData] = useState<ClinicalBetaDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchWithAuth("/api/admin/ops/clinical-beta")
      .then(async (res) => {
        if (!res.ok) throw new Error("dashboard_failed");
        return (await res.json()) as ClinicalBetaDashboard;
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setError("No se pudo cargar el tablero.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-primary">Clinical Beta</h1>
        <p className="text-sm text-primaryDark/70">
          Observabilidad agregada. Sin pacientes ni contenido clínico
          identificable.
        </p>
      </header>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Médicos activos" value={data.physicians.active} />
            <Metric label="Sesiones clínicas" value={data.clinicalSessions} />
            <Metric label="Feedback recibido" value={data.feedback.received} />
            <Metric
              label="Errores abiertos / resueltos"
              value={`${data.errors.open} / ${data.errors.resolved}`}
            />
          </div>
          <Metric
            label="Tiempo medio de resolución (min)"
            value={Math.round(data.errors.meanResolutionSeconds / 60)}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <CountList title="Países" values={data.physicians.countries} />
            <CountList
              title="Especialidades"
              values={data.physicians.specialties}
            />
            <CountList title="Feedback" values={data.feedback.byCategory} />
            <CountList
              title="Clinical Beta Intelligence"
              values={data.intelligence}
            />
          </div>
        </>
      ) : (
        <p className="text-sm text-primaryDark/60">Cargando…</p>
      )}
    </div>
  );
}
