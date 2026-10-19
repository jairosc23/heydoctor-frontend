"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  loadLongitudinalContinuity,
  type LongitudinalContinuityProjection,
} from "@/lib/product-platform/longitudinal-continuity";

export default function LongitudinalContinuityPage() {
  const params = useParams();
  const patientId =
    typeof params?.patientId === "string" ? params.patientId : "";
  const [projection, setProjection] =
    useState<LongitudinalContinuityProjection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;
    let cancelled = false;
    void loadLongitudinalContinuity({ patientId })
      .then((next) => {
        if (!cancelled) setProjection(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar la continuidad longitudinal.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  return (
    <div className="space-y-4" data-testid="longitudinal-continuity-page">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          Continuidad longitudinal
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-primaryDark/70">
          Actos clínicos vigentes de este paciente, en orden cronológico. La
          entrega y la firma se completan en la consulta certificada.
        </p>
      </div>

      {projection ? (
        <dl
          className="grid grid-cols-2 gap-3 sm:grid-cols-3"
          data-testid="longitudinal-continuity-metrics"
        >
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Visitas
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {projection.metrics.totalContinuityPackages}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Actos vigentes
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {projection.metrics.activeClinicalActs}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Sin handoff
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {projection.metrics.absentHandOffCount}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Entregados
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {projection.metrics.deliveredDocumentCount}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Recetas
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {projection.metrics.prescriptionCount}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Resúmenes
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {projection.metrics.visitSummaryCount}
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
        <p className="text-sm text-slate-600">Falta el identificador del paciente.</p>
      ) : null}

      {patientId && !projection && !error ? (
        <p className="text-sm text-slate-500">Cargando continuidad…</p>
      ) : null}

      {projection && projection.items.length === 0 ? (
        <p className="text-sm text-slate-600">
          No hay consultas firmadas o bloqueadas para este paciente.
        </p>
      ) : null}

      {projection && projection.items.length > 0 ? (
        <ol className="space-y-2" data-testid="longitudinal-continuity-list">
          {projection.items.map((item) => (
            <li
              key={item.encounterId}
              className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2"
              data-handoff={item.handoff}
            >
              <p className="text-sm font-semibold text-slate-800">
                {item.handoff === "absent"
                  ? "Sin handoff clínico"
                  : item.documentKind === "prescription"
                    ? "Receta"
                    : item.documentKind === "visit_summary"
                      ? "Resumen de visita"
                      : "Acto clínico vigente"}
              </p>
              {item.clinicalActId ? (
                <p className="font-mono text-[10px] text-slate-500">
                  ClinicalActId {item.clinicalActId}
                </p>
              ) : null}
              <p className="font-mono text-[10px] text-slate-500">
                EncounterId {item.encounterId}
              </p>
              <p className="font-mono text-[10px] text-slate-400">
                asOf {item.asOf}
              </p>
              {item.deliveredAt ? (
                <p className="text-xs text-slate-600">Documento entregado</p>
              ) : null}
              <Link
                href={`/panel/consultas/${item.encounterId}`}
                className="mt-1 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Abrir consulta
              </Link>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
