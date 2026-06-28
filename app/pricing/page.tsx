'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { fetchWithAuth, getApiBase } from '../../lib/heydoctor-api';

const EXPERIMENT_KEY = 'pricing_upgrade_cta';

const GrowthTrackEvent = {
  VIEW_PRICING_PAGE: 'VIEW_PRICING_PAGE',
  CLICK_UPGRADE_CTA: 'CLICK_UPGRADE_CTA',
} as const;

function getGrowthAnonSessionId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'heyd_growth_anon_v1';
  try {
    let value = window.localStorage.getItem(key);
    if (!value || value.length < 12) {
      value =
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
      window.localStorage.setItem(key, value);
    }
    return value;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
  }
}

async function fetchExperimentPreview(
  experimentKey: string,
  anonId: string,
): Promise<{ variant: string | null }> {
  const query = new URLSearchParams({
    key: experimentKey,
    anonId,
  });
  const response = await fetchWithAuth(`/growth/experiment-preview?${query}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`experiment-preview HTTP ${response.status}`);
  }
  return (await response.json()) as { variant: string | null };
}

async function fetchGrowthContextMaybeAuthed(): Promise<{
  experiments: Record<string, string | null>;
} | null> {
  const response = await fetch(`${getApiBase()}/growth/context`, {
    method: 'GET',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;
  return (await response.json()) as { experiments: Record<string, string | null> };
}

async function trackAuthedOrPublic(
  eventName: string,
  baseProps: Record<string, unknown>,
  anonSessionId: string,
): Promise<void> {
  const authed = await fetch(`${getApiBase()}/growth/events`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventName, properties: baseProps }),
  });
  if (authed.ok) return;

  await fetchWithAuth(`/growth/events-public`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName,
      properties: {
        ...baseProps,
        anonSessionId,
      },
    }),
  }).catch(() => undefined);
}

async function startGrowthPricingCheckout(body: {
  plan: 'pro';
  anonSessionId: string;
  experimentKey?: string;
  variant?: string;
}): Promise<{ checkoutUrl: string; paymentId: string }> {
  const response = await fetchWithAuth(`/growth/start-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`start-checkout HTTP ${response.status}: ${text.slice(0, 200)}`);
  }
  return (await response.json()) as { checkoutUrl: string; paymentId: string };
}

function usePricingUpgradeExperiment(): {
  variant: string;
  anonSessionId: string;
  ready: boolean;
} {
  const [variant, setVariant] = useState('A');
  const [anonSessionId, setAnonSessionId] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAnonSessionId(getGrowthAnonSessionId());
  }, []);

  useEffect(() => {
    if (!anonSessionId || anonSessionId.length < 12) return;
    let cancelled = false;
    (async () => {
      try {
        const context = await fetchGrowthContextMaybeAuthed();
        if (context) {
          const value =
            (context.experiments[EXPERIMENT_KEY] ?? 'A').trim() || 'A';
          if (!cancelled) setVariant(value);
        } else {
          const result = await fetchExperimentPreview(EXPERIMENT_KEY, anonSessionId);
          const value = (result.variant ?? 'A').trim() || 'A';
          if (!cancelled) setVariant(value);
        }
      } catch {
        if (!cancelled) setVariant('A');
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [anonSessionId]);

  return { variant, anonSessionId, ready };
}

function PricingContent() {
  const searchParams = useSearchParams();
  const paymentOk = searchParams.get('payment') === 'success';
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
    variant === 'A' ? 'Upgrade a PRO' : 'Empieza tu consulta PRO ahora';

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
        plan: 'pro',
        anonSessionId,
        experimentKey: EXPERIMENT_KEY,
        variant,
      });
      window.location.href = checkoutUrl;
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error ? e.message : 'No se pudo iniciar el pago');
    }
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <nav className="mb-8 flex flex-wrap justify-between gap-3 text-sm" aria-label="Navegación de pricing">
        <Link href="/" className="rounded text-slate-600 underline hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
          Inicio
        </Link>
        <Link href="/login" className="rounded text-slate-600 underline hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
          Iniciar sesión
        </Link>
        <Link href="/panel" className="rounded text-slate-600 underline hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
          Panel
        </Link>
      </nav>

      {paymentOk && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950"
        >
          Pago recibido. Si iniciaste sesión más tarde, tu plan PRO aparecerá en el panel; el
          webhook puede tardar unos segundos.
        </div>
      )}

      <h1 className="mb-4 text-xl font-semibold text-slate-900">Planes HeyDoctor PRO</h1>
      <p className="mb-6 text-sm text-slate-600">
        Variante experimento «{EXPERIMENT_KEY}»: <strong>{variant}</strong>. Pago seguro con Payku
        (sin pasar obligatoriamente por el panel).
      </p>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-4 text-lg font-medium text-slate-800">PRO · Teleconsulta y toolkit clínico</p>
        <p className="mb-6 text-sm text-slate-600">
          Redirige a Payku para completar el cobro; vuelves a esta página al terminar.
        </p>

        {error && (
          <p className="mb-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={!ready || anonSessionId.length < 12 || busy}
          aria-describedby={!ready ? 'pricing-loading' : undefined}
          className="w-full rounded-lg bg-slate-800 px-4 py-3 text-center font-medium text-white hover:bg-slate-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          onClick={() => void handleUpgrade()}
        >
          {busy ? 'Abriendo checkout…' : buttonText}
        </button>
        {!ready && (
          <p id="pricing-loading" className="mt-2 text-xs text-slate-500">Preparando variante del experimento…</p>
        )}
      </div>
    </main>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<p className="px-4 py-12 text-sm text-slate-600">Cargando pricing…</p>}>
      <PricingContent />
    </Suspense>
  );
}
