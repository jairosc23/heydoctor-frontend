"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { usePricingUpgradeExperiment } from "@/hooks/usePricingUpgradeExperiment";
import {
  GrowthTrackEvent,
  startGrowthPricingCheckout,
  trackAuthedOrPublic,
} from "@/lib/growth";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { PaymentErrorBoundary } from "@/components/payments/PaymentErrorBoundary";
import {
  PAYMENT_UNAVAILABLE_USER_MESSAGE,
  toPaymentUserMessage,
} from "@/lib/payment-user-errors";

const EXPERIMENT_KEY = "pricing_upgrade_cta";
const FONT_HEADING = "Montserrat, sans-serif";

const CTA_PRIMARY =
  "rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2 disabled:hover:bg-primary disabled:hover:scale-100";

function PricingContent() {
  const searchParams = useSearchParams();
  const paymentOk = searchParams.get("payment") === "success";
  const { variant, anonSessionId, ready } = usePricingUpgradeExperiment();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || anonSessionId.length < 12) return;
    void trackAuthedOrPublic(
      GrowthTrackEvent.VIEW_PRICING_PAGE,
      {
        experimentKey: EXPERIMENT_KEY,
        variant,
      },
      anonSessionId,
    );
  }, [ready, variant, anonSessionId]);

  const buttonText =
    variant === "A" ? "Upgrade a PRO" : "Empieza tu consulta PRO ahora";

  const handleUpgrade = async () => {
    if (!ready || anonSessionId.length < 12 || busy) return;
    setError(null);
    setBusy(true);
    try {
      await trackAuthedOrPublic(
        GrowthTrackEvent.CLICK_UPGRADE_CTA,
        { experimentKey: EXPERIMENT_KEY, variant },
        anonSessionId,
      );
      const { checkoutUrl } = await startGrowthPricingCheckout({
        plan: "pro",
        anonSessionId,
        experimentKey: EXPERIMENT_KEY,
        variant,
      });
      window.location.href = checkoutUrl;
    } catch (e) {
      setBusy(false);
      console.error("[pricing/checkout]", e);
      setError(toPaymentUserMessage(e, PAYMENT_UNAVAILABLE_USER_MESSAGE));
    }
  };

  return (
    <main className="py-8 sm:py-12">
      <Container className="max-w-lg">
        <nav
          className="mb-8 flex flex-wrap justify-between gap-3 text-sm"
          aria-label="Navegación de pricing"
        >
          <Link
            href="/"
            className="rounded font-medium text-primary no-underline hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Inicio
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 min-h-10 items-center rounded-lg border border-primary bg-hd-surface-chrome px-5 text-sm font-medium text-primary no-underline transition-colors duration-hd-base hover:bg-primaryLight focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            style={{ fontFamily: FONT_HEADING }}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/consultar"
            className="rounded font-medium text-primary no-underline hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Marketplace
          </Link>
          <Link
            href="/panel"
            className="rounded font-medium text-primaryDark/70 no-underline hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Panel
          </Link>
        </nav>

        {paymentOk ? (
          <div
            role="status"
            className="mb-6 rounded-lg border border-primary/20 bg-primaryLight px-3 py-2 text-sm text-primaryDark"
          >
            Pago recibido. Si iniciaste sesión más tarde, tu plan PRO aparecerá en el
            panel; el webhook puede tardar unos segundos.
          </div>
        ) : null}

        <h1
          className="mb-4 text-2xl font-bold text-primary"
          style={{ fontFamily: FONT_HEADING }}
        >
          Planes HeyDoctor PRO
        </h1>
        <p className="mb-6 text-sm text-primaryDark/70">
          Variante experimento «{EXPERIMENT_KEY}»: <strong className="text-primaryDark">{variant}</strong>. Pago
          seguro con Payku (sin pasar obligatoriamente por el panel).
        </p>

        <Card className="p-6 shadow-premium">
          <p
            className="mb-4 text-lg font-semibold text-primaryDark"
            style={{ fontFamily: FONT_HEADING }}
          >
            PRO · Teleconsulta y toolkit clínico
          </p>
          <p className="mb-6 text-sm text-primaryDark/70">
            Redirige a Payku para completar el cobro; vuelves a esta página al
            terminar.
          </p>

          {error ? (
            <div
              className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
              role="alert"
              data-testid="pricing-payment-error"
            >
              <p className="mb-2">{error}</p>
              <Link
                href="/consultar"
                className="font-medium text-primary no-underline hover:underline"
              >
                Continuar explorando el Marketplace
              </Link>
            </div>
          ) : null}

          <Button
            type="button"
            variant="primary"
            disabled={!ready || anonSessionId.length < 12 || busy}
            aria-describedby={!ready ? "pricing-loading" : undefined}
            className={`w-full min-h-12 ${CTA_PRIMARY}`}
            onClick={() => void handleUpgrade()}
          >
            {busy ? "Abriendo checkout…" : buttonText}
          </Button>
          {!ready ? (
            <p id="pricing-loading" className="mt-2 text-xs text-primaryDark/50">
              Preparando variante del experimento…
            </p>
          ) : null}
        </Card>
      </Container>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <p className="px-4 py-12 text-sm text-primaryDark/70">Cargando pricing…</p>
      }
    >
      <PaymentErrorBoundary continueHref="/consultar" continueLabel="Ir al Marketplace">
        <PricingContent />
      </PaymentErrorBoundary>
    </Suspense>
  );
}
