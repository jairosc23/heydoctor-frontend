"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/branding";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import {
  fetchPublicBookingStatus,
  fetchPublicTelemedicinePrep,
  mockCompletePublicCheckout,
  startPublicBookingCheckout,
  type PublicBookingStatus,
  type PublicTelemedicinePrep,
  PublicBookingError,
} from "@/lib/services/public-booking";

const FONT_HEADING = "Montserrat, sans-serif";

export function PublicBookingStatusView({
  token,
  paymentHint,
}: {
  token: string;
  paymentHint: string | null;
}) {
  const [status, setStatus] = useState<PublicBookingStatus | null>(null);
  const [prep, setPrep] = useState<PublicTelemedicinePrep | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const s = await fetchPublicBookingStatus(token);
      setStatus(s);
      if (s?.telemedicineReady || s?.paymentStatus === "paid") {
        try {
          const t = await fetchPublicTelemedicinePrep(token);
          setPrep(t);
        } catch {
          setPrep(null);
        }
      }
    } catch (e) {
      setError(
        e instanceof PublicBookingError
          ? e.message
          : "No se pudo cargar el estado de la cita.",
      );
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (paymentHint !== "mock" || !token) return;
    let cancelled = false;
    (async () => {
      try {
        await mockCompletePublicCheckout(token);
        if (!cancelled) await refresh();
      } catch {
        /* mock endpoint may 404 in production */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paymentHint, token, refresh]);

  async function resumeCheckout() {
    setBusy(true);
    setError(null);
    try {
      const checkout = await startPublicBookingCheckout(token);
      if (checkout.paymentUrl) {
        window.location.href = checkout.paymentUrl;
      }
    } catch (e) {
      setError(
        e instanceof PublicBookingError
          ? e.message
          : "No se pudo reiniciar el pago.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-hd-surface-base">
      <header className="border-b border-hd-border-subtle bg-hd-surface-chrome shadow-hd-1">
        <Container className="flex h-16 items-center">
          <Link href="/" className="no-underline">
            <BrandLogo variant="nav" priority />
          </Link>
        </Container>
      </header>

      <main className="py-10">
        <Container className="max-w-xl">
          <h1
            className="mb-2 text-2xl font-bold text-primaryDark"
            style={{ fontFamily: FONT_HEADING }}
          >
            Estado de tu cita
          </h1>
          <p className="mb-6 text-sm text-primaryDark/60">
            Guarda este enlace para volver a tu teleconsulta cuando esté lista.
          </p>

          {!status && !error ? (
            <p className="text-sm text-primaryDark/50">Cargando…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {status ? (
            <div className="rounded-2xl border border-hd-border-subtle bg-white p-6 shadow-premium">
              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-primaryDark/50">Estado</dt>
                  <dd className="font-semibold text-primaryDark">
                    {status.status}
                  </dd>
                </div>
                <div>
                  <dt className="text-primaryDark/50">Pago</dt>
                  <dd className="font-semibold text-primaryDark">
                    {status.paymentStatus}
                  </dd>
                </div>
                <div>
                  <dt className="text-primaryDark/50">Inicio</dt>
                  <dd className="font-semibold text-primaryDark">
                    {new Date(status.startsAt).toLocaleString("es-CL")}
                  </dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-col gap-3">
                {status.paymentStatus === "pending" ? (
                  <Button
                    type="button"
                    variant="primary"
                    disabled={busy}
                    onClick={() => void resumeCheckout()}
                  >
                    {busy ? "Redirigiendo…" : "Continuar al pago"}
                  </Button>
                ) : null}

                {prep?.joinUrl ? (
                  <Button href={prep.joinUrl} variant="primary">
                    Entrar a teleconsulta
                  </Button>
                ) : null}

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void refresh()}
                >
                  Actualizar estado
                </Button>

                {status.clinicId ? (
                  <Button
                    href={`/portal/register?clinicId=${encodeURIComponent(status.clinicId)}&bookingToken=${encodeURIComponent(token)}`}
                    variant="secondary"
                  >
                    Crear cuenta paciente y guardar esta cita
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </Container>
      </main>
    </div>
  );
}
