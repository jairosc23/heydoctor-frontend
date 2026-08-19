"use client";

import type { ReactNode } from "react";
import { EncounterCipHopTracer } from "./EncounterCipHopTracer";
import { shouldMountDisclosurePreviews } from "./encounter-hot-path";

export function EncounterDisclosureMount({
  expanded,
  children,
}: {
  expanded: boolean;
  children: ReactNode;
}) {
  if (!shouldMountDisclosurePreviews(expanded)) {
    return null;
  }
  return (
    <div
      data-testid="encounter-disclosure-previews-mounted"
      data-hot-path="false"
    >
      <div data-testid="encounter-cip-hop-tracer" data-alertable="false">
        <EncounterCipHopTracer />
      </div>
      {children}
    </div>
  );
}
