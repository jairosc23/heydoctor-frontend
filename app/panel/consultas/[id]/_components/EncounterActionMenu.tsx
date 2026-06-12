"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  ActionBarDisabled,
  ActionBarHandlers,
  ActionBarLoading,
} from "@/components/clinical/ConsultationActionBar";

export interface EncounterActionMenuProps {
  handlers: ActionBarHandlers;
  loading?: ActionBarLoading;
  disabled?: ActionBarDisabled;
  isEditing?: boolean;
  onShare?: () => void;
  onTransition?: () => void;
  transitionLabel?: string;
  transitioning?: boolean;
  onOpenDocuments?: () => void;
  className?: string;
}

function MenuItem({
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
  onTransition,
  transitionLabel,
  transitioning,
  onOpenDocuments,
  className,
}: EncounterActionMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

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
          className="absolute right-0 top-full z-50 mt-1 min-w-[240px] max-w-[min(100vw-32px,300px)] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <MenuItem
            label={isEditing ? "Cerrar edición" : "Editar ficha"}
            icon="✏️"
            disabled={disabled.edit}
            onClick={() => {
              setOpen(false);
              handlers.onToggleEdit();
            }}
          />
          <MenuItem
            label="Análisis clínico con IA"
            icon="✨"
            loading={loading.ai}
            disabled={disabled.ai}
            onClick={() => {
              setOpen(false);
              handlers.onAnalyzeWithAi();
            }}
          />
          {onShare ? (
            <MenuItem
              label="Compartir consulta"
              icon="🔗"
              onClick={() => {
                setOpen(false);
                onShare();
              }}
            />
          ) : null}
          {onTransition && transitionLabel ? (
            <MenuItem
              label={transitioning ? "Cambiando…" : transitionLabel}
              icon="▶"
              disabled={transitioning}
              onClick={() => {
                setOpen(false);
                onTransition();
              }}
            />
          ) : null}
          <div className="my-1 border-t border-slate-100" />
          <MenuItem
            label="Generar factura"
            icon="🧾"
            loading={loading.invoice}
            disabled={disabled.invoice}
            onClick={() => {
              setOpen(false);
              handlers.onGenerateInvoice();
            }}
          />
          <MenuItem
            label="Descargar PDF"
            icon="📄"
            loading={loading.pdf}
            disabled={disabled.pdf}
            onClick={() => {
              setOpen(false);
              handlers.onDownloadPdf();
            }}
          />
          {onOpenDocuments ? (
            <MenuItem
              label="Ver documentos"
              icon="📁"
              onClick={() => {
                setOpen(false);
                onOpenDocuments();
              }}
            />
          ) : null}
          <div className="my-1 border-t border-slate-100" />
          <MenuItem
            label="Eliminar consulta…"
            icon="🗑️"
            danger
            loading={loading.deleting}
            disabled={disabled.delete}
            onClick={() => {
              setOpen(false);
              handlers.onDelete();
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
