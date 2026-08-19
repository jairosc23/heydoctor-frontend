"use client";

import type { ReactNode } from "react";
import { ClinicalCollapsiblePanel } from "./ClinicalCollapsiblePanel";
import {
  CARE_PATH_STEP_LABELS,
  ENCOUNTER_HAB_ID,
  ENCOUNTER_OFFER_ID,
} from "./clinical-navigation-rail-model";

export function EncounterCarePathOffer({
  children,
  expandSignal,
  className,
  collapsible = true,
  onExpandedChange,
}: {
  children: ReactNode;
  expandSignal?: number;
  className?: string;
  collapsible?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const body = (
    <div data-testid="orders-command-center-collapsible">{children}</div>
  );

  return (
    <div className="space-y-hd-2">
      <div
        id={ENCOUNTER_OFFER_ID}
        data-testid="encounter-offer"
        data-care-path-step="offer"
        role="region"
        aria-label={CARE_PATH_STEP_LABELS.offer}
      >
        {collapsible ? (
          <ClinicalCollapsiblePanel
            title={CARE_PATH_STEP_LABELS.offer}
            eyebrow="Prescription · Lab · Referral"
            storageKey="clinical-encounter-panel-orders"
            defaultExpanded={false}
            expandSignal={expandSignal}
            onExpandedChange={onExpandedChange}
            className={className}
          >
            {body}
          </ClinicalCollapsiblePanel>
        ) : (
          body
        )}
      </div>
      <p
        id={ENCOUNTER_HAB_ID}
        data-testid="encounter-hab"
        data-care-path-step="authorization"
        role="note"
        aria-live="polite"
        className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-muted px-hd-3 py-hd-2 text-[11px] text-slate-600"
      >
        Autorización humana (HAB): receta, laboratorio y referido persisten solo
        con confirmación médica. Esta superficie no cambia HAB ni emite.
      </p>
    </div>
  );
}
