"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import {
  fetchPortalDashboard,
  type PatientPortalDashboard,
} from "@/lib/services/patient-portal";

const FONT = "Montserrat, sans-serif";

export default function PortalHomePage() {
  const [data, setData] = useState<PatientPortalDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const d = await fetchPortalDashboard();
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "No se pudo cargar el portal");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName =
    (data?.patient?.displayName as string | undefined) ||
    (data?.patient?.name as string | undefined) ||
    "Paciente";

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-primary" style={{ fontFamily: FONT }}>
        Hola, {displayName}
      </h1>
      <p className="mb-8 text-sm text-primaryDark/70">
        Tu portal de citas, pagos y teleconsulta.
      </p>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!data && !error ? (
        <p className="text-sm text-primaryDark/50">Cargando…</p>
      ) : null}

      {data ? (
        <>
          <section className="mb-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-hd-border-subtle bg-white p-5">
              <p className="text-xs uppercase tracking-wide text-primaryDark/50">
                Próximas
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {data.upcoming.length}
              </p>
            </div>
            <div className="rounded-2xl border border-hd-border-subtle bg-white p-5">
              <p className="text-xs uppercase tracking-wide text-primaryDark/50">
                Pagos pendientes
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {data.paymentsSummary.pending}
              </p>
            </div>
            <div className="rounded-2xl border border-hd-border-subtle bg-white p-5">
              <p className="text-xs uppercase tracking-wide text-primaryDark/50">
                Pagadas
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {data.paymentsSummary.paid}
              </p>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ fontFamily: FONT }}>
                Próximas citas
              </h2>
              <Button href="/portal/citas" variant="secondary" className="px-4 py-2 text-sm">
                Ver todas
              </Button>
            </div>
            {data.upcoming.length === 0 ? (
              <p className="text-sm text-primaryDark/60">
                No tienes citas próximas. Reserva desde el perfil público del médico.
              </p>
            ) : (
              <ul className="space-y-3">
                {data.upcoming.slice(0, 5).map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hd-border-subtle bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold">
                        {new Date(a.startsAt).toLocaleString("es-CL")}
                      </p>
                      <p className="text-xs text-primaryDark/60">
                        {a.status} · pago {a.paymentStatus}
                        {a.doctorName ? ` · ${a.doctorName}` : ""}
                      </p>
                    </div>
                    <Button
                      href={`/portal/citas/${a.id}`}
                      variant="primary"
                      className="px-4 py-2 text-sm"
                    >
                      Detalle
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="mt-8 text-sm text-primaryDark/60">
            ¿Tienes un enlace de reserva?{" "}
            <Link href="/portal/reclamar" className="text-primary underline">
              Vincúlalo a tu cuenta
            </Link>
            .
          </p>
        </>
      ) : null}
    </div>
  );
}
