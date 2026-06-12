"use client";

import type { ReactNode } from "react";
import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import { cn } from "@/lib/utils";

export function SoapCommandBlock({
  step,
  title,
  children,
  priority = "default",
  className,
}: {
  step: number;
  title: string;
  children: ReactNode;
  priority?: "primary" | "default";
  className?: string;
}) {
  return (
    <section
      className={cn(
        "soap-command-block clinical-interactive rounded-hd-lg border border-hd-border-subtle bg-hd-surface-raised p-hd-4 transition-all duration-hd-base",
        priority === "primary"
          ? "border-l-[3px] border-l-primary/50 shadow-hd-2 ring-1 ring-primary/5"
          : "shadow-hd-1",
        className,
      )}
    >
      <div className="mb-hd-3 flex items-center gap-hd-2">
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
      {children}
    </section>
  );
}
