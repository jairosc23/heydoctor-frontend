"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  EncounterContextBarModel,
  EncounterContextChip,
  EncounterContextChipGroup,
  EncounterContextSeverity,
} from "./encounter-context-bar-model";

export interface StickyPatientHeaderProps {
  model: EncounterContextBarModel;
  loading?: boolean;
  className?: string;
}

const COMPACT_SCROLL_THRESHOLD = 96;

function isScrollableElement(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  const overflowY = style.overflowY;
  return (
    /(auto|scroll|overlay)/.test(overflowY) &&
    element.scrollHeight > element.clientHeight
  );
}

function findScrollContainer(element: HTMLElement | null): HTMLElement | Window {
  let current = element?.parentElement ?? null;
  while (current) {
    if (isScrollableElement(current)) return current;
    current = current.parentElement;
  }
  return window;
}

function getScrollTop(container: HTMLElement | Window): number {
  if ("scrollY" in container) return container.scrollY;
  return container.scrollTop;
}

function severityClass(severity?: EncounterContextSeverity): string {
  if (severity === "critical") return "bg-red-50 text-red-800 ring-red-200";
  if (severity === "warning") return "bg-amber-50 text-amber-900 ring-amber-200";
  return "bg-slate-100 text-slate-700 ring-slate-200";
}

function ContextChip({
  chip,
  className,
}: {
  chip: EncounterContextChip;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-[12rem] items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
        severityClass(chip.severity),
        className,
      )}
    >
      <span className="truncate">{chip.label}</span>
    </span>
  );
}

function OverflowChip({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
      +{count}
    </span>
  );
}

function ContinuityGroup({
  label,
  group,
}: {
  label: string;
  group: EncounterContextChipGroup;
}) {
  return (
    <div className="min-w-0">
      <span className="mr-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      {group.visible.length > 0 ? (
        <span className="inline-flex min-w-0 flex-wrap items-center gap-1">
          {group.visible.map((chip) => (
            <ContextChip key={chip.id} chip={chip} className="max-w-[10rem]" />
          ))}
          <OverflowChip count={group.hiddenCount} />
        </span>
      ) : (
        <span className="text-[11px] font-medium text-slate-500">Sin registros activos</span>
      )}
    </div>
  );
}

export function StickyPatientHeader({
  model,
  loading = false,
  className,
}: StickyPatientHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const container = findScrollContainer(headerRef.current);
    const update = () => {
      setCompact(getScrollTop(container) > COMPACT_SCROLL_THRESHOLD);
    };

    update();
    container.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      container.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const riskChips = [
    ...model.risk.allergies,
    ...model.risk.criticalAlerts,
    ...model.risk.warningAlerts,
    ...model.risk.infoAlerts,
  ];
  const visibleRiskChips = riskChips.slice(0, compact ? 2 : 4);
  const riskOverflow = Math.max(0, riskChips.length - visibleRiskChips.length);
  const hasAllergies = model.risk.allergies.length > 0;

  return (
    <section
      ref={headerRef}
      aria-label="Encabezado clínico persistente del paciente"
      data-testid="sticky-patient-header"
      data-compact={compact ? "true" : "false"}
      className={cn(
        "overflow-hidden border-t border-slate-100 bg-white shadow-md ring-1 ring-slate-900/5 transition-all duration-200",
        compact ? "py-1.5" : "py-2",
        className,
      )}
    >
      <div className="space-y-1.5 text-xs text-slate-600">
        <div
          className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1"
          data-testid="context-bar-identity-row"
        >
          <p className="min-w-0 flex-1 truncate font-[Montserrat] text-sm font-bold uppercase tracking-wide text-slate-950">
            {model.identity.name}
          </p>
          <p className="shrink-0 text-[11px] font-medium text-slate-500">
            <span>{compact ? model.identity.compactAge : model.identity.age}</span>
            <span className="hidden sm:inline"> · {model.identity.sex}</span>
            <span className="hidden md:inline">
              {model.identity.documentLabel !== "—"
                ? ` · ${model.identity.documentLabel}`
                : ""}
            </span>
          </p>
          <span className="inline-flex shrink-0 items-center rounded-full bg-primaryLight px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/10">
            {model.identity.statusLabel}
          </span>
        </div>

        <div
          className="flex min-w-0 flex-wrap items-center gap-1.5"
          data-testid="context-bar-risk-row"
        >
          {loading ? (
            <span className="text-[11px] font-medium text-slate-500">
              Evaluando contexto clínico…
            </span>
          ) : null}
          {!loading && !hasAllergies ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 ring-1 ring-emerald-200">
              Sin alergias
            </span>
          ) : null}
          {visibleRiskChips.map((chip) => (
            <ContextChip key={chip.id} chip={chip} />
          ))}
          <OverflowChip count={riskOverflow} />
          <span className="inline-flex max-w-[16rem] items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-800 ring-1 ring-slate-200">
            <span className="mr-1 text-slate-400">Dx</span>
            <span className="truncate">{model.risk.diagnosis}</span>
          </span>
        </div>

        {!compact ? (
          <div
            className="hidden min-w-0 flex-wrap items-center gap-x-4 gap-y-1 lg:flex"
            data-testid="context-bar-continuity-row"
          >
            <ContinuityGroup
              label="Problemas"
              group={model.continuity.activeProblems}
            />
            <ContinuityGroup
              label="Medicamentos"
              group={model.continuity.activeMedications}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
