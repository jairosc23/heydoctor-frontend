"use client";

import { cn } from "@/lib/utils";
import {
  clinicalNavigationGroupLabel,
  type ClinicalNavigationCompletion,
  type ClinicalNavigationGroup,
  type ClinicalNavigationSection,
} from "./clinical-navigation-rail-model";

export interface ClinicalNavigationRailProps {
  sections: ClinicalNavigationSection[];
  activeSectionId: string | null;
  onNavigate: (sectionId: string) => void;
  orientation?: "vertical" | "horizontal";
  className?: string;
}

const COMPLETION_LABELS: Record<ClinicalNavigationCompletion, string> = {
  pending: "Pendiente",
  partial: "Parcial",
  complete: "Completado",
  informational: "Informativo",
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
  return (
    <button
      type="button"
      aria-current={active ? "location" : undefined}
      aria-label={`Ir a ${section.label}. Estado: ${
        COMPLETION_LABELS[section.completion]
      }`}
      data-testid={`clinical-navigation-item-${section.sectionNumber}`}
      data-section-id={section.id}
      data-completion={section.completion}
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
      <span className="sr-only">
        {active ? "Sección activa. " : ""}
        {COMPLETION_LABELS[section.completion]}
      </span>
    </button>
  );
}

export function ClinicalNavigationRail({
  sections,
  activeSectionId,
  onNavigate,
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
        "clinical-depth-secondary sticky top-[calc(var(--encounter-chrome-h,5.5rem)+0.75rem)] z-10 max-h-[calc(100vh-var(--encounter-chrome-h,5.5rem)-1.5rem)] overflow-y-auto rounded-hd-lg border border-hd-border-subtle bg-hd-surface-raised p-hd-2 shadow-hd-1",
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
