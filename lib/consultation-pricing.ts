/**
 * Formato de precio. El monto autoritativo viene del API:
 * GET /api/payments/consultation-price
 */

/** Fallback si el API no responde (alineado con backend `DEFAULT_CONSULTATION_AMOUNT_CLP`). */
export const DEFAULT_CONSULTATION_PRICE_CLP = 15_000;

export const URGENCY_AVAILABLE_NOW = "Médicos disponibles ahora";

export function formatConsultationPrice(
  amount: number,
  currency: string = "CLP",
): string {
  const code = /^[A-Z]{3}$/i.test(currency) ? currency.toUpperCase() : "CLP";
  try {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${code}`;
  }
}

/** @deprecated Usar {@link formatConsultationPrice}(amount, 'CLP') */
export function formatPriceClp(amount: number): string {
  return formatConsultationPrice(amount, "CLP");
}
