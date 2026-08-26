"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  loadPreVisitBrief,
  type PreVisitClinicalBrief,
} from "@/lib/product-platform/pre-visit-clinical-brief";

export default function PreVisitClinicalBriefPage() {
  const params = useParams();
  const patientId =
    typeof params?.patientId === "string" ? params.patientId : "";
  const [brief, setBrief] = useState<PreVisitClinicalBrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;
    let cancelled = false;
    void loadPreVisitBrief({ patientId })
      .then((next) => {
        if (!cancelled) setBrief(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el brief de pre-visita.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  return (
    <div className="space-y-4" data-testid="pre-visit-clinical-brief-page">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          Brief clínico de pre-visita
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-primaryDark/70">
          Punto de partida clínico de la próxima atención. La entrega y la
          firma se completan en la consulta certificada.
        </p>
      </div>

      {brief ? (
        <dl
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          data-testid="pre-visit-clinical-brief-metrics"
        >
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Disponible
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {brief.metrics.briefAvailable}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Vacío
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {brief.metrics.briefEmpty}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Acto vigente
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {brief.metrics.sourceClinicalActPresent}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Entregado
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {brief.metrics.sourceDelivered}
            </dd>
          </div>
        </dl>
      ) : null}

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {!patientId ? (
        <p className="text-sm text-slate-600">
          Falta el identificador del paciente.
        </p>
      ) : null}

      {patientId && !brief && !error ? (
        <p className="text-sm text-slate-500">Cargando brief…</p>
      ) : null}

      {brief?.status === "empty" ? (
        <p className="text-sm text-slate-600">
          No hay un acto certificado previo para iniciar la próxima atención.
        </p>
      ) : null}

      {brief?.status === "ready" && brief.origin ? (
        <div
          className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-3"
          data-testid="pre-visit-clinical-brief-origin"
          data-handoff={brief.origin.handoff}
        >
          <p className="text-sm font-semibold text-slate-800">
            {brief.origin.handoff === "absent"
              ? "Sin handoff clínico en la última visita"
              : brief.origin.documentKind === "prescription"
                ? "Última receta vigente"
                : brief.origin.documentKind === "visit_summary"
                  ? "Último resumen de visita"
                  : "Último acto clínico vigente"}
          </p>
          {brief.origin.clinicalActId ? (
            <p className="font-mono text-[10px] text-slate-500">
              ClinicalActId {brief.origin.clinicalActId}
            </p>
          ) : null}
          <p className="font-mono text-[10px] text-slate-500">
            EncounterId {brief.origin.encounterId}
          </p>
          <p className="font-mono text-[10px] text-slate-400">
            asOf {brief.origin.asOf}
          </p>
          {brief.origin.deliveredAt ? (
            <p className="text-xs text-slate-600">Documento entregado</p>
          ) : brief.origin.handoff === "present" ? (
            <p className="text-xs text-slate-600">Documento no entregado</p>
          ) : null}
          <Link
            href={`/panel/consultas/${brief.origin.encounterId}`}
            className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
          >
            Abrir consulta
          </Link>
        </div>
      ) : null}
    </div>
  );
}
