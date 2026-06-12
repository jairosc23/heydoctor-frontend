"use client";

import { useEffect } from "react";
import { useDoctorDna } from "@/hooks/useDoctorDna";
import type { DoctorDnaProfile } from "@/lib/types/doctor-dna";
import { cn } from "@/lib/utils";

function MetricCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-0">
      <p className="text-lg font-semibold tabular-nums text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}

function PatternRow({
  label,
  code,
  frequency,
}: {
  label: string;
  code?: string | null;
  frequency: number;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-slate-50 py-1.5 last:border-0">
      <div className="min-w-0 flex-1">
        {code ? (
          <span className="mr-1.5 font-mono text-[10px] text-indigo-600">{code}</span>
        ) : null}
        <span className="text-xs text-slate-800">{label}</span>
      </div>
      <span className="shrink-0 text-[10px] tabular-nums text-slate-400">{frequency}×</span>
    </div>
  );
}

function buildInsights(data: DoctorDnaProfile) {
  const topDx = data.topDiagnoses[0];
  const { consultations30d, prescriptions30d } = data.practiceMetrics;

  const dominantPattern =
    data.topDiagnoses.length >= 3 && prescriptions30d > 5
      ? "Medicina crónica"
      : consultations30d > 15
        ? "Alta rotación ambulatoria"
        : "Práctica diversificada";

  const recentActivity =
    consultations30d === 0
      ? "sin actividad reciente"
      : consultations30d < 5
        ? "moderada"
        : "estable";

  return {
    dominantPattern,
    mainFocus: topDx?.label ?? "Sin patrón dominante",
    recentActivity,
  };
}

export interface DoctorDnaDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function DoctorDnaDrawer({ open, onClose }: DoctorDnaDrawerProps) {
  const { data, loading, error } = useDoctorDna();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const insights = buildInsights(data);
  const metrics = data.practiceMetrics;

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar Doctor DNA Intelligence"
        className="fixed inset-0 z-40 bg-slate-900/10"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="false"
        aria-label="Doctor DNA Intelligence"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col",
          "border-l border-slate-200 bg-white",
        )}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Doctor DNA Intelligence™
            </h2>
            <p className="text-[10px] text-slate-500">Perfil de práctica clínica</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <p className="text-xs text-slate-500">Cargando perfil de práctica…</p>
          ) : error ? (
            <p className="text-xs text-red-600">
              No se pudo cargar el perfil clínico del médico.
            </p>
          ) : (
            <div className="space-y-6">
              <section>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Actividad
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <MetricCell value={metrics.consultations30d} label="Consultas 30d" />
                  <MetricCell value={metrics.uniquePatients30d} label="Pacientes 30d" />
                  <MetricCell value={metrics.prescriptions30d} label="Recetas 30d" />
                  <MetricCell value={metrics.labOrders30d} label="Labs 30d" />
                </div>
              </section>

              <section>
                <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Diagnósticos frecuentes
                </h3>
                {data.topDiagnoses.length === 0 ? (
                  <p className="text-xs text-slate-400">Sin patrones aún</p>
                ) : (
                  <div>
                    {data.topDiagnoses.map((item) => (
                      <PatternRow
                        key={item.id}
                        label={item.label}
                        code={item.code}
                        frequency={item.frequency}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Medicamentos frecuentes
                </h3>
                {data.topMedications.length === 0 ? (
                  <p className="text-xs text-slate-400">Sin patrones aún</p>
                ) : (
                  <div>
                    {data.topMedications.map((item) => (
                      <PatternRow
                        key={item.id}
                        label={item.label}
                        frequency={item.frequency}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="border-t border-slate-100 pt-4">
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Insights
                </h3>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Patrón dominante</dt>
                    <dd className="text-right font-medium text-slate-800">
                      {insights.dominantPattern}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Enfoque principal</dt>
                    <dd className="text-right font-medium text-slate-800">
                      {insights.mainFocus}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-500">Actividad reciente</dt>
                    <dd className="text-right font-medium text-slate-800">
                      {insights.recentActivity}
                    </dd>
                  </div>
                </dl>
              </section>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export function DoctorDnaDrawerTrigger({
  onClick,
  active = false,
  className,
}: {
  onClick: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir Doctor DNA Intelligence"
      title="Doctor DNA Intelligence"
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-md border px-2 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primaryLight text-primary"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
        className,
      )}
    >
      <span aria-hidden>🧠</span>
      <span className="hidden md:inline">Intelligence</span>
    </button>
  );
}
