"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchCurrentUser } from "@/lib/services/auth-session";
import { BrandLogo } from "@/components/branding";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const FONT_HEADING = "Montserrat, sans-serif";

const CTA_PRIMARY =
  "rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2";

type SyncState = "syncing" | "ready" | "pending" | "error";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function PaymentSuccessPage() {
  const [state, setState] = useState<SyncState>("syncing");
  const { refreshUser } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function syncPlan() {
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const me = await fetchCurrentUser();

          if (cancelled) return;

          await refreshUser();

          if (me.plan === "pro") {
            setState("ready");
            return;
          }
        } catch {
          if (cancelled) return;
        }

        if (attempt < MAX_RETRIES - 1) {
          await sleep(RETRY_DELAY_MS);
          if (cancelled) return;
        }
      }

      if (!cancelled) {
        setState("pending");
      }
    }

    syncPlan();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  if (state === "syncing") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hd-surface-base px-4 py-12">
        <div className="text-center">
          <div
            className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-[3px] border-hd-border-default border-t-primary"
            aria-hidden
          />
          <p
            className="text-lg font-semibold text-primaryMid"
            style={{ fontFamily: FONT_HEADING }}
          >
            Activando PRO…
          </p>
          <p className="mt-2 text-sm text-primaryDark/70">Confirmando tu pago</p>
        </div>
      </div>
    );
  }

  if (state === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hd-surface-base px-4 py-12">
        <Card className="w-full max-w-md text-center shadow-premium">
          <BrandLogo markOnly markSize={72} priority className="mx-auto mb-6" />
          <div className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primaryLight text-primary">
            <Clock className="h-9 w-9" strokeWidth={1.75} aria-hidden />
          </div>
          <h1
            className="mb-3 text-2xl font-bold text-primaryDark"
            style={{ fontFamily: FONT_HEADING }}
          >
            Pago en proceso
          </h1>
          <p className="mb-6 text-[15px] leading-relaxed text-primaryDark/70">
            Tu pago fue recibido pero la activación del plan PRO puede tardar
            unos minutos. Si no se activa en los próximos 10 minutos, contacta
            soporte.
          </p>
          <Button href="/dashboard" variant="primary" className={`w-full min-h-12 ${CTA_PRIMARY}`}>
            Ir al Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hd-surface-base px-4 py-12">
      <Card className="w-full max-w-md text-center shadow-premium">
        <BrandLogo markOnly markSize={72} priority className="mx-auto mb-6" />
        <div
          className="mx-auto mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primaryLight text-4xl font-bold text-primary"
          aria-hidden
        >
          ✓
        </div>
        <h1
          className="mb-3 text-[28px] font-bold text-primaryMid"
          style={{ fontFamily: FONT_HEADING }}
        >
          PRO Activado
        </h1>
        <p className="mb-2 text-base leading-relaxed text-primaryDark/70">
          Tu cuenta ahora tiene acceso completo a:
        </p>
        <ul className="mx-auto mb-8 max-w-[300px] list-none p-0">
          {[
            "Asistente IA Clínico",
            "Videollamadas integradas",
            "Dashboard analítico",
            "Exportación legal",
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 border-b border-hd-border-subtle py-2 text-[15px] text-primaryDark"
            >
              <span className="font-bold text-primary" aria-hidden>
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
        <Button href="/dashboard" variant="primary" className={`w-full min-h-12 ${CTA_PRIMARY}`}>
          Ir al Dashboard
        </Button>
      </Card>
    </div>
  );
}
