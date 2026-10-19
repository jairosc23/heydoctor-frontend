"use client";

import type { ReactNode } from "react";
import {
  clinicalSectionClass,
  CLINICAL_SECTION_TITLE,
} from "@/lib/clinical-design-tokens";
import { cn } from "@/lib/utils";

export function ClinicalSection({
  title,
  className,
  children,
}: {
  title?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={clinicalSectionClass(className)}>
      {title ? (
        <h3 className={cn(CLINICAL_SECTION_TITLE)}>{title}</h3>
      ) : null}
      {children}
    </section>
  );
}
