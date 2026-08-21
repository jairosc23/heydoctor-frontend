"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";
import {
  DISCLOSURE_RAIL_LABEL,
  buildSignatureReadyRailGroups,
  partitionSignatureReadyRailGroups,
  type ClinicalNavigationCompletion,
  type ClinicalNavigationProgress,
  type ClinicalNavigationRailEntry,
  type ClinicalNavigationRisk,
  type ClinicalNavigationSection,
  type SignatureReadyRailGroup,
} from "./clinical-navigation-rail-model";

/** Scrollport más cercano (p. ej. `<main>` del PanelLayout). */
function nearestScrollPort(el: HTMLElement): HTMLElement | null {
  let parent: HTMLElement | null = el.parentElement;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (
      overflowY === "auto" ||
      overflowY === "scroll" ||
      overflowY === "overlay"
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

/**
 * Ajusta max-height al espacio visible real bajo el sticky top:
 * viewport clínico, zoom, visualViewport y borde inferior del scrollport.
 */
function useRailStickyMaxHeight(
  enabled: boolean,
  navRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!enabled) return;
    const el = navRef.current;
    if (!el) return;

    const apply = () => {
      const top = el.getBoundingClientRect().top;
      const scrollPort = nearestScrollPort(el);
      let bottom: number;
      if (scrollPort) {
        bottom = scrollPort.getBoundingClientRect().bottom;
      } else if (window.visualViewport) {
        bottom =
          window.visualViewport.offsetTop + window.visualViewport.height;
      } else {
        bottom = window.innerHeight;
      }
      // Aire inferior para que el último ítem quede alcanzable al hacer scroll.
      const available = Math.floor(bottom - top - 16);
      if (Number.isFinite(available) && available > 0) {
        el.style.maxHeight = `${Math.max(160, available)}px`;
      }
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    const scrollPort = nearestScrollPort(el);
    if (scrollPort) ro.observe(scrollPort);
    window.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("scroll", apply);
    scrollPort?.addEventListener("scroll", apply, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("scroll", apply);
      scrollPort?.removeEventListener("scroll", apply);
    };
  }, [enabled, navRef]);
}

function useRevealActiveRailItem(
  railRef: RefObject<HTMLElement | null>,
  activeSectionId: string | null,
) {
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !activeSectionId) return;
    const item = rail.querySelector(
      `[data-section-id="${typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(activeSectionId) : activeSectionId}"]`,
    );
    if (!(item instanceof HTMLElement)) return;
    if (typeof item.scrollIntoView !== "function") return;
    item.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeSectionId, railRef]);
}

function RailGroup({
  group,
  activeSectionId,
  orientation,
  disclosureExpanded,
  onNavigate,
  onToggleDisclosure,
}: {
  group: SignatureReadyRailGroup;
  activeSectionId: string | null;
  orientation: "vertical" | "horizontal";
  disclosureExpanded: boolean;
  onNavigate: (sectionId: string) => void;
  onToggleDisclosure: () => void;
}) {
  return (
    <div
      className={orientation === "vertical" ? "space-y-1" : undefined}
      data-care-path-step={group.key}
    >
      {orientation === "vertical" ? (
        <p className="px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {group.label}
        </p>
      ) : null}
      <div className={orientation === "vertical" ? "space-y-0.5" : "contents"}>
        <RailEntries
          entries={group.entries}
          activeSectionId={activeSectionId}
          orientation={orientation}
          disclosureExpanded={disclosureExpanded}
          onNavigate={onNavigate}
          onToggleDisclosure={onToggleDisclosure}
        />
      </div>
    </div>
  );
}

export interface ClinicalNavigationRailProps {
  sections: ClinicalNavigationSection[];
  activeSectionId: string | null;
  onNavigate: (sectionId: string) => void;
  progress?: ClinicalNavigationProgress;
  orientation?: "vertical" | "horizontal";
  className?: string;
  disclosureExpanded?: boolean;
  onDisclosureExpandedChange?: (expanded: boolean) => void;
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

function useDisclosureExpanded(
  controlled: boolean | undefined,
  onChange?: (expanded: boolean) => void,
) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const expanded = controlled ?? uncontrolled;
  const setExpanded = (next: boolean) => {
    if (controlled === undefined) setUncontrolled(next);
    onChange?.(next);
  };
  return [expanded, setExpanded] as const;
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
      data-lane={section.lane}
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

function DisclosureToggle({
  count,
  expanded,
  orientation,
  onToggle,
}: {
  count: number;
  expanded: boolean;
  orientation: "vertical" | "horizontal";
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      data-testid="clinical-navigation-disclosure-toggle"
      aria-expanded={expanded}
      aria-controls="encounter-disclosure-panel"
      onClick={onToggle}
      className={cn(
        "clinical-interactive min-w-0 rounded-hd-md border text-left font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        orientation === "vertical"
          ? "flex w-full items-center gap-2 px-2.5 py-2 text-[11px]"
          : "inline-flex min-h-11 shrink-0 items-center gap-1.5 px-3 py-2 text-xs",
        expanded
          ? "border-primary/25 bg-primaryLight text-primary"
          : "border-transparent bg-transparent text-slate-600 hover:border-hd-border-subtle hover:bg-hd-surface-muted",
      )}
    >
      <span className="min-w-0 truncate">{DISCLOSURE_RAIL_LABEL}</span>
      <span className="ml-auto shrink-0 text-[10px] text-slate-400">
        {expanded ? "Ocultar" : `${count}`}
      </span>
    </button>
  );
}

function CarePathLandmark({
  entry,
  active,
  orientation,
  onNavigate,
}: {
  entry: Extract<ClinicalNavigationRailEntry, { type: "care-path-landmark" }>;
  active: boolean;
  orientation: "vertical" | "horizontal";
  onNavigate: (sectionId: string) => void;
}) {
  const label = orientation === "horizontal" ? entry.shortLabel : entry.label;
  return (
    <button
      type="button"
      aria-current={active ? "location" : undefined}
      aria-label={`Ir a ${entry.label}`}
      data-testid={`clinical-navigation-${entry.step}`}
      data-section-id={entry.id}
      data-care-path-step={entry.step}
      onClick={() => onNavigate(entry.id)}
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
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

function RailEntries({
  entries,
  activeSectionId,
  orientation,
  disclosureExpanded,
  onNavigate,
  onToggleDisclosure,
}: {
  entries: ClinicalNavigationRailEntry[];
  activeSectionId: string | null;
  orientation: "vertical" | "horizontal";
  disclosureExpanded: boolean;
  onNavigate: (sectionId: string) => void;
  onToggleDisclosure: () => void;
}) {
  return (
    <>
      {entries.map((entry, index) => {
        if (entry.type === "disclosure-toggle") {
          return (
            <DisclosureToggle
              key={`disclosure-toggle-${index}`}
              count={entry.count}
              expanded={disclosureExpanded}
              orientation={orientation}
              onToggle={onToggleDisclosure}
            />
          );
        }
        if (entry.type === "care-path-landmark") {
          return (
            <CarePathLandmark
              key={entry.id}
              entry={entry}
              active={entry.id === activeSectionId}
              orientation={orientation}
              onNavigate={onNavigate}
            />
          );
        }
        return (
          <NavigationRailItem
            key={entry.section.id}
            section={entry.section}
            active={entry.section.id === activeSectionId}
            orientation={orientation}
            onNavigate={onNavigate}
          />
        );
      })}
    </>
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
  disclosureExpanded: disclosureExpandedProp,
  onDisclosureExpandedChange,
}: ClinicalNavigationRailProps) {
  const railRef = useRef<HTMLElement | null>(null);
  const [disclosureExpanded, setDisclosureExpanded] = useDisclosureExpanded(
    disclosureExpandedProp,
    onDisclosureExpandedChange,
  );
  useRailStickyMaxHeight(
    orientation === "vertical" && sections.length > 0,
    railRef,
  );
  useRevealActiveRailItem(railRef, activeSectionId);

  if (sections.length === 0) return null;

  const toggleDisclosure = () => setDisclosureExpanded(!disclosureExpanded);

  const carePathGroups = buildSignatureReadyRailGroups(
    sections,
    disclosureExpanded,
  );
  const { scrollable, pinnedClosure } =
    partitionSignatureReadyRailGroups(carePathGroups);
  const groupProps = {
    activeSectionId,
    disclosureExpanded,
    onNavigate,
    onToggleDisclosure: toggleDisclosure,
  };

  if (orientation === "horizontal") {
    return (
      <nav
        ref={railRef}
        aria-label="Navegación de ficha clínica"
        data-testid="clinical-navigation-rail"
        data-orientation="horizontal"
        data-care-path="signature-ready"
        data-disclosure-expanded={disclosureExpanded ? "true" : "false"}
        className={cn(
          "flex gap-1 overflow-hidden rounded-hd-lg border border-hd-border-subtle bg-hd-surface-raised p-1 shadow-hd-1",
          className,
        )}
      >
        {progress ? <RailProgressSummary progress={progress} compact /> : null}
        <div
          data-testid="clinical-navigation-rail-scroll"
          className="flex min-w-0 flex-1 gap-1 overflow-x-auto"
        >
          {scrollable.map((group) => (
            <RailGroup
              key={group.key}
              group={group}
              orientation="horizontal"
              {...groupProps}
            />
          ))}
        </div>
        {pinnedClosure ? (
          <div
            data-testid="clinical-navigation-closure-pin"
            data-care-path-step="closure"
            className="flex shrink-0 gap-1 border-l border-hd-border-subtle pl-1"
          >
            <RailGroup
              group={pinnedClosure}
              orientation="horizontal"
              {...groupProps}
            />
          </div>
        ) : null}
      </nav>
    );
  }

  return (
    <nav
      ref={railRef}
      aria-label="Navegación de ficha clínica"
      data-testid="clinical-navigation-rail"
      data-orientation="vertical"
      data-care-path="signature-ready"
      data-disclosure-expanded={disclosureExpanded ? "true" : "false"}
      className={cn(
        // Fallback CSS (100dvh + safe-area); JS mide el espacio real del scrollport.
        "clinical-depth-secondary sticky top-[calc(var(--encounter-chrome-h,5.5rem)+0.75rem)] z-10 flex max-h-[calc(100dvh-4rem-var(--encounter-chrome-h,5.5rem)-0.75rem-env(safe-area-inset-bottom,0px)-2.5rem)] flex-col overflow-hidden rounded-hd-lg border border-hd-border-subtle bg-hd-surface-raised p-hd-2 pb-hd-3 shadow-hd-1",
        className,
      )}
    >
      <div className="mb-hd-2 shrink-0 border-b border-hd-border-subtle pb-hd-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
          Camino Signature-ready
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          Contexto → SOAP → Oferta → HAB → Firma
        </p>
        {progress ? <RailProgressSummary progress={progress} /> : null}
      </div>
      <div
        data-testid="clinical-navigation-rail-scroll"
        className="min-h-0 flex-1 space-y-hd-3 overflow-y-auto overscroll-contain"
      >
        {scrollable.map((group) => (
          <RailGroup
            key={group.key}
            group={group}
            orientation="vertical"
            {...groupProps}
          />
        ))}
      </div>
      {pinnedClosure ? (
        <div
          data-testid="clinical-navigation-closure-pin"
          data-care-path-step="closure"
          className="mt-hd-2 shrink-0 space-y-1 border-t border-hd-border-subtle pt-hd-2"
        >
          <RailGroup
            group={pinnedClosure}
            orientation="vertical"
            {...groupProps}
          />
        </div>
      ) : null}
    </nav>
  );
}
