"use client";

import { ClinicalCard } from "@/components/clinical/design";
import type { ActionBarHandlers, ActionBarLoading } from "@/lib/encounter/action-bar-types";
import { cn } from "@/lib/utils";

interface DocAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function DocumentsTab({
  handlers,
  loading,
  disabled,
}: {
  handlers: ActionBarHandlers;
  loading: ActionBarLoading;
  disabled: Partial<Record<string, boolean>>;
}) {
  const actions: DocAction[] = [
    {
      id: "pdf",
      label: "PDF clínico de consulta",
      description: "Descarga el resumen legal de la consulta.",
      icon: "📄",
      onClick: handlers.onDownloadPdf,
      loading: loading.pdf,
      disabled: disabled.pdf,
    },
    {
      id: "invoice",
      label: "Generar factura (documento)",
      description: "Endpoint legacy de factura por consulta.",
      icon: "🧾",
      onClick: handlers.onGenerateInvoice,
      loading: loading.invoice,
      disabled: disabled.invoice,
    },
    {
      id: "rx",
      label: "Receta firmada",
      description: "Documento firmado de prescripción.",
      icon: "📝",
      onClick: handlers.onGenerateSignedPrescription,
      loading: loading.signedPrescription,
      disabled: disabled.signedPrescription,
    },
    {
      id: "referral",
      label: "Interconsulta firmada",
      description: "Derivación / interconsulta con firma.",
      icon: "📋",
      onClick: handlers.onGenerateSignedReferral,
      loading: loading.signedReferral,
      disabled: disabled.signedReferral,
    },
    {
      id: "cert",
      label: "Certificado médico firmado",
      description: "Certificado con validez legal.",
      icon: "📜",
      onClick: handlers.onGenerateSignedCertificate,
      loading: loading.signedCertificate,
      disabled: disabled.signedCertificate,
    },
    {
      id: "premium",
      label: "Documento premium",
      description: "Plantilla premium de consulta.",
      icon: "⭐",
      onClick: handlers.onGeneratePremiumDocument,
      loading: loading.premium,
      disabled: disabled.premium,
    },
  ];

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Centraliza recetas firmadas, derivaciones, PDFs y documentos clínicos.
        Los PDF por ítem (receta, lab, derivación) están en la pestaña Órdenes.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <li key={action.id}>
            <ClinicalCard interactive className="flex h-full flex-col gap-hd-3 p-hd-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {action.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-800">{action.label}</h3>
                  <p className="mt-1 text-xs text-slate-500">{action.description}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className={cn(
                  "clinical-interactive mt-auto w-full rounded-hd-md bg-primary px-hd-3 py-hd-2 text-sm font-semibold text-white hover:bg-primaryMid",
                  (action.disabled || action.loading) && "cursor-not-allowed opacity-55",
                )}
              >
                {action.loading ? "Procesando…" : "Generar / abrir"}
              </button>
            </ClinicalCard>
          </li>
        ))}
      </ul>
    </div>
  );
}
