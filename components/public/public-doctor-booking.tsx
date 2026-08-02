"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import {
  createPublicBooking,
  fetchPublicDoctorSlots,
  startPublicBookingCheckout,
  type PublicAvailabilitySlot,
  PublicBookingError,
} from "@/lib/services/public-booking";

const FONT_HEADING = "Montserrat, sans-serif";

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function formatSlotLabel(iso: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("es-CL", {
      timeZone,
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString("es-CL");
  }
}

export function PublicDoctorBooking({
  doctorSlug,
  doctorName,
}: {
  doctorSlug: string;
  doctorName: string;
}) {
  const router = useRouter();
  const [slots, setSlots] = useState<PublicAvailabilitySlot[]>([]);
  const [clinicTimezone, setClinicTimezone] = useState("America/Santiago");
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selected, setSelected] = useState<PublicAvailabilitySlot | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [reason, setReason] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo(() => {
    const from = startOfLocalDay(new Date());
    const to = addDays(from, 14);
    return { from: from.toISOString(), to: to.toISOString() };
  }, []);

  const loadSlots = useCallback(async () => {
    setLoadingSlots(true);
    setError(null);
    try {
      const res = await fetchPublicDoctorSlots(
        doctorSlug,
        range.from,
        range.to,
        30,
      );
      setSlots(res.slots);
      setClinicTimezone(res.clinicTimezone);
    } catch (e) {
      setError(
        e instanceof PublicBookingError
          ? e.message
          : "No se pudo cargar la disponibilidad.",
      );
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [doctorSlug, range.from, range.to]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  async function onBook() {
    if (!selected) {
      setError("Selecciona un horario disponible.");
      return;
    }
    if (!patientName.trim() || !patientEmail.trim()) {
      setError("Nombre y correo son obligatorios.");
      return;
    }
    if (!consent) {
      setError("Debes aceptar el consentimiento de telemedicina.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const booking = await createPublicBooking(doctorSlug, {
        patientName: patientName.trim(),
        patientEmail: patientEmail.trim(),
        startsAt: selected.startsAt,
        endsAt: selected.endsAt,
        reason: reason.trim() || undefined,
        patientTimezone: clinicTimezone,
        consentVersion: "public-booking-v1",
        idempotencyKey:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : undefined,
      });
      const { storePortalInvite } = await import(
        "@/lib/services/portal-invite-storage"
      );
      if (booking.portalInviteToken) {
        storePortalInvite(booking.bookingToken, booking.portalInviteToken);
      }
      try {
        const checkout = await startPublicBookingCheckout(booking.bookingToken);
        if (checkout.paymentUrl) {
          window.location.href = checkout.paymentUrl;
          return;
        }
      } catch (checkoutErr) {
        // Booking is already created — degrade gracefully when payments are down.
        console.error("[public-booking/checkout]", checkoutErr);
        router.push(
          `/dr/booking/${booking.bookingToken}?payment=unavailable`,
        );
        return;
      }
      router.push(`/dr/booking/${booking.bookingToken}`);
    } catch (e) {
      setError(
        e instanceof PublicBookingError
          ? e.message
          : "No se pudo completar la reserva.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-6 rounded-2xl border border-hd-border-subtle bg-white p-6 shadow-premium">
      <h2
        className="mb-1 text-lg font-bold text-primaryDark"
        style={{ fontFamily: FONT_HEADING }}
      >
        Reservar cita con {doctorName}
      </h2>
      <p className="mb-4 text-sm text-primaryDark/60">
        Elige un horario, completa tus datos y confirma el pago para preparar tu
        teleconsulta.
      </p>

      {loadingSlots ? (
        <p className="text-sm text-primaryDark/50">Cargando horarios…</p>
      ) : slots.length === 0 ? (
        <p className="text-sm text-primaryDark/50">
          No hay horarios públicos disponibles en los próximos 14 días.
        </p>
      ) : (
        <div className="mb-4 grid max-h-56 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
          {slots.slice(0, 40).map((slot) => {
            const active = selected?.startsAt === slot.startsAt;
            return (
              <button
                key={`${slot.startsAt}-${slot.endsAt}`}
                type="button"
                onClick={() => setSelected(slot)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                  active
                    ? "border-primary bg-primary/10 text-primaryDark"
                    : "border-hd-border-subtle bg-hd-surface-base text-primaryDark/80 hover:border-primary/40"
                }`}
              >
                {formatSlotLabel(slot.startsAt, clinicTimezone)}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-primaryDark">Nombre completo</span>
          <input
            className="rounded-lg border border-hd-border-subtle px-3 py-2"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            autoComplete="name"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-primaryDark">Correo</span>
          <input
            type="email"
            className="rounded-lg border border-hd-border-subtle px-3 py-2"
            value={patientEmail}
            onChange={(e) => setPatientEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium text-primaryDark">
            Motivo (opcional)
          </span>
          <textarea
            className="min-h-[72px] rounded-lg border border-hd-border-subtle px-3 py-2"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={2000}
          />
        </label>
        <label className="flex items-start gap-2 text-sm text-primaryDark/80">
          <input
            type="checkbox"
            className="mt-1"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            Acepto el consentimiento de telemedicina y el tratamiento de mis
            datos para esta cita con {doctorName}.
          </span>
        </label>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5">
        <Button
          type="button"
          variant="primary"
          disabled={submitting || loadingSlots}
          onClick={() => void onBook()}
          className="min-h-12 w-full sm:w-auto"
        >
          {submitting ? "Procesando…" : "Reservar y pagar"}
        </Button>
      </div>
    </section>
  );
}
