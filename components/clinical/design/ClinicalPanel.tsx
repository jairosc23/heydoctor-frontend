"use client";

import type { ReactNode } from "react";
import {
  clinicalPanelClass,
  type ClinicalDensity,
  type ClinicalDepth,
} from "@/lib/clinical-design-tokens";

export interface ClinicalPanelProps {
  depth?: ClinicalDepth;
  density?: ClinicalDensity;
  focusPrimary?: boolean;
  className?: string;
  children: ReactNode;
}

export function ClinicalPanel({
  depth = 3,
  density = "comfortable",
  focusPrimary = false,
  className,
  children,
}: ClinicalPanelProps) {
  return (
    <div
      className={clinicalPanelClass(depth, density, {
        focusPrimary,
        className,
      })}
    >
      {children}
    </div>
  );
}
