"use client";

import {
  CLINICAL_ACTION_MODULES,
  type ClinicalActionModuleId,
} from "@/lib/clinical-action-workspace";
import { cn } from "@/lib/utils";
import { useClinicalActionWorkspace } from "./ClinicalActionWorkspaceProvider";

export function ClinicalActionBar({ className }: { className?: string }) {
  const { enabled, activeModule, sheetOpen, openModule } =
    useClinicalActionWorkspace();

  if (!enabled) return null;

  return (
    <nav
      aria-label="Clinical Action Bar"
      data-testid="clinical-action-bar"
      className={cn(
        "border-t border-hd-border-subtle bg-hd-surface-chrome/95 px-0 py-hd-2",
        className,
      )}
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
            />
          );
        })}
      </div>
    </nav>
  );
}

function ActionBarChip({
  moduleId,
  icon,
  label,
  active,
  onSelect,
}: {
  moduleId: ClinicalActionModuleId;
  icon: string;
  label: string;
  active: boolean;
  onSelect: (moduleId: ClinicalActionModuleId) => void;
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
    </button>
  );
}
