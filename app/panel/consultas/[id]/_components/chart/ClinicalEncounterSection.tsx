"use client";

import type { ReactNode } from "react";
import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import { cn } from "@/lib/utils";

export interface ClinicalEncounterSectionProps {
  sectionNumber: number;
  title: string;
  children: ReactNode;
  className?: string;
  id?: string;
}

export function ClinicalEncounterSection({
  sectionNumber,
  title,
  children,
  className,
  id,
}: ClinicalEncounterSectionProps) {
  const sectionId = id ?? `encounter-section-${sectionNumber}`;

  return (
    <section
      id={sectionId}
      data-encounter-section={sectionNumber}
      className={cn(
        "rounded-hd-lg border border-hd-border-subtle bg-hd-surface-raised p-hd-3 shadow-hd-1",
        className,
      )}
      aria-labelledby={`${sectionId}-title`}
    >
      <header className="mb-hd-2 border-b border-hd-border-subtle pb-hd-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
          §{sectionNumber}
        </p>
        <h3 id={`${sectionId}-title`} className={cn(CLINICAL_SECTION_TITLE, "text-sm text-slate-800")}>
          {title}
        </h3>
      </header>
      {children}
    </section>
  );
}
