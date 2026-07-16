"use client";

import { useState, type ReactNode } from "react";

export type MedicalCopilotDeferredPanelProps = {
  title: string;
  children: ReactNode;
  /** Montar inmediatamente (paneles P0 / shell). */
  eager?: boolean;
  defaultOpen?: boolean;
  testId?: string;
};

/**
 * RC3 — lazy mounting: el hijo solo se monta cuando el panel se expande.
 * Mantiene compatibilidad visual vía <details>.
 */
export function MedicalCopilotDeferredPanel({
  title,
  children,
  eager = false,
  defaultOpen = false,
  testId,
}: MedicalCopilotDeferredPanelProps) {
  const [open, setOpen] = useState(eager || defaultOpen);
  const [mounted, setMounted] = useState(eager || defaultOpen);

  return (
    <details
      className="rounded border border-slate-200 bg-slate-50/60 open:bg-white"
      data-testid={testId ?? "medical-copilot-deferred-panel"}
      open={open}
      onToggle={(e) => {
        const next = (e.currentTarget as HTMLDetailsElement).open;
        setOpen(next);
        if (next) setMounted(true);
      }}
    >
      <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-slate-700">
        {title}
        {!mounted ? (
          <span className="ml-2 text-[10px] font-normal uppercase tracking-wide text-slate-400">
            lazy
          </span>
        ) : null}
      </summary>
      <div className="border-t border-slate-100 px-1 py-2">
        {mounted ? children : null}
      </div>
    </details>
  );
}
