"use client";

import { cn } from "@/lib/utils";
import { clinicalWorkspaceKernel } from "@/lib/clinical-workspace/kernel";
import type { SoapNavStep } from "@/hooks/useSoapScrollSpy";

const SOAP_SECTIONS: Array<{ step: SoapNavStep; label: string }> = [
  { step: 1, label: "Diagnóstico" },
  { step: 2, label: "Plan" },
  { step: 3, label: "Notas" },
  { step: 4, label: "Tratamiento" },
];

export function SoapStickyNav({
  enabled,
  activeStep = 1,
}: {
  enabled?: boolean;
  activeStep?: SoapNavStep;
}) {
  if (!enabled) return null;

  const viewport = clinicalWorkspaceKernel.getViewport();

  return (
    <nav
      aria-label="Navegación SOAP"
      data-testid="soap-sticky-nav"
      style={{
        top: `calc(var(--encounter-chrome-h, ${viewport.encounterChromeHeight}px) + 4px)`,
      }}
      className={cn(
        "soap-sticky-nav sticky z-[5] -mx-hd-1 mb-hd-2 flex gap-0.5 overflow-x-auto",
        "rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised/95 px-hd-1 py-0.5 backdrop-blur-sm",
      )}
    >
      {SOAP_SECTIONS.map((section) => {
        const isActive = activeStep === section.step;
        return (
          <a
            key={section.step}
            href={`#soap-block-${section.step}`}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "clinical-interactive shrink-0 rounded-hd-sm px-2 py-1 text-[11px] font-medium",
              isActive
                ? "bg-primary/12 font-semibold text-primary ring-1 ring-primary/25"
                : "text-slate-600 hover:bg-slate-100 hover:text-primary",
            )}
          >
            {section.label}
            {isActive ? (
              <span className="sr-only"> (sección actual)</span>
            ) : null}
          </a>
        );
      })}
    </nav>
  );
}
