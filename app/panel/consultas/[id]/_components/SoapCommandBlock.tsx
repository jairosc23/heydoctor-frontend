"use client";

import type { ReactNode } from "react";
import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import { cn } from "@/lib/utils";
import { clinicalWorkspaceKernel } from "@/lib/clinical-workspace/kernel";

export function SoapCommandBlock({
  step,
  title,
  children,
  preview,
  priority = "default",
  className,
}: {
  step: number;
  title: string;
  children: ReactNode;
  /** Phase 4.4A — Compact Preview Mode™ cuando otro bloque tiene foco. */
  preview?: ReactNode;
  priority?: "primary" | "default";
  className?: string;
}) {
  const viewport = clinicalWorkspaceKernel.getViewport();

  return (
    <section
      id={`soap-block-${step}`}
      style={{
        scrollMarginTop: `calc(var(--encounter-chrome-h, ${viewport.encounterChromeHeight}px) + 2.75rem)`,
      }}
      className={cn(
        "soap-command-block clinical-interactive rounded-hd-lg border border-hd-border-subtle bg-hd-surface-raised p-hd-4 transition-all duration-hd-base",
        priority === "primary"
          ? "border-l-[3px] border-l-primary/50 shadow-hd-2 ring-1 ring-primary/5"
          : "shadow-hd-1",
        className,
      )}
    >
      <div className="soap-command-block-header mb-hd-3 flex items-center gap-hd-2">
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums",
            priority === "primary"
              ? "bg-primary text-white"
              : "bg-slate-100 text-slate-600",
          )}
          aria-hidden
        >
          {step}
        </span>
        <h3 className={cn(CLINICAL_SECTION_TITLE, "heydoctor-presence mb-0")}>
          {title}
        </h3>
      </div>
      {preview ? (
        <div className="soap-command-block-preview">{preview}</div>
      ) : null}
      <div className="soap-command-block-content">{children}</div>
    </section>
  );
}
