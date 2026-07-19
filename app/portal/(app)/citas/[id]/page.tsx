"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  cancelPortalAppointment,
  fetchPortalAppointment,
  fetchPortalTelemedicine,
  reschedulePortalAppointment,
  type PatientPortalAppointment,
} from "@/lib/services/patient-portal";

const FONT = "Montserrat, sans-serif";

export default function PortalAppointmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const [appointment, setAppointment] = useState<PatientPortalAppointment | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [startsAt, setStartsAt] = useState("");

  const reload = useCallback(async () => {
    if (!id) return;
    const row = await fetchPortalAppointment(id);
    setAppointment(row);
    setStartsAt(row.startsAt.slice(0, 16));
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "No se pudo cargar la cita");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  async function onCancel() {
    if (!id || !appointment?.canCancel) return;
    setBusy(true);
    setError(null);
    try {
      await cancelPortalAppointment(id, "cancelled_from_portal");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cancelar");
    } finally {
      setBusy(false);
    }
  }

  async function onReschedule() {
    if (!id || !appointment?.canReschedule || !startsAt) return;
    setBusy(true);
    setError(null);
    try {
      const iso = new Date(startsAt).toISOString();
      await reschedulePortalAppointment(id, iso);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo reagendar");
    } finally {
      setBusy(false);
    }
  }

  async function onTelemedicine() {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      const prep = await fetchPortalTelemedicine(id);
      // Guest channel join URL (ADR-001) — do not mix Staff JWT into WebRTC.
      window.location.href = prep.joinUrl;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Teleconsulta no disponible (¿pago pendiente?)",
      );
      setBusy(false);
    }
  }

  if (!appointment && !error) {
    return <p className="text-sm text-primaryDark/50">Cargando cita…</p>;
  }

  return (
    <div className="max-w-xl">
      <button
        type="button"
        className="mb-4 text-sm text-primary underline"
        onClick={() => router.push("/portal/citas")}
      >
        ← Volver
      </button>
      <h1 className="mb-4 text-3xl font-bold text-primary" style={{ fontFamily: FONT }}>
        Detalle de cita
      </h1>
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {appointment ? (
        <div className="space-y-4 rounded-2xl border border-hd-border-subtle bg-white p-6">
          <p>
            <span className="text-xs uppercase text-primaryDark/50">Inicio</span>
            <br />
            <strong>{new Date(appointment.startsAt).toLocaleString("es-CL")}</strong>
          </p>
          <p>
            <span className="text-xs uppercase text-primaryDark/50">Estado</span>
            <br />
            {appointment.status}
          </p>
          <p>
            <span className="text-xs uppercase text-primaryDark/50">Pago</span>
            <br />
            {appointment.paymentStatus}
          </p>
          {appointment.reason ? (
            <p>
              <span className="text-xs uppercase text-primaryDark/50">Motivo</span>
              <br />
              {appointment.reason}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            {appointment.telemedicineReady ? (
              <Button disabled={busy} onClick={() => void onTelemedicine()}>
                Entrar a teleconsulta
              </Button>
            ) : null}
            {appointment.canCancel ? (
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => void onCancel()}
              >
                Cancelar
              </Button>
            ) : null}
          </div>

          {appointment.canReschedule ? (
            <div className="border-t border-hd-border-subtle pt-4">
              <h2 className="mb-2 font-semibold" style={{ fontFamily: FONT }}>
                Reagendar
              </h2>
              <Input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                disabled={busy}
                className="mb-3"
              />
              <Button disabled={busy} onClick={() => void onReschedule()}>
                Guardar nuevo horario
              </Button>
              <p className="mt-2 text-xs text-primaryDark/50">
                Sujeto a reglas de Agenda Enterprise (disponibilidad del médico).
              </p>
            </div>
          ) : null}

          {appointment.telemedicineAccessToken ? (
            <p className="text-xs text-primaryDark/50">
              Estado de reserva pública:{" "}
              <a
                className="text-primary underline"
                href={`/dr/booking/${appointment.telemedicineAccessToken}`}
              >
                abrir enlace de reserva
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
