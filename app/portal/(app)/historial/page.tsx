"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import {
  fetchPortalAppointments,
  type PatientPortalAppointment,
} from "@/lib/services/patient-portal";

const FONT = "Montserrat, sans-serif";

export default function PortalHistoryPage() {
  const [rows, setRows] = useState<PatientPortalAppointment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchPortalAppointments();
        if (!cancelled) {
          setRows(
            list.filter(
              (a) =>
                new Date(a.startsAt).getTime() < Date.now() ||
                ["CANCELLED", "COMPLETED", "NO_SHOW", "REFUNDED"].includes(
                  a.status,
                ),
            ),
          );
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error al cargar historial");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-primary" style={{ fontFamily: FONT }}>
        Historial de citas
      </h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {rows.length === 0 && !error ? (
        <p className="text-sm text-primaryDark/60">Aún no hay historial.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((a) => (
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
                </p>
              </div>
              <Button href={`/portal/citas/${a.id}`} className="px-4 py-2 text-sm">
                Detalle
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
