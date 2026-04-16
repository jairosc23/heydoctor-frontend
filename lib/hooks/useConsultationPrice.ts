"use client";

import { useEffect, useState } from "react";
import { DEFAULT_CONSULTATION_PRICE_CLP } from "@/lib/consultation-pricing";

export type ConsultationPriceState = {
  amount: number;
  currency: string;
  loading: boolean;
  error: string | null;
};

/**
 * Precio vía ruta Next `/api/consultation-price` (ISR 60s → mismo contrato que Nest).
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

    void (async () => {
      try {
        const res = await fetch("/api/consultation-price", {
          method: "GET",
          headers: { Accept: "application/json" },
          next: { revalidate: 60 },
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
