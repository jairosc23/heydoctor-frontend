"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import {
  fetchPortalAppointments,
  type PatientPortalAppointment,
} from "@/lib/services/patient-portal";

const FONT = "Montserrat, sans-serif";

export default function PortalPaymentsPage() {
  const [rows, setRows] = useState<PatientPortalAppointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchPortalAppointments();
        if (!cancelled) setRows(list);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error al cargar pagos");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pending = rows.filter((a) => a.paymentStatus === "pending");
  const paid = rows.filter((a) => a.paymentStatus === "paid");

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-primary" style={{ fontFamily: FONT }}>
        Estado de pagos
      </h1>
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold">Pendientes</h2>
        {pending.length === 0 ? (
          <p className="text-sm text-primaryDark/60">Sin pagos pendientes.</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hd-border-subtle bg-white px-4 py-3"
              >
                <div>
                  <p className="font-semibold">
                    {new Date(a.startsAt).toLocaleString("es-CL")}
                  </p>
                  <p className="text-xs text-primaryDark/60">pending</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    href={`/portal/citas/${a.id}`}
                    variant="secondary"
                    className="px-4 py-2 text-sm"
                  >
                    Detalle
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Pagados</h2>
        {paid.length === 0 ? (
          <p className="text-sm text-primaryDark/60">Sin pagos registrados.</p>
        ) : (
          <ul className="space-y-3">
            {paid.map((a) => (
              <li
                key={a.id}
                className="rounded-2xl border border-hd-border-subtle bg-white px-4 py-3 text-sm"
              >
                {new Date(a.startsAt).toLocaleString("es-CL")} · paid ·{" "}
                <a className="text-primary underline" href={`/portal/citas/${a.id}`}>
                  ver cita
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
