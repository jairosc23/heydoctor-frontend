"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useDoctorDna } from "@/hooks/useDoctorDna";
import {
  buildDoctorDnaIntelligenceView,
  TREND_SYMBOL,
} from "@/lib/doctor-dna-intelligence";
import { cn } from "@/lib/utils";

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </h3>
  );
}

function ClinicalListItem({ children }: { children: ReactNode }) {
  return (
    <li className="border-b border-slate-50 py-1.5 text-xs leading-snug text-slate-800 last:border-0">
      {children}
    </li>
  );
}

export interface DoctorDnaDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function DoctorDnaDrawer({ open, onClose }: DoctorDnaDrawerProps) {
  const { data, loading, error } = useDoctorDna();

  const intelligence = useMemo(
    () => (loading || error ? null : buildDoctorDnaIntelligenceView(data)),
    [data, loading, error],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

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
            <h2 className="text-sm font-semibold text-slate-900">Doctor DNA™</h2>
            <p className="text-[10px] text-slate-500">Clinical Intelligence Layer</p>
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
            <p className="text-xs text-slate-500">Interpretando perfil clínico…</p>
          ) : error ? (
            <p className="text-xs text-red-600">
              No se pudo cargar el perfil clínico del médico.
            </p>
          ) : intelligence ? (
            <div className="space-y-6">
              <section>
                <SectionTitle>Actividad reciente</SectionTitle>
                <ul className="space-y-1.5">
                  {intelligence.activity.map((line) => (
                    <li key={line.id} className="text-xs text-slate-800">
                      <span className="font-semibold tabular-nums text-slate-900">
                        {line.value}
                      </span>{" "}
                      {line.text.replace(/^\d+\s*/, "")}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
                  Resumen interpretativo de tu práctica en los últimos 30 días.
                </p>
              </section>

              <section>
                <SectionTitle>Diagnósticos dominantes</SectionTitle>
                {intelligence.dominantDiagnoses.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Aún no hay patrones diagnósticos suficientes.
                  </p>
                ) : (
                  <ul className="list-none">
                    {intelligence.dominantDiagnoses.map((dx) => (
                      <ClinicalListItem key={dx.id}>{dx.display}</ClinicalListItem>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <SectionTitle>Medicamentos más prescritos</SectionTitle>
                {intelligence.topMedications.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Sin medicación recurrente registrada.
                  </p>
                ) : (
                  <ul className="list-none">
                    {intelligence.topMedications.map((med) => (
                      <ClinicalListItem key={med.id}>{med.label}</ClinicalListItem>
                    ))}
                  </ul>
                )}
              </section>

              <section className="border-t border-slate-100 pt-4">
                <SectionTitle>Perfil clínico detectado</SectionTitle>
                <dl className="space-y-2 text-xs">
                  <div>
                    <dt className="text-slate-500">Predominio</dt>
                    <dd className="font-medium text-slate-900">
                      {intelligence.clinicalProfile.predominance}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Área principal</dt>
                    <dd className="font-medium text-slate-900">
                      {intelligence.clinicalProfile.mainArea}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Complejidad</dt>
                    <dd className="font-medium text-slate-900">
                      {intelligence.clinicalProfile.complexity}
                    </dd>
                  </div>
                </dl>
              </section>

              <section>
                <SectionTitle>Tendencias recientes</SectionTitle>
                {intelligence.trends.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Sin tendencias diagnósticas identificables.
                  </p>
                ) : (
                  <ul className="list-none space-y-1">
                    {intelligence.trends.map((trend) => (
                      <li
                        key={trend.id}
                        className="flex items-start gap-2 text-xs text-slate-800"
                      >
                        <span
                          className={cn(
                            "shrink-0 font-mono font-semibold",
                            trend.direction === "up" && "text-emerald-700",
                            trend.direction === "stable" && "text-slate-500",
                            trend.direction === "down" && "text-amber-700",
                          )}
                          aria-hidden
                        >
                          {TREND_SYMBOL[trend.direction]}
                        </span>
                        <span>{trend.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-[10px] text-slate-400">
                  Tendencias inferidas por frecuencia, recencia y preferencia clínica.
                </p>
              </section>
            </div>
          ) : null}
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
