"use client";

import React from "react";
import { useOptionalClinicalIntelligence } from "@/context/ClinicalIntelligenceContext";
import { useOptionalConsultationPlan } from "@/context/ConsultationPlanProvider";
import type {
  UnifiedClinicalPlan,
  UnifiedClinicalPlanItem,
} from "@/lib/types/unified-clinical-plan";

export interface UnifiedClinicalActionBarProps {
  className?: string;
}

function PlanSection({
  title,
  items,
  editable,
  onToggle,
}: {
  title: string;
  items: UnifiedClinicalPlanItem[];
  editable: boolean;
  onToggle: (id: string, enabled: boolean) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
        {title}
      </h4>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2 text-sm text-slate-800">
            {editable ? (
              <input
                type="checkbox"
                checked={item.enabled}
                onChange={(e) => onToggle(item.id, e.target.checked)}
                className="mt-1"
                aria-label={`Incluir ${item.label}`}
              />
            ) : null}
            <span className={item.enabled ? undefined : "line-through text-slate-400"}>
              <span className="font-medium">{item.label}</span>
              {item.reason ? (
                <span className="block text-xs text-slate-500">{item.reason}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlanSummaryCounts({ plan }: { plan: UnifiedClinicalPlan }) {
  const counts = [
    { label: "Medicamentos", n: plan.medications.filter((i) => i.enabled).length },
    { label: "Laboratorios", n: plan.labs.filter((i) => i.enabled).length },
    { label: "Educación", n: plan.education.filter((i) => i.enabled).length },
    { label: "Seguimiento", n: plan.followUp.filter((i) => i.enabled).length },
  ].filter((c) => c.n > 0);

  if (counts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {counts.map((c) => (
        <span
          key={c.label}
          className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
        >
          {c.n} {c.label.toLowerCase()}
        </span>
      ))}
    </div>
  );
}

export function UnifiedClinicalActionBar({ className = "" }: UnifiedClinicalActionBarProps) {
  const clinicalIntelligence = useOptionalClinicalIntelligence();
  const consultationPlan = useOptionalConsultationPlan();

  if (!clinicalIntelligence || !consultationPlan) {
    return null;
  }

  const { cie10CodeId } = clinicalIntelligence;
  const {
    plan,
    loading,
    error,
    viewMode,
    applying,
    applied,
    applyError,
    itemCount,
    reviewPlan,
    editPlan,
    closeDetail,
    toggleItem,
    applyPlan,
    canApply,
  } = consultationPlan;

  if (!cie10CodeId && !plan && !loading) {
    return (
      <section
        className={`rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 ${className}`}
        aria-label="Unified Clinical Action Bar"
      >
        Seleccione un diagnóstico CIE-10 para ver el plan clínico unificado.
      </section>
    );
  }

  if (loading) {
    return (
      <section
        className={`rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 ${className}`}
        aria-label="Unified Clinical Action Bar"
      >
        Preparando plan clínico unificado...
      </section>
    );
  }

  if (error) {
    return (
      <section
        className={`rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700 ${className}`}
        aria-label="Unified Clinical Action Bar"
      >
        No se pudo cargar el plan clínico.
      </section>
    );
  }

  if (!plan || itemCount === 0) {
    return (
      <section
        className={`rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 ${className}`}
        aria-label="Unified Clinical Action Bar"
      >
        Sin acciones clínicas sugeridas para este diagnóstico. Use órdenes manuales si corresponde.
      </section>
    );
  }

  const editable = viewMode === "edit";
  const showDetails = viewMode === "review" || viewMode === "edit";

  return (
    <section
      className={`rounded-lg border border-violet-200 bg-white p-3 space-y-3 shadow-sm ${className}`}
      aria-label="Unified Clinical Action Bar"
    >
      <header className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-violet-900">
            Plan clínico unificado
          </h3>
          <span className="text-xs font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded">
            {plan.sourceLabel}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-900">{plan.title}</p>
        <p className="text-xs text-slate-600">{plan.explanation}</p>
      </header>

      {!showDetails ? <PlanSummaryCounts plan={plan} /> : null}

      {applied ? (
        <p className="text-sm font-medium text-emerald-700">
          Plan aplicado. Revise las órdenes en el panel derecho.
        </p>
      ) : null}

      {showDetails ? (
        <div className="grid gap-3 sm:grid-cols-2 border-t border-slate-100 pt-3">
          <PlanSection
            title="Medicamentos"
            items={plan.medications}
            editable={editable}
            onToggle={toggleItem}
          />
          <PlanSection
            title="Laboratorios"
            items={plan.labs}
            editable={editable}
            onToggle={toggleItem}
          />
          <PlanSection
            title="Educación"
            items={plan.education}
            editable={editable}
            onToggle={toggleItem}
          />
          <PlanSection
            title="Seguimiento"
            items={plan.followUp}
            editable={editable}
            onToggle={toggleItem}
          />
        </div>
      ) : null}

      {applyError ? <p className="text-xs text-red-600">{applyError}</p> : null}

      {!applied ? (
        <div className="flex flex-wrap gap-2">
          {viewMode === "summary" ? (
            <>
              <button
                type="button"
                disabled={!canApply || applying}
                onClick={() => void applyPlan()}
                className="px-3 py-2 text-sm rounded-md bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 min-h-[44px]"
              >
                {applying ? "Aplicando..." : "Aplicar plan"}
              </button>
              <button
                type="button"
                onClick={reviewPlan}
                className="px-3 py-2 text-sm rounded-md border border-violet-300 text-violet-800 hover:bg-violet-50 min-h-[44px]"
              >
                Revisar plan
              </button>
              <button
                type="button"
                onClick={editPlan}
                className="px-3 py-2 text-sm rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 min-h-[44px]"
              >
                Editar plan
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={!canApply || applying}
                onClick={() => void applyPlan()}
                className="px-3 py-2 text-sm rounded-md bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 min-h-[44px]"
              >
                {applying ? "Aplicando..." : viewMode === "edit" ? "Aplicar selección" : "Aplicar plan"}
              </button>
              <button
                type="button"
                onClick={closeDetail}
                className="px-3 py-2 text-sm rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 min-h-[44px]"
              >
                Volver
              </button>
            </>
          )}
        </div>
      ) : null}

      <p className="text-xs text-slate-500">
        El médico confirma cada acción. Sin ejecución automática.
      </p>
    </section>
  );
}
