"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  loadPortalEncounterView,
  type PortalEncounterView,
} from "@/lib/product-platform/patient-portal";

const ENCOUNTER_STATUS_COPY: Record<string, string> = {
  draft: "Borrador",
  in_progress: "En curso",
  completed: "Completada",
  signed: "Firmada",
  locked: "Bloqueada",
};

function encounterStatusCopy(status: string): string {
  return ENCOUNTER_STATUS_COPY[status] ?? status;
}

function deliveryCopy(view: PortalEncounterView): string {
  if (view.delivery.status === "pendiente_de_entrega") {
    return "Pendiente de entrega";
  }
  if (view.delivery.status === "ausente") {
    return "Sin documento clínico";
  }
  return "Documento entregado";
}

function commercialCopy(view: PortalEncounterView): string {
  if (!view.commercial.settlementPresent) {
    return "Sin información comercial";
  }
  return view.commercial.isPaid ? "Pagado" : "Pendiente de pago";
}

export default function PortalEncounterPage() {
  const params = useParams();
  const encounterId =
    typeof params?.encounterId === "string" ? params.encounterId : "";
  const [view, setView] = useState<PortalEncounterView | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadPortalEncounterView({ encounterId }).then((next) => {
      if (!cancelled) setView(next);
    });
    return () => {
      cancelled = true;
    };
  }, [encounterId]);

  return (
    <div className="space-y-4" data-testid="portal-encounter-page">
      <div>
        <h1 className="text-2xl font-bold text-primary">Consulta clínica</h1>
        <p className="mt-1 max-w-2xl text-sm text-primaryDark/70">
          Información clínica ya certificada de esta consulta. Solo lectura.
        </p>
      </div>

      {!view ? (
        <p className="text-sm text-slate-500">Cargando consulta…</p>
      ) : null}

      {view?.availability === "unavailable" ? (
        <p
          className="text-sm text-slate-600"
          data-testid="portal-encounter-unavailable"
        >
          Consulta no disponible
        </p>
      ) : null}

      {view?.availability === "available" ? (
        <div className="space-y-3" data-testid="portal-encounter-available">
          {view.encounter.present && view.encounter.status ? (
            <p
              className="text-sm text-slate-700"
              data-testid="portal-encounter-status"
            >
              Estado de la consulta: {encounterStatusCopy(view.encounter.status)}
            </p>
          ) : null}

          <p
            className="text-sm font-semibold text-slate-800"
            data-testid="portal-encounter-delivery"
            data-delivery-status={view.delivery.status}
          >
            {deliveryCopy(view)}
          </p>

          {view.document ? (
            <div
              className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-3"
              data-testid="portal-encounter-document"
              data-document-kind={view.document.documentKind}
            >
              <p className="text-sm font-semibold text-slate-800">
                {view.document.documentKind === "prescription"
                  ? "Receta"
                  : "Resumen de visita"}
              </p>
              <p className="text-xs text-slate-600">
                Entregado {view.document.deliveredAt}
              </p>
            </div>
          ) : null}

          <p
            className="text-sm text-slate-600"
            data-testid="portal-encounter-commercial"
          >
            Estado comercial: {commercialCopy(view)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
