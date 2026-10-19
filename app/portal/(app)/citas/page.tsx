"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import {
  fetchPortalAppointments,
  type PatientPortalAppointment,
} from "@/lib/services/patient-portal";

const FONT = "Montserrat, sans-serif";

export default function PortalAppointmentsPage() {
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
          setError(e instanceof Error ? e.message : "Error al cargar citas");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const upcoming = rows.filter((a) => new Date(a.startsAt).getTime() >= Date.now());
  const past = rows.filter((a) => new Date(a.startsAt).getTime() < Date.now());

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-primary" style={{ fontFamily: FONT }}>
        Mis citas
      </h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Section title="Próximas" items={upcoming} />
      <Section title="Pasadas / cerradas" items={past} />
    </div>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: PatientPortalAppointment[];
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-lg font-bold" style={{ fontFamily: FONT }}>
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-primaryDark/60">Sin citas en esta sección.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hd-border-subtle bg-white px-4 py-3"
            >
              <div>
                <p className="font-semibold">
                  {new Date(a.startsAt).toLocaleString("es-CL")}
                </p>
                <p className="text-xs text-primaryDark/60">
                  {a.status} · {a.paymentStatus}
                  {a.canCancel ? " · cancelable" : ""}
                  {a.canReschedule ? " · reagendable" : ""}
                </p>
              </div>
              <Button href={`/portal/citas/${a.id}`} className="px-4 py-2 text-sm">
                Ver
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
