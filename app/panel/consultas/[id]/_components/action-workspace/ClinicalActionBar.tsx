"use client";

import { useState, type ReactNode } from "react";
import {
  ContinuityEntry,
  ContinuityPanelShell,
} from "@/components/clinical/continuity";
import {
  CLINICAL_ACTION_MODULES,
  type ClinicalActionModuleId,
} from "@/lib/clinical-action-workspace";
import { cn } from "@/lib/utils";
import { useClinicalActionWorkspace } from "./ClinicalActionWorkspaceProvider";
import { OrdersCompactSummary } from "../orders/OrdersCompactSummary";

export interface ClinicalActionBarProps {
  className?: string;
  patientId?: string | null;
  consultationId?: string;
  ordersRefreshKey?: number;
}

export function ClinicalActionBar({
  className,
  patientId,
  consultationId,
  ordersRefreshKey = 0,
}: ClinicalActionBarProps) {
  const { enabled, activeModule, sheetOpen, openModule } =
    useClinicalActionWorkspace();
  const [continuityOpen, setContinuityOpen] = useState(false);

  if (!enabled) return null;

  return (
    <div className={cn("space-y-0", className)}>
      <nav
        aria-label="Clinical Action Bar"
        data-testid="clinical-action-bar"
        className="border-t border-hd-border-subtle bg-hd-surface-chrome/95 px-0 py-hd-2"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {CLINICAL_ACTION_MODULES.map((module) => {
            const isActive = sheetOpen && activeModule === module.id;
            return (
              <ActionBarChip
                key={module.id}
                moduleId={module.id}
                icon={module.icon}
                label={module.label}
                active={isActive}
                onSelect={openModule}
                suffix={
                  module.id === "orders" && patientId && consultationId ? (
                    <OrdersCompactSummary
                      patientId={patientId}
                      consultationId={consultationId}
                      refreshKey={ordersRefreshKey}
                    />
                  ) : null
                }
              />
            );
          })}
          {patientId ? (
            <ContinuityEntry
              open={continuityOpen}
              onOpenChange={setContinuityOpen}
            />
          ) : null}
        </div>
      </nav>
      {patientId ? (
        <ContinuityPanelShell
          patientId={patientId}
          encounterId={consultationId ?? null}
          open={continuityOpen}
          onOpenChange={setContinuityOpen}
        />
      ) : null}
    </div>
  );
}

function ActionBarChip({
  moduleId,
  icon,
  label,
  active,
  onSelect,
  suffix,
}: {
  moduleId: ClinicalActionModuleId;
  icon: string;
  label: string;
  active: boolean;
  onSelect: (moduleId: ClinicalActionModuleId) => void;
  suffix?: ReactNode;
}) {
  return (
    <button
      type="button"
      data-module={moduleId}
      aria-pressed={active}
      onClick={() => onSelect(moduleId)}
      className={cn(
        "clinical-chip clinical-interactive inline-flex items-center gap-1 rounded-hd-md border px-2.5 py-1.5 text-xs font-medium",
        active
          ? "border-primary/30 bg-primaryLight text-primary"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
      )}
    >
      <span aria-hidden>{icon}</span>
      {label}
      {suffix}
    </button>
  );
}
