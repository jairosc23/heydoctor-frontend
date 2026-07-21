"use client";

import Image from "next/image";
import { SignatureCanvas } from "@/components/clinical";
import { cn } from "@/lib/utils";
import {
  formatConsultationPrice,
  URGENCY_AVAILABLE_NOW,
} from "@/lib/consultation-pricing";

export interface EncounterHeaderActionsProps {
  canStartCall: boolean;
  onStartTeleconsultation: () => void;
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
  className?: string;
}

export function EncounterHeaderActions({
  canStartCall,
  onStartTeleconsultation,
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
  className,
}: EncounterHeaderActionsProps) {
  const showSignPanel = canSign && !isSigned;
  const showPay = canPay && !isLocked;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        className="flex flex-wrap items-center gap-2"
        role="toolbar"
        aria-label="Acciones del encuentro"
      >
        {canStartCall ? (
          <button
            type="button"
            onClick={onStartTeleconsultation}
            className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            <span aria-hidden>📹</span>
            Teleconsulta
          </button>
        ) : null}

        {isSigned ? (
          <span className="inline-flex items-center rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">
            Firmada
            {signedAt
              ? ` · ${new Date(signedAt).toLocaleDateString("es-CL")}`
              : ""}
          </span>
        ) : showSignPanel ? (
          <a
            href="#encounter-sign-panel"
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Firmar consulta
          </a>
        ) : null}

        {showPay ? (
          paymentStep === "idle" ? (
            <button
              type="button"
              onClick={onPayClick}
              disabled={creatingPayment}
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              <span aria-hidden>💳</span>
              Pagar consulta
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2">
              <span className="text-sm font-semibold text-slate-800">
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
                className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
            </div>
          )
        ) : null}
      </div>

      {isSigned && doctorSignature ? (
        <div className="inline-block rounded-lg border border-slate-200 bg-slate-50 p-1.5">
          <Image
            unoptimized
            src={`data:image/png;base64,${doctorSignature}`}
            alt="Firma del doctor"
            width={160}
            height={64}
            className="h-auto max-h-[64px] w-auto max-w-[160px]"
          />
        </div>
      ) : null}

      {showSignPanel ? (
        <div
          id="encounter-sign-panel"
          className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <p className="mb-2 text-xs text-slate-600">
            Cierre legal de la consulta vía firma digital. Esto actualiza el
            estado a Firmada (no es la firma de PDFs de receta/lab/interconsulta).
          </p>
          <SignatureCanvas onSign={onSign} disabled={signing} />
          {signing ? (
            <p className="mt-1 text-xs text-slate-500">Firmando…</p>
          ) : null}
        </div>
      ) : null}

      {showPay && paymentStep === "confirm" ? (
        <p className="text-xs text-slate-500">
          {URGENCY_AVAILABLE_NOW} — Serás redirigido a Payku para completar el pago.
        </p>
      ) : null}

      {saveMsg ? (
        <p
          className={cn(
            "text-xs",
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
    </div>
  );
}
