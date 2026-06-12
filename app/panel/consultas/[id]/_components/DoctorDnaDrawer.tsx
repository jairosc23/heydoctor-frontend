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
            <p className="text-xs text-slate-500">Construyendo firma clínica…</p>
          ) : error ? (
            <p className="text-xs text-red-600">
              No se pudo cargar el perfil clínico del médico.
            </p>
          ) : intelligence ? (
            <div className="space-y-6">
              <section className="border-b border-slate-100 pb-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  Clinical Signature™
                </p>
                <dl className="space-y-2 text-xs">
                  <div>
                    <dt className="text-slate-500">Predominio</dt>
                    <dd className="font-medium text-slate-900">
                      {intelligence.signature.predominance}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Estilo</dt>
                    <dd className="font-medium text-slate-900">
                      {intelligence.signature.style}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Complejidad</dt>
                    <dd className="font-medium text-slate-900">
                      {intelligence.signature.complexity}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Perfil</dt>
                    <dd className="font-medium text-slate-900">
                      {intelligence.signature.profile}
                    </dd>
                  </div>
                </dl>
              </section>

              <section>
                <SectionTitle>¿Qué tipo de médico eres?</SectionTitle>
                <p className="mb-2 text-[11px] text-slate-600">
                  Tu práctica clínica sugiere:
                </p>
                <ul className="list-inside list-disc space-y-1 text-xs text-slate-800">
                  {intelligence.physicianTraits.map((trait) => (
                    <li key={trait}>{trait}</li>
                  ))}
                </ul>
              </section>

              <section>
                <SectionTitle>Patologías más representativas</SectionTitle>
                {intelligence.rankedPathologies.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Aún no hay patologías representativas en tu práctica.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {intelligence.rankedPathologies.map((pathology) => (
                      <li
                        key={pathology.id}
                        className="flex items-start gap-2 text-xs"
                      >
                        <span className="shrink-0" aria-hidden>
                          {pathology.medal}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="font-medium text-slate-900">
                            {pathology.label}
                          </span>
                          {pathology.code ? (
                            <span className="ml-1.5 font-mono text-[10px] text-slate-400">
                              {pathology.code}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <SectionTitle>Intervenciones frecuentes</SectionTitle>
                {intelligence.frequentInterventions.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Sin intervenciones recurrentes identificadas.
                  </p>
                ) : (
                  <ul className="list-inside list-disc space-y-1 text-xs text-slate-800">
                    {intelligence.frequentInterventions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="border-t border-slate-100 pt-4">
                <SectionTitle>Observaciones de Doctor DNA™</SectionTitle>
                <div className="space-y-2">
                  {intelligence.observations.map((observation) => (
                    <p
                      key={observation}
                      className="border-l-2 border-slate-200 pl-2.5 text-xs italic leading-relaxed text-slate-700"
                    >
                      {observation}
                    </p>
                  ))}
                </div>
              </section>

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

export function DoctorDnaSignatureChip({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  const { data, loading, error } = useDoctorDna();
  const chipLabel = useMemo(() => {
    if (loading || error) return "Perfil en carga";
    return buildDoctorDnaIntelligenceView(data).persistentChipLabel;
  }, [data, loading, error]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Abrir Doctor DNA: ${chipLabel}`}
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100/80 px-2 py-0.5 text-[10px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800",
        className,
      )}
    >
      <span aria-hidden>🧠</span>
      <span className="text-slate-500">Doctor DNA</span>
      <span className="truncate text-slate-700">{chipLabel}</span>
    </button>
  );
}
