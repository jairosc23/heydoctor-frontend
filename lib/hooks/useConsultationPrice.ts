"use client";

import { useEffect, useState } from "react";
import { ApiError, heydoctorApi } from "@/lib/heydoctor-api";
import { DEFAULT_CONSULTATION_PRICE_CLP } from "@/lib/consultation-pricing";

export type ConsultationPriceState = {
  amount: number;
  currency: string;
  loading: boolean;
  error: string | null;
};

/**
 * Precio vía proxy Next → Nest GET /api/consultations/consultation-price (Bearer reenviado).
 * Contrato Nest: { amountClp, currency: 'CLP', source: 'config' | 'default' }.
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
        const data = await heydoctorApi.get<{
          amountClp?: unknown;
          amount?: unknown;
          currency?: unknown;
        }>("/consultations/consultation-price", { requireAuth: false });
        const raw = data.amountClp ?? data.amount;
        const amount = Number(raw);
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
          const msg =
            e instanceof ApiError
              ? e.message
              : e instanceof Error
                ? e.message
                : "Error al cargar precio";
          setState({
            amount: DEFAULT_CONSULTATION_PRICE_CLP,
            currency: "CLP",
            loading: false,
            error: msg,
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
