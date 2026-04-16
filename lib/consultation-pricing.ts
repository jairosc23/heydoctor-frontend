/**
 * Precio mostrado antes de crear consulta / en confirmación de pago.
 * Override: NEXT_PUBLIC_CONSULTATION_PRICE_CLP (entero, sin separadores).
 */

const DEFAULT_CLP = 35_000;

function parsePrice(raw: string | undefined): number {
  if (raw == null || raw.trim() === "") return DEFAULT_CLP;
  const n = Number.parseInt(raw.replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_CLP;
}

export function getConsultationPriceClp(): number {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_CONSULTATION_PRICE_CLP) {
    return parsePrice(process.env.NEXT_PUBLIC_CONSULTATION_PRICE_CLP);
  }
  return DEFAULT_CLP;
}

export function formatPriceClp(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const URGENCY_AVAILABLE_NOW = "Médicos disponibles ahora";
