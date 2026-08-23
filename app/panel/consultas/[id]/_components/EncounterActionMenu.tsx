"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CLINICAL_OVERLAY_CLASS } from "@/lib/clinical-overlay-contract";
import type {
  ActionBarDisabled,
  ActionBarHandlers,
  ActionBarLoading,
} from "@/lib/encounter/action-bar-types";
import {
  encounterActionLabel,
  resolveEncounterActions,
  type EncounterActionContext,
  type EncounterActionId,
} from "@/lib/encounter/encounter-action-registry";

export interface EncounterActionMenuProps {
  handlers: ActionBarHandlers;
  loading?: ActionBarLoading;
  disabled?: ActionBarDisabled;
  isEditing?: boolean;
  onShare?: () => void;
  onContinuity?: () => void;
  onTransition?: () => void;
  transitionLabel?: string;
  transitioning?: boolean;
  hideDocumentActions?: boolean;
  hasPatientId?: boolean;
  canToggleEdit?: boolean;
  isLocked?: boolean;
  className?: string;
}

function MenuItem({
  label,
  icon,
  onClick,
  loading,
  disabled,
  danger,
  testId,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  danger?: boolean;
  testId?: string;
}) {
  const inactive = disabled || loading;
  return (
    <button
      type="button"
      role="menuitem"
      data-testid={testId}
      onClick={onClick}
      disabled={inactive}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm",
        danger ? "text-red-700" : "text-slate-800",
        inactive ? "cursor-not-allowed opacity-50" : "hover:bg-slate-50",
      )}
    >
      <span aria-hidden className="w-4 shrink-0 text-center">
        {icon}
      </span>
      {loading ? "Procesando…" : label}
    </button>
  );
}

export function EncounterActionMenu({
  handlers,
  loading = {},
  disabled = {},
  isEditing,
  onShare,
  onContinuity,
  onTransition,
  transitionLabel,
  transitioning,
  hideDocumentActions = false,
  hasPatientId = false,
  canToggleEdit = false,
  isLocked = false,
  className,
}: EncounterActionMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const ctx: EncounterActionContext = {
    isLocked,
    canPay: false,
    canToggleEdit,
    isEditing: Boolean(isEditing),
    hideModuleShortcuts: true,
    hideDocumentActions,
    hasPatientId,
    hasTransition: Boolean(onTransition && transitionLabel),
    paymentStep: "idle",
    creatingPayment: false,
  };
  const overflowActions = resolveEncounterActions(ctx, "overflow");

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const run = (id: EncounterActionId) => {
    setOpen(false);
    switch (id) {
      case "toggle-edit":
        handlers.onToggleEdit();
        return;
      case "analyze-copilot":
        handlers.onAnalyzeWithAi();
        return;
      case "share-consultation":
        onShare?.();
        return;
      case "continuity":
        onContinuity?.();
        return;
      case "transition":
        onTransition?.();
        return;
      case "invoice":
        handlers.onGenerateInvoice();
        return;
      case "pdf":
        handlers.onDownloadPdf();
        return;
      case "delete":
        handlers.onDelete();
        return;
      default:
        return;
    }
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Más acciones del encuentro"
        title="Más acciones"
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-sm text-slate-700 hover:bg-slate-50",
          open && "bg-slate-50",
        )}
      >
        ⋯
      </button>
      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute right-0 top-full mt-1 min-w-[240px] max-w-[min(100vw-32px,300px)] rounded-lg border border-slate-200 bg-white py-1 shadow-lg",
            CLINICAL_OVERLAY_CLASS.dialog,
          )}
        >
          {overflowActions.map((action) => {
            const label =
              action.id === "transition" && transitionLabel
                ? transitioning
                  ? "Cambiando…"
                  : transitionLabel
                : encounterActionLabel(action, ctx);
            const itemDisabled =
              action.disabled(ctx) ||
              (action.id === "toggle-edit" && disabled.edit) ||
              (action.id === "analyze-copilot" && disabled.ai) ||
              (action.id === "invoice" && disabled.invoice) ||
              (action.id === "pdf" && disabled.pdf) ||
              (action.id === "delete" && disabled.delete) ||
              (action.id === "transition" && Boolean(transitioning));
            const itemLoading =
              (action.id === "analyze-copilot" && loading.ai) ||
              (action.id === "invoice" && loading.invoice) ||
              (action.id === "pdf" && loading.pdf) ||
              (action.id === "delete" && loading.deleting);
            return (
              <React.Fragment key={action.id}>
                {action.id === "delete" || action.id === "invoice" ? (
                  <div className="my-1 border-t border-slate-100" />
                ) : null}
                <MenuItem
                  label={label}
                  icon={action.id === "share-consultation" ? "🔗" : action.icon}
                  loading={itemLoading}
                  disabled={itemDisabled}
                  danger={action.id === "delete"}
                  testId={action.testId}
                  onClick={() => run(action.id)}
                />
              </React.Fragment>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
