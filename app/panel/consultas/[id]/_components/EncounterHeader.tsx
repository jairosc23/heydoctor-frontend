"use client";

import type {
  ActionBarDisabled,
  ActionBarHandlers,
  ActionBarLoading,
} from "@/components/clinical/ConsultationActionBar";
import {
  formatConsultationPrice,
  URGENCY_AVAILABLE_NOW,
} from "@/lib/consultation-pricing";
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
  href,
  testId,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  href?: string;
  testId?: string;
}) {
  const className = cn(
    "inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm transition-colors",
    active
      ? "border-primary bg-primaryLight text-primary"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    disabled && "cursor-not-allowed opacity-40",
  );

  if (href && !disabled) {
    return (
      <a
        href={href}
        aria-label={label}
        title={label}
        data-testid={testId}
        className={className}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <span aria-hidden>{icon}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      data-testid={testId}
      className={className}
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
  onTransition?: () => void;
  canStartCall: boolean;
  onStartTeleconsultation: () => void;
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
  /** Status permite editar la consulta (draft / in_progress). */
  canToggleEdit?: boolean;
  onToggleEdit?: () => void;
  dnaDrawerOpen?: boolean;
  onOpenDoctorDna?: () => void;
  copilotDrawerOpen?: boolean;
  onOpenCopilot?: () => void;
  /**
   * @deprecated Brand consolidation — Medical Copilot route remains internal;
   * production AI entry is HeyDoctor Copilot drawer via onOpenCopilot.
   */
  medicalCopilotHref?: string | null;
  hideModuleShortcuts?: boolean;
  className?: string;
}

export function EncounterHeader({
  status,
  transitioning,
  onBack,
  onShare,
  onTransition,
  canStartCall,
  onStartTeleconsultation,
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
  dnaDrawerOpen = false,
  onOpenDoctorDna,
  copilotDrawerOpen = false,
  onOpenCopilot,
  medicalCopilotHref: _medicalCopilotHref = null,
  hideModuleShortcuts = false,
  className,
}: EncounterHeaderProps) {
  const transitionLabel = NEXT_STATUS_LABELS[status];
  const showPay = canPay && !isLocked;

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
          {canToggleEdit && onToggleEdit ? (
            <button
              type="button"
              onClick={onToggleEdit}
              data-testid="encounter-header-toggle-edit"
              className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              {isEditing ? "Cerrar edición" : "Editar consulta"}
            </button>
          ) : null}
          {/* Brand SSOT: single AI entry → HeyDoctor Copilot drawer (route /medical-copilot preserved). */}
          <ClinicalCopilotTrigger
            onClick={() => onOpenCopilot?.()}
            active={copilotDrawerOpen}
          />
          <DoctorDnaDrawerTrigger
            onClick={() => onOpenDoctorDna?.()}
            active={dnaDrawerOpen}
          />
          <HeaderIconButton
            icon="📹"
            label="Iniciar teleconsulta"
            onClick={onStartTeleconsultation}
            disabled={!canStartCall || isLocked}
          />
          {!hideModuleShortcuts ? (
            <>
              <HeaderIconButton
                icon="💊"
                label="Recetas"
                onClick={onOpenPrescription}
                disabled={actionDisabled?.prescription ?? isLocked}
              />
              <HeaderIconButton
                icon="🧪"
                label="Laboratorios"
                onClick={onOpenLabOrders}
                disabled={isLocked}
              />
            </>
          ) : null}
          <HeaderIconButton
            icon="💳"
            label="Pagar consulta"
            testId="encounter-pay-trigger"
            onClick={onPayClick}
            disabled={!showPay || creatingPayment}
            active={paymentStep === "confirm"}
          />
          <EncounterActionMenu
            handlers={actionHandlers}
            loading={actionLoading}
            disabled={actionDisabled}
            isEditing={isEditing}
            onShare={onShare}
            onTransition={onTransition}
            transitionLabel={transitionLabel}
            transitioning={transitioning}
            hideDocumentActions
          />
        </div>
      </div>

      {showPay && paymentStep === "confirm" ? (
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
