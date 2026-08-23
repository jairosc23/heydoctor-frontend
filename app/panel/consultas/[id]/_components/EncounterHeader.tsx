"use client";

import type {
  ActionBarDisabled,
  ActionBarHandlers,
  ActionBarLoading,
} from "@/lib/encounter/action-bar-types";
import {
  formatConsultationPrice,
  URGENCY_AVAILABLE_NOW,
} from "@/lib/consultation-pricing";
import {
  encounterActionLabel,
  resolveEncounterActions,
  type EncounterActionContext,
} from "@/lib/encounter/encounter-action-registry";
import { cn } from "@/lib/utils";
import { NEXT_STATUS_LABELS } from "./consultation-status";
import { EncounterActionMenu } from "./EncounterActionMenu";
import { ClinicalCopilotTrigger } from "./copilot/ClinicalCopilotDrawer";
import { DoctorDnaDrawerTrigger } from "./DoctorDnaDrawer";

function HeaderIconButton({
  icon,
  label,
  onClick,
  disabled,
  active,
  testId,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      data-testid={testId}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors",
        active
          ? "border-primary bg-primaryLight text-primary"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <span aria-hidden>{icon}</span>
    </button>
  );
}

export interface EncounterHeaderProps {
  status: string;
  transitioning: boolean;
  onBack: () => void;
  onShare: () => void;
  onContinuity?: () => void;
  onTransition?: () => void;
  onOpenPrescription: () => void;
  onOpenLabOrders: () => void;
  canPay: boolean;
  isLocked: boolean;
  paymentStep: "idle" | "confirm";
  creatingPayment: boolean;
  onPayClick: () => void;
  onPaymentConfirm: () => void;
  onPaymentCancel: () => void;
  paymentAmount: number;
  paymentCurrency: string;
  paymentLoading: boolean;
  saveMsg?: string;
  actionHandlers: ActionBarHandlers;
  actionLoading?: ActionBarLoading;
  actionDisabled?: ActionBarDisabled;
  isEditing?: boolean;
  canToggleEdit?: boolean;
  onToggleEdit?: () => void;
  dnaActive?: boolean;
  onOpenDoctorDna?: () => void;
  copilotActive?: boolean;
  onOpenCopilot?: () => void;
  hideModuleShortcuts?: boolean;
  hasPatientId?: boolean;
  className?: string;
}

export function EncounterHeader({
  status,
  transitioning,
  onBack,
  onShare,
  onContinuity,
  onTransition,
  onOpenPrescription,
  onOpenLabOrders,
  canPay,
  isLocked,
  paymentStep,
  creatingPayment,
  onPayClick,
  onPaymentConfirm,
  onPaymentCancel,
  paymentAmount,
  paymentCurrency,
  paymentLoading,
  saveMsg,
  actionHandlers,
  actionLoading,
  actionDisabled,
  isEditing,
  canToggleEdit = false,
  onToggleEdit,
  dnaActive = false,
  onOpenDoctorDna,
  copilotActive = false,
  onOpenCopilot,
  hideModuleShortcuts = false,
  hasPatientId = false,
  className,
}: EncounterHeaderProps) {
  const transitionLabel = NEXT_STATUS_LABELS[status];
  const ctx: EncounterActionContext = {
    isLocked,
    canPay,
    canToggleEdit,
    isEditing: Boolean(isEditing),
    hideModuleShortcuts,
    hideDocumentActions: true,
    hasPatientId,
    hasTransition: Boolean(
      (status === "draft" || status === "in_progress") && onTransition,
    ),
    paymentStep,
    creatingPayment,
  };
  const toolbarActions = resolveEncounterActions(ctx, "toolbar");

  return (
    <header className={cn("py-1.5", className)} aria-label="Acciones del encuentro">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a consultas"
          title="Volver a consultas"
          data-testid="encounter-back-to-consultations"
          className="inline-flex h-7 shrink-0 items-center gap-1 text-xs font-medium text-slate-500 hover:text-primary"
        >
          <span aria-hidden>←</span>
          <span className="hidden sm:inline">Consultas</span>
        </button>

        <div
          className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-1"
          role="toolbar"
          aria-label="Acciones del encuentro"
        >
          {canToggleEdit ? (
            <span
              className={cn(
                "inline-flex h-8 items-center rounded-md border px-2 text-xs font-semibold",
                isEditing
                  ? "border-primary/30 bg-primaryLight/50 text-primary"
                  : "border-slate-200 bg-slate-50 text-slate-600",
              )}
              data-testid="encounter-header-edit-mode-badge"
            >
              {isEditing ? "Editando la consulta" : "Solo lectura"}
            </span>
          ) : null}
          {toolbarActions.map((action) => {
            const label = encounterActionLabel(action, ctx);
            const disabled = action.disabled(ctx);
            switch (action.id) {
              case "toggle-edit":
                return onToggleEdit ? (
                  <button
                    key={action.id}
                    type="button"
                    onClick={onToggleEdit}
                    disabled={disabled}
                    data-testid={action.testId}
                    className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {label}
                  </button>
                ) : null;
              case "copilot":
                return (
                  <ClinicalCopilotTrigger
                    key={action.id}
                    onClick={() => onOpenCopilot?.()}
                    active={copilotActive}
                  />
                );
              case "doctor-dna":
                return (
                  <DoctorDnaDrawerTrigger
                    key={action.id}
                    onClick={() => onOpenDoctorDna?.()}
                    active={dnaActive}
                  />
                );
              case "share-consultation":
                return (
                  <HeaderIconButton
                    key={action.id}
                    icon={action.icon}
                    label={label}
                    testId={action.testId}
                    onClick={onShare}
                  />
                );
              case "prescription":
                return (
                  <HeaderIconButton
                    key={action.id}
                    icon={action.icon}
                    label={label}
                    onClick={onOpenPrescription}
                    disabled={actionDisabled?.prescription ?? disabled}
                  />
                );
              case "lab":
                return (
                  <HeaderIconButton
                    key={action.id}
                    icon={action.icon}
                    label={label}
                    onClick={onOpenLabOrders}
                    disabled={disabled}
                  />
                );
              case "pay":
                return (
                  <HeaderIconButton
                    key={action.id}
                    icon={action.icon}
                    label={label}
                    testId={action.testId}
                    onClick={onPayClick}
                    disabled={disabled}
                    active={paymentStep === "confirm"}
                  />
                );
              default:
                return null;
            }
          })}
          <EncounterActionMenu
            handlers={actionHandlers}
            loading={actionLoading}
            disabled={actionDisabled}
            isEditing={isEditing}
            onShare={onShare}
            onContinuity={onContinuity}
            onTransition={onTransition}
            transitionLabel={transitionLabel}
            transitioning={transitioning}
            hideDocumentActions
            hasPatientId={hasPatientId}
            canToggleEdit={canToggleEdit}
            isLocked={isLocked}
          />
        </div>
      </div>

      {canPay && !isLocked && paymentStep === "confirm" ? (
        <div
          data-testid="encounter-payment-panel"
          className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2"
        >
          <span className="text-xs font-semibold text-slate-800">
            {paymentLoading
              ? "…"
              : formatConsultationPrice(paymentAmount, paymentCurrency)}
          </span>
          <button
            type="button"
            onClick={onPaymentConfirm}
            disabled={creatingPayment}
            className="rounded-md bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {creatingPayment ? "Conectando…" : "Confirmar pago"}
          </button>
          <button
            type="button"
            onClick={onPaymentCancel}
            disabled={creatingPayment}
            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <span className="w-full text-[10px] text-slate-500">
            {URGENCY_AVAILABLE_NOW} — Redirección a Payku.
          </span>
        </div>
      ) : null}

      {saveMsg ? (
        <p
          className={cn(
            "mt-1.5 text-[11px]",
            saveMsg.toLowerCase().includes("error") ||
              saveMsg.toLowerCase().includes("no pud")
              ? "text-red-600"
              : "text-green-700",
          )}
          role="status"
        >
          {saveMsg}
        </p>
      ) : null}
    </header>
  );
}
