"use client";

import { cn } from "@/lib/utils";
import {
  clinicalNavigationGroupLabel,
  type ClinicalNavigationCompletion,
  type ClinicalNavigationGroup,
  type ClinicalNavigationProgress,
  type ClinicalNavigationRisk,
  type ClinicalNavigationSection,
} from "./clinical-navigation-rail-model";

export interface ClinicalNavigationRailProps {
  sections: ClinicalNavigationSection[];
  activeSectionId: string | null;
  onNavigate: (sectionId: string) => void;
  progress?: ClinicalNavigationProgress;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

const COMPLETION_LABELS: Record<ClinicalNavigationCompletion, string> = {
  empty: "Sin iniciar",
  in_progress: "En progreso",
  completed: "Completado",
  warning: "Requiere atención",
  blocked: "Bloqueado",
};

const RISK_LABELS: Record<ClinicalNavigationRisk, string> = {
  critical: "Crítico",
  warning: "Advertencia",
  info: "Informativo",
};

function groupedSections(sections: ClinicalNavigationSection[]) {
  return sections.reduce<
    Array<{ group: ClinicalNavigationGroup; sections: ClinicalNavigationSection[] }>
  >((groups, section) => {
    const current = groups[groups.length - 1];
    if (current?.group === section.group) {
      current.sections.push(section);
      return groups;
    }
    groups.push({ group: section.group, sections: [section] });
    return groups;
  }, []);
}

function completionDotClass(
  completion: ClinicalNavigationCompletion,
  risk?: ClinicalNavigationRisk,
) {
  if (risk) {
    if (risk === "critical") return "border-red-200 bg-red-500";
    if (risk === "warning") return "border-amber-200 bg-amber-500";
    return "border-blue-200 bg-blue-500";
  }
  if (completion === "blocked") return "border-red-200 bg-red-500";
  if (completion === "warning") return "border-amber-200 bg-amber-500";
  if (completion === "completed") return "border-emerald-200 bg-emerald-500";
  if (completion === "in_progress") return "border-blue-200 bg-blue-500";
  return "border-slate-200 bg-slate-300";
}

function NavigationRailItem({
  section,
  active,
  orientation,
  onNavigate,
}: {
  section: ClinicalNavigationSection;
  active: boolean;
  orientation: "vertical" | "horizontal";
  onNavigate: (sectionId: string) => void;
}) {
  const label = orientation === "horizontal" ? section.shortLabel : section.label;
  const riskLabel = section.risk ? ` Riesgo: ${RISK_LABELS[section.risk]}.` : "";
  const helperLabel = section.helperText ? ` ${section.helperText}.` : "";
  return (
    <button
      type="button"
      aria-current={active ? "location" : undefined}
      aria-label={`Ir a ${section.label}. Estado: ${
        COMPLETION_LABELS[section.completion]
      }.${riskLabel}${helperLabel}`}
      data-testid={`clinical-navigation-item-${section.sectionNumber}`}
      data-section-id={section.id}
      data-completion={section.completion}
      data-risk={section.risk}
      data-validation={section.validationCode}
      onClick={() => onNavigate(section.id)}
      className={cn(
        "clinical-interactive min-w-0 rounded-hd-md border text-left font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        orientation === "vertical"
          ? "flex w-full items-center gap-2 px-2.5 py-2 text-[11px]"
          : "inline-flex min-h-11 shrink-0 items-center gap-1.5 px-3 py-2 text-xs",
        active
          ? "border-primary/25 bg-primaryLight text-primary"
          : "border-transparent bg-transparent text-slate-600 hover:border-hd-border-subtle hover:bg-hd-surface-muted",
      )}
    >
      <span
        className={cn(
          "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
          active ? "bg-primary text-white" : "bg-slate-100 text-slate-500",
        )}
        aria-hidden
      >
        {section.sectionNumber}
      </span>
      <span className="min-w-0 truncate">{label}</span>
      <span
        className={cn(
          "ml-auto inline-flex h-2.5 w-2.5 shrink-0 rounded-full border",
          completionDotClass(section.completion, section.risk),
        )}
        aria-hidden
      />
      <span className="sr-only">
        {active ? "Sección activa. " : ""}
        {COMPLETION_LABELS[section.completion]}
        {section.risk ? `. ${RISK_LABELS[section.risk]}` : ""}
      </span>
    </button>
  );
}

function RailProgressSummary({
  progress,
  compact = false,
}: {
  progress: ClinicalNavigationProgress;
  compact?: boolean;
}) {
  return (
    <div
      data-testid="clinical-navigation-progress"
      data-progress={progress.completionPercentage}
      data-signature-ready={progress.signatureReady ? "true" : "false"}
      className={cn(
        "rounded-hd-md border border-hd-border-subtle bg-hd-surface-muted",
        compact ? "min-w-[132px] px-2 py-1.5" : "mt-hd-2 px-2 py-1.5",
      )}
    >
      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-slate-600">
        <span>{progress.completionPercentage}%</span>
        <span
          className={cn(
            progress.signatureReady ? "text-emerald-700" : "text-amber-700",
          )}
        >
          {progress.signatureReady ? "Firma lista" : "Firma pendiente"}
        </span>
      </div>
      <div
        className="mt-1 h-1.5 overflow-hidden rounded-full bg-white"
        aria-hidden
      >
        <div
          className={cn(
            "h-full rounded-full",
            progress.signatureReady ? "bg-emerald-500" : "bg-primary",
          )}
          style={{ width: `${progress.completionPercentage}%` }}
        />
      </div>
      {!compact ? (
        <p className="mt-1 text-[10px] text-slate-500">
          {progress.completedSections}/{progress.totalSections} completas ·{" "}
          {progress.pendingSections} pendientes
        </p>
      ) : null}
    </div>
  );
}

export function ClinicalNavigationRail({
  sections,
  activeSectionId,
  onNavigate,
  progress,
  orientation = "vertical",
  className,
}: ClinicalNavigationRailProps) {
  if (sections.length === 0) return null;

  if (orientation === "horizontal") {
    return (
      <nav
        aria-label="Navegación de ficha clínica"
        data-testid="clinical-navigation-rail"
        data-orientation="horizontal"
        className={cn(
          "flex gap-1 overflow-x-auto rounded-hd-lg border border-hd-border-subtle bg-hd-surface-raised p-1 shadow-hd-1",
          className,
        )}
      >
        {progress ? <RailProgressSummary progress={progress} compact /> : null}
        {sections.map((section) => (
          <NavigationRailItem
            key={section.id}
            section={section}
            active={section.id === activeSectionId}
            orientation="horizontal"
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Navegación de ficha clínica"
      data-testid="clinical-navigation-rail"
      data-orientation="vertical"
      className={cn(
        // PanelLayout header is h-16 (4rem); subtract it so the rail viewport
        // matches the scrollable <main> and the last nav item stays reachable.
        "clinical-depth-secondary sticky top-[calc(var(--encounter-chrome-h,5.5rem)+0.75rem)] z-10 max-h-[calc(100vh-4rem-var(--encounter-chrome-h,5.5rem)-1.5rem)] overflow-y-auto rounded-hd-lg border border-hd-border-subtle bg-hd-surface-raised p-hd-2 shadow-hd-1",
        className,
      )}
    >
      <div className="mb-hd-2 border-b border-hd-border-subtle pb-hd-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
          Navegación clínica
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Ficha Clínica
        </p>
        {progress ? <RailProgressSummary progress={progress} /> : null}
      </div>
      <div className="space-y-hd-3">
        {groupedSections(sections).map((group) => (
          <div key={group.group} className="space-y-1">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {clinicalNavigationGroupLabel(group.group)}
            </p>
            <div className="space-y-0.5">
              {group.sections.map((section) => (
                <NavigationRailItem
                  key={section.id}
                  section={section}
                  active={section.id === activeSectionId}
                  orientation="vertical"
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
