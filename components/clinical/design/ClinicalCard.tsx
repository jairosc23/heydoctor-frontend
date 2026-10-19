"use client";

import type { ReactNode } from "react";
import { clinicalCardClass } from "@/lib/clinical-design-tokens";
import { cn } from "@/lib/utils";

export function ClinicalCard({
  className,
  children,
  interactive = false,
}: {
  className?: string;
  children: ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        clinicalCardClass(),
        interactive && "clinical-interactive hover:-translate-y-px",
        className,
      )}
    >
      {children}
    </div>
  );
}
