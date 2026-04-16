"use client";

import { useEffect, useState } from "react";
import { getApiBase } from "@/lib/api-base";
import { DEFAULT_CONSULTATION_PRICE_CLP } from "@/lib/consultation-pricing";

export type ConsultationPriceState = {
  amount: number;
  currency: string;
  loading: boolean;
  error: string | null;
};

/**
 * Precio de consulta desde el mismo origen que Payku (`GET /api/payments/consultation-price`).
 */
export function useConsultationPrice(): ConsultationPriceState {
  const [state, setState] = useState<ConsultationPriceState>({
    amount: DEFAULT_CONSULTATION_PRICE_CLP,
    currency: "CLP",
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    const base = getApiBase().replace(/\/$/, "");
    const url = `${base}/payments/consultation-price`;

    void (async () => {
      try {
        const res = await fetch(url, {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          throw new Error(`No se pudo cargar el precio (${res.status})`);
        }
        const data = (await res.json()) as {
          amount?: unknown;
          currency?: unknown;
        };
        const amount = Number(data.amount);
        const currency =
          typeof data.currency === "string" && data.currency.length > 0
            ? data.currency
            : "CLP";
        if (!Number.isFinite(amount) || amount <= 0) {
          throw new Error("Respuesta de precio inválida");
        }
        if (!cancelled) {
          setState({
            amount: Math.round(amount),
            currency,
            loading: false,
            error: null,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            amount: DEFAULT_CONSULTATION_PRICE_CLP,
            currency: "CLP",
            loading: false,
            error: e instanceof Error ? e.message : "Error al cargar precio",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
