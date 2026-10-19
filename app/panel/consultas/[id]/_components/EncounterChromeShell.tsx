"use client";

import { useEncounterChromeHeight } from "@/lib/hooks/useEncounterChromeHeight";
import { cn } from "@/lib/utils";
import { useRef, type ReactNode, type RefObject } from "react";

export interface EncounterChromeShellProps {
  children: ReactNode;
  className?: string;
  workspaceRef?: RefObject<HTMLElement | null>;
}

export function EncounterChromeShell({
  children,
  className,
  workspaceRef,
}: EncounterChromeShellProps) {
  const chromeRef = useRef<HTMLDivElement>(null);
  useEncounterChromeHeight(chromeRef, workspaceRef);

  return (
    <div
      ref={chromeRef}
      className={cn(className)}
      data-testid="encounter-chrome-shell"
      data-overlay-layer="chrome"
    >
      {children}
    </div>
  );
}
