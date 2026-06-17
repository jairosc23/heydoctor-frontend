"use client";

import Image from "next/image";
import { SignatureCanvas } from "@/components/clinical";
import type {
  ActionBarHandlers,
  ActionBarLoading,
} from "@/components/clinical/ConsultationActionBar";
import { cn } from "@/lib/utils";
import {
  consultationStatusBadgeClass,
  STATUS_LABELS,
} from "../consultation-status";
import { DocumentsTab } from "../DocumentsTab";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

export interface EncounterClosureSectionProps {
  status: string;
  isSigned: boolean;
  isLocked: boolean;
  canSign: boolean;
  signing: boolean;
  onSign: (base64: string) => void | Promise<void>;
  signedAt?: string | null;
  doctorSignature?: string | null;
  documentHandlers: ActionBarHandlers;
  documentLoading: ActionBarLoading;
  documentDisabled: Partial<Record<string, boolean>>;
  signMessage?: string;
}

export function EncounterClosureSection({
  status,
  isSigned,
  isLocked,
  canSign,
  signing,
  onSign,
  signedAt,
  doctorSignature,
  documentHandlers,
  documentLoading,
  documentDisabled,
  signMessage,
}: EncounterClosureSectionProps) {
  const statusLabel = STATUS_LABELS[status] ?? status;
  const showSign = canSign && !isSigned;
  const documentsEnabled = isSigned || isLocked;

  return (
    <div
      data-testid="encounter-closure-section"
      className="mt-hd-4 space-y-hd-4 border-t-2 border-primary/15 pt-hd-4"
      aria-label="Cierre médico legal"
    >
      <ClinicalEncounterSection
        sectionNumber={20}
        title="Firma médica y bloqueo legal"
        id="encounter-section-20"
      >
        <div className="mb-hd-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-semibold",
              consultationStatusBadgeClass(status),
            )}
          >
            {statusLabel}
          </span>
          {isSigned ? (
            <span className="text-xs font-medium text-emerald-700">
              Consulta firmada
            </span>
          ) : showSign ? (
            <span className="text-xs text-slate-600">
              Pendiente de firma médica
            </span>
          ) : (
            <span className="text-xs text-amber-700">
              Complete la documentación para habilitar la firma
            </span>
          )}
        </div>

        {isSigned && doctorSignature ? (
          <div className="flex flex-wrap items-center gap-3 rounded-hd-md border border-emerald-200 bg-emerald-50/80 p-hd-3">
            <Image
              unoptimized
              src={`data:image/png;base64,${doctorSignature}`}
              alt="Firma del doctor"
              width={160}
              height={64}
              className="h-auto max-h-[56px] w-auto max-w-[160px]"
            />
            {signedAt ? (
              <p className="text-sm text-emerald-800">
                Firmada el{" "}
                {new Date(signedAt).toLocaleString("es-CL", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            ) : null}
          </div>
        ) : null}

        {showSign ? (
          <div id="encounter-sign-panel" data-testid="encounter-sign-panel">
            <p className="mb-hd-2 text-sm text-slate-600">
              La firma cierra la consulta de forma legal e inmutable. Revise la
              ficha antes de firmar.
            </p>
            <SignatureCanvas onSign={onSign} disabled={signing} />
            {signing ? (
              <p className="mt-hd-2 text-xs text-slate-500">Firmando…</p>
            ) : null}
          </div>
        ) : null}

        {signMessage ? (
          <p
            className={cn(
              "mt-hd-2 text-sm",
              signMessage.toLowerCase().includes("error") ||
                signMessage.toLowerCase().includes("no pud")
                ? "text-red-600"
                : "text-emerald-700",
            )}
            role="status"
          >
            {signMessage}
          </p>
        ) : null}

        <div className="mt-hd-3 rounded-hd-md border border-hd-border-subtle bg-hd-surface-muted px-hd-3 py-hd-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Bloqueo legal
          </p>
          {isLocked ? (
            <p className="text-sm text-slate-700">
              Esta consulta está <strong>bloqueada</strong>. No se puede editar
              la documentación clínica ni modificar órdenes asociadas.
            </p>
          ) : isSigned ? (
            <p className="text-sm text-slate-700">
              La consulta está firmada. La edición clínica está deshabilitada. El
              bloqueo definitivo puede aplicarse tras el proceso de pago.
            </p>
          ) : (
            <p className="text-sm text-slate-600">
              Tras firmar, la ficha clínica dejará de ser editable.
            </p>
          )}
        </div>
      </ClinicalEncounterSection>

      <ClinicalEncounterSection
        sectionNumber={22}
        title="Documentos clínicos"
        id="encounter-section-22"
      >
        {!documentsEnabled ? (
          <p className="rounded-hd-md border border-amber-200 bg-amber-50 px-hd-3 py-hd-2 text-sm text-amber-900">
            Firme la consulta para habilitar PDF clínico, recetas firmadas,
            certificados e interconsultas.
          </p>
        ) : (
          <DocumentsTab
            handlers={documentHandlers}
            loading={documentLoading}
            disabled={documentDisabled}
          />
        )}
      </ClinicalEncounterSection>
    </div>
  );
}
