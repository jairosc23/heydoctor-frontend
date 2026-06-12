"use client";

import Image from "next/image";
import { useState } from "react";
import { SignatureCanvas } from "@/components/clinical";
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
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  href?: string;
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
  onOpenDocuments?: () => void;
  isSigned: boolean;
  canSign: boolean;
  signing: boolean;
  onSign: (base64: string) => void | Promise<void>;
  signedAt?: string | null;
  doctorSignature?: string | null;
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
  dnaDrawerOpen?: boolean;
  onOpenDoctorDna?: () => void;
  copilotDrawerOpen?: boolean;
  onOpenCopilot?: () => void;
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
  onOpenDocuments,
  isSigned,
  canSign,
  signing,
  onSign,
  signedAt,
  doctorSignature,
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
  dnaDrawerOpen = false,
  onOpenDoctorDna,
  copilotDrawerOpen = false,
  onOpenCopilot,
  className,
}: EncounterHeaderProps) {
  const [signPanelOpen, setSignPanelOpen] = useState(false);

  const transitionLabel = NEXT_STATUS_LABELS[status];
  const showPay = canPay && !isLocked;
  const showSign = canSign && !isSigned;

  return (
    <header className={cn("py-1.5", className)} aria-label="Acciones del encuentro">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver a consultas"
          title="Volver a consultas"
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
          <HeaderIconButton
            icon="📄"
            label="Documentos"
            onClick={onOpenDocuments}
            disabled={!onOpenDocuments}
          />
          <HeaderIconButton
            icon="✍"
            label={isSigned ? "Consulta firmada" : "Firmar consulta"}
            onClick={() => {
              if (showSign) setSignPanelOpen((v) => !v);
            }}
            disabled={!isSigned && !showSign}
            active={isSigned || signPanelOpen}
          />
          <HeaderIconButton
            icon="💳"
            label="Pagar consulta"
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
            onOpenDocuments={onOpenDocuments}
          />
        </div>
      </div>

      {isSigned && doctorSignature ? (
        <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-2">
          <Image
            unoptimized
            src={`data:image/png;base64,${doctorSignature}`}
            alt="Firma del doctor"
            width={120}
            height={48}
            className="h-auto max-h-[40px] w-auto max-w-[120px]"
          />
          {signedAt ? (
            <span className="text-[11px] text-green-700">
              Firmada {new Date(signedAt).toLocaleDateString("es-CL")}
            </span>
          ) : null}
        </div>
      ) : null}

      {showSign && signPanelOpen ? (
        <div
          id="encounter-sign-panel"
          className="mt-2 border-t border-slate-100 pt-2"
        >
          <p className="mb-1.5 text-[11px] text-slate-600">
            Firme para cerrar la consulta. La firma es inmutable.
          </p>
          <SignatureCanvas onSign={onSign} disabled={signing} />
          {signing ? (
            <p className="mt-1 text-[11px] text-slate-500">Firmando…</p>
          ) : null}
        </div>
      ) : null}

      {showPay && paymentStep === "confirm" ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2">
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
