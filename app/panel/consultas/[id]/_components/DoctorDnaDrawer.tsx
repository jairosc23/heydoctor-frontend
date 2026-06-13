"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import { useDoctorDna } from "@/hooks/useDoctorDna";
import {
  buildDoctorDnaIntelligenceView,
  TREND_SYMBOL,
} from "@/lib/doctor-dna-intelligence";
import { cn } from "@/lib/utils";
import {
  CLINICAL_OVERLAY_BACKDROP_CLASS,
  CLINICAL_OVERLAY_PANEL_CLASS,
} from "@/lib/clinical-overlay-contract";

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </h3>
  );
}

const CLINICAL_INSIGHT_ICONS = ["◆", "◇", "◈", "◊"] as const;

const SIGNATURE_CARDS = [
  { icon: "🧠", label: "Predominio Clínico", key: "predominance" as const },
  { icon: "📈", label: "Estilo de Atención", key: "style" as const },
  { icon: "🏥", label: "Complejidad", key: "complexity" as const },
  { icon: "👥", label: "Perfil Asistencial", key: "profile" as const },
];

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
        className={cn(
          "fixed inset-0 bg-slate-900/10",
          CLINICAL_OVERLAY_BACKDROP_CLASS.intelligence,
        )}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="false"
        aria-label="Doctor DNA Intelligence"
        className={cn(
          "fixed inset-y-0 right-0 flex w-full max-w-sm flex-col",
          "border-l border-slate-200 bg-white",
          CLINICAL_OVERLAY_PANEL_CLASS.intelligence,
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
              <section
                aria-label="Clinical Insight"
                className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-3 py-3 shadow-sm"
              >
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Clinical Insight™
                </p>
                <p className="text-xs leading-snug text-slate-800">
                  <span className="font-medium text-slate-600">
                    Doctor DNA detecta:{" "}
                  </span>
                  <span className="font-medium text-slate-900">
                    &ldquo;{intelligence.primaryInsight}&rdquo;
                  </span>
                </p>
              </section>

              <section className="border-b border-slate-100 pb-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  Clinical Signature™
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SIGNATURE_CARDS.map((card) => (
                    <div
                      key={card.key}
                      className="rounded-md border border-slate-100 bg-slate-50/60 px-2.5 py-2"
                    >
                      <p className="mb-1 text-[10px] leading-tight text-slate-500">
                        <span aria-hidden className="mr-0.5">
                          {card.icon}
                        </span>
                        {card.label}
                      </p>
                      <p className="text-[11px] font-medium leading-snug text-slate-900">
                        {intelligence.signature[card.key]}
                      </p>
                    </div>
                  ))}
                </div>
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
                  <ul className="space-y-3">
                    {intelligence.rankedPathologies.map((pathology) => (
                      <li key={pathology.id} className="flex items-start gap-2">
                        <span className="shrink-0 text-sm" aria-hidden>
                          {pathology.medal}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium leading-snug text-slate-900">
                            {pathology.label}
                          </p>
                          {pathology.code ? (
                            <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                              {pathology.code}
                            </p>
                          ) : null}
                        </div>
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
                  <div className="flex flex-wrap gap-1.5">
                    {intelligence.frequentInterventions.map((item) => (
                      <span
                        key={item}
                        className="inline-flex rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              <section className="border-t border-slate-100 pt-4">
                <SectionTitle>Insights clínicos</SectionTitle>
                <div className="space-y-2.5">
                  {intelligence.observations.map((observation, index) => (
                    <div
                      key={observation}
                      className="flex items-start gap-2 rounded-md bg-slate-50/50 px-2 py-1.5"
                    >
                      <span
                        className="mt-0.5 shrink-0 text-[9px] text-slate-400"
                        aria-hidden
                      >
                        {CLINICAL_INSIGHT_ICONS[index % CLINICAL_INSIGHT_ICONS.length]}
                      </span>
                      <p className="text-[11px] leading-snug text-slate-700">
                        {observation}
                      </p>
                    </div>
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
