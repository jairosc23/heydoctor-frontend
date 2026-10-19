"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
  /** When true, no card chrome — wraps existing enterprise panels without double borders. */
  bare?: boolean;
};

/**
 * Collapsible section shell for Agenda Enterprise panels.
 * Does not alter child domain behavior — presentation wrapper only.
 */
export function AgendaCollapsible({
  title,
  subtitle,
  defaultOpen = true,
  badge,
  children,
  className,
  bare = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const buttonId = useId();

  return (
    <section className={cn("space-y-2", className)}>
      <h3 className="m-0">
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition",
            bare
              ? "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
              : "border border-slate-200 bg-white shadow-soft hover:bg-slate-50/80 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800/60",
          )}
        >
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
              {title}
            </span>
            {subtitle ? (
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </span>
            ) : null}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            {badge}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-slate-500 transition-transform duration-200",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className={cn(!open && "hidden")}
      >
        {children}
      </div>
    </section>
  );
}
