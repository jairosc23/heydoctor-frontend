"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ClinicalCollapsiblePanelProps {
  title: string;
  eyebrow?: string;
  storageKey: string;
  defaultExpanded?: boolean;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function ClinicalCollapsiblePanel({
  title,
  eyebrow,
  storageKey,
  defaultExpanded = true,
  children,
  className,
  contentClassName,
}: ClinicalCollapsiblePanelProps) {
  const contentId = useId();
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(storageKey);
      if (stored === "expanded") setExpanded(true);
      if (stored === "collapsed") setExpanded(false);
    } catch {
      /* Session persistence is progressive enhancement. */
    }
  }, [storageKey]);

  const toggle = () => {
    setExpanded((current) => {
      const next = !current;
      try {
        window.sessionStorage.setItem(
          storageKey,
          next ? "expanded" : "collapsed",
        );
      } catch {
        /* noop */
      }
      return next;
    });
  };

  return (
    <section
      className={cn(
        "rounded-hd-lg border border-hd-border-subtle bg-hd-surface-raised shadow-hd-1",
        className,
      )}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-hd-3 px-hd-4 py-hd-3 text-left"
      >
        <span>
          {eyebrow ? (
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wide text-primary/80">
              {eyebrow}
            </span>
          ) : null}
          <span className="block text-sm font-semibold text-slate-900">
            {title}
          </span>
        </span>
        <span className="shrink-0 text-xs font-semibold text-slate-500">
          {expanded ? "▼ Expandido" : "▶ Contraído"}
        </span>
      </button>

      {expanded ? (
        <div
          id={contentId}
          className={cn("border-t border-hd-border-subtle p-hd-4", contentClassName)}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
