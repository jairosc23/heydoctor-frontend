"use client";

import type { ElementType, ReactNode } from "react";
import {
  clinicalSurfaceClass,
  type ClinicalDepth,
} from "@/lib/clinical-design-tokens";

export interface ClinicalSurfaceProps {
  as?: ElementType;
  depth?: ClinicalDepth;
  focusPrimary?: boolean;
  secondary?: boolean;
  className?: string;
  children: ReactNode;
}

export function ClinicalSurface({
  as: Component = "div",
  depth = 2,
  focusPrimary = false,
  secondary = false,
  className,
  children,
}: ClinicalSurfaceProps) {
  return (
    <Component
      className={clinicalSurfaceClass(depth, {
        focusPrimary,
        secondary,
        className,
      })}
    >
      {children}
    </Component>
  );
}
