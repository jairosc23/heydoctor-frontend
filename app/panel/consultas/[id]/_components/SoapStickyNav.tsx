"use client";

import { cn } from "@/lib/utils";

const SOAP_SECTIONS = [
  { step: 1, label: "Diagnóstico" },
  { step: 2, label: "Plan" },
  { step: 3, label: "Notas" },
  { step: 4, label: "Tratamiento" },
] as const;

export function SoapStickyNav({ enabled }: { enabled?: boolean }) {
  if (!enabled) return null;

  return (
    <nav
      aria-label="Navegación SOAP"
      data-testid="soap-sticky-nav"
      className={cn(
        "soap-sticky-nav sticky z-[5] -mx-hd-1 mb-hd-2 flex gap-0.5 overflow-x-auto",
        "rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised/95 px-hd-1 py-0.5 backdrop-blur-sm",
      )}
    >
      {SOAP_SECTIONS.map((section) => (
        <a
          key={section.step}
          href={`#soap-block-${section.step}`}
          className={cn(
            "clinical-interactive shrink-0 rounded-hd-sm px-2 py-1 text-[11px] font-medium text-slate-600",
            "hover:bg-slate-100 hover:text-primary",
          )}
        >
          {section.label}
        </a>
      ))}
    </nav>
  );
}
