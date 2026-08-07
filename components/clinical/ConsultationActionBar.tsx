"use client";

/**
 * Barra de acciones: acciones frecuentes visibles y resto en «Más acciones».
 * Documentos firmados / PDF centralizados en la pestaña Documentos (P0-5).
 */

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ActionBarHandlers {
  onStartTeleconsultation: () => void;
  onOpenPrescription: () => void;
  onGenerateInvoice: () => void;
  onDownloadPdf: () => void;
  onToggleEdit: () => void;
  onAnalyzeWithAi: () => void;
  onDelete: () => void;
  onGenerateSignedPrescription: () => void;
  onGenerateSignedCertificate: () => void;
  onGenerateSignedReferral: () => void;
  onGeneratePremiumDocument: () => void;
}

export interface ActionBarLoading {
  starting?: boolean;
  invoice?: boolean;
  pdf?: boolean;
  ai?: boolean;
  deleting?: boolean;
  signedPrescription?: boolean;
  signedCertificate?: boolean;
  signedReferral?: boolean;
  premium?: boolean;
}

export interface ActionBarDisabled {
  startTele?: boolean;
  prescription?: boolean;
  invoice?: boolean;
  pdf?: boolean;
  edit?: boolean;
  ai?: boolean;
  delete?: boolean;
  signedPrescription?: boolean;
  signedCertificate?: boolean;
  signedReferral?: boolean;
  premium?: boolean;
}

interface ConsultationActionBarProps {
  handlers: ActionBarHandlers;
  loading?: ActionBarLoading;
  disabled?: ActionBarDisabled;
  isEditing?: boolean;
  patientId?: string | null;
  /** Navega a la pestaña Documentos del workspace (P0-5). */
  onOpenDocuments?: () => void;
}

type ChipVariant =
  | "teal"
  | "purple"
  | "mint"
  | "ai"
  | "slate"
  | "documents";

const chipClass: Record<ChipVariant, string> = {
  teal: "bg-teal-600 text-white border-transparent hover:bg-teal-700",
  purple: "bg-violet-600 text-white border-transparent hover:bg-violet-700",
  mint: "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100",
  ai: "bg-indigo-900 text-white border-transparent hover:bg-indigo-950",
  slate: "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100",
  documents: "bg-white text-slate-800 border-slate-300 hover:bg-slate-50",
};

function Chip({
  label,
  onClick,
  variant,
  loading,
  disabled,
  icon,
  title,
}: {
  label: string;
  onClick: () => void;
  variant: ChipVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  title?: string;
}) {
  const inactive = disabled || loading;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={inactive}
      title={title ?? label}
      className={cn(
        "inline-flex max-w-full flex-[0_1_auto] items-center gap-2 rounded-full border px-4 py-2.5 text-left text-sm font-semibold leading-snug transition-opacity",
        chipClass[variant],
        inactive && "cursor-not-allowed opacity-55",
      )}
    >
      {icon ? (
        <span className="shrink-0 text-base" aria-hidden>
          {icon}
        </span>
      ) : null}
      <span className="break-words">{loading ? "Procesando…" : label}</span>
    </button>
  );
}

export function ConsultationActionBar({
  handlers,
  loading = {},
  disabled = {},
  isEditing,
  patientId,
  onOpenDocuments,
  onOpenFullRecord,
}: ConsultationActionBarProps & {
  /** Prefer in-encounter Full Record over /panel/pacientes navigation. */
  onOpenFullRecord?: () => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [moreOpen]);

  return (
    <div ref={wrapRef} className="relative mb-5 w-full max-w-full">
      <div className="flex flex-wrap items-stretch gap-2">
        <Chip
          label="Iniciar Teleconsulta"
          icon="📹"
          variant="teal"
          loading={loading.starting}
          disabled={disabled.startTele}
          onClick={handlers.onStartTeleconsultation}
        />
        <Chip
          label="Prescripción"
          icon="💊"
          variant="purple"
          disabled={disabled.prescription}
          onClick={handlers.onOpenPrescription}
        />
        <Chip
          label={isEditing ? "Cerrar edición" : "Editar ficha"}
          icon="✏️"
          variant="mint"
          disabled={disabled.edit}
          onClick={handlers.onToggleEdit}
        />
        <Chip
          label="Analizar con HeyDoctor Copilot"
          icon="✨"
          variant="ai"
          loading={loading.ai}
          disabled={disabled.ai}
          onClick={handlers.onAnalyzeWithAi}
        />
        {onOpenDocuments ? (
          <Chip
            label="Documentos"
            icon="📁"
            variant="documents"
            onClick={onOpenDocuments}
          />
        ) : null}
        <div className="relative inline-flex">
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            aria-haspopup="menu"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Más acciones
            <span className="text-[10px]" aria-hidden>
              ▾
            </span>
          </button>
          {moreOpen ? (
            <div
              role="menu"
              className="absolute left-0 top-full z-50 mt-1.5 min-w-[280px] max-w-[min(100vw-32px,340px)] rounded-xl border border-slate-100 bg-white py-2 shadow-premium"
            >
              <MenuBtn
                label="Generar factura"
                icon="🧾"
                loading={loading.invoice}
                disabled={disabled.invoice}
                onClick={() => {
                  setMoreOpen(false);
                  handlers.onGenerateInvoice();
                }}
              />
              <MenuBtn
                label="Descargar PDF"
                icon="📄"
                loading={loading.pdf}
                disabled={disabled.pdf}
                onClick={() => {
                  setMoreOpen(false);
                  handlers.onDownloadPdf();
                }}
              />
              {onOpenDocuments ? (
                <MenuBtn
                  label="Ver todos los documentos…"
                  icon="📁"
                  onClick={() => {
                    setMoreOpen(false);
                    onOpenDocuments();
                  }}
                />
              ) : null}
              <div className="my-1 border-t border-slate-100" />
              <MenuBtn
                label="Eliminar consulta…"
                icon="🗑️"
                danger
                loading={loading.deleting}
                disabled={disabled.delete}
                onClick={() => {
                  setMoreOpen(false);
                  handlers.onDelete();
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
      {patientId && onOpenFullRecord ? (
        <button
          type="button"
          onClick={onOpenFullRecord}
          className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
          data-testid="encounter-open-full-record"
        >
          Ver ficha del paciente →
        </button>
      ) : patientId ? (
        <Link
          href={`/panel/pacientes/${patientId}`}
          className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
        >
          Ver ficha del paciente →
        </Link>
      ) : null}
    </div>
  );
}

function MenuBtn({
  label,
  icon,
  onClick,
  loading,
  disabled,
  danger,
}: {
  label: string;
  icon: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  danger?: boolean;
}) {
  const inactive = disabled || loading;
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={inactive}
      className={cn(
        "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold",
        danger ? "text-red-700" : "text-slate-800",
        inactive ? "cursor-not-allowed opacity-50" : "hover:bg-slate-50",
      )}
    >
      <span aria-hidden>{icon}</span>
      {loading ? "Procesando…" : label}
    </button>
  );
}

export default ConsultationActionBar;
