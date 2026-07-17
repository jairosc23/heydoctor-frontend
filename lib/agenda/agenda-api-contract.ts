/**
 * F2-04 — Frontend mirror of Agenda API contract invariants.
 * Keep aligned with BE `appointments-enterprise/agenda-api-contract.ts`.
 */

export const AGENDA_INVALID_AVAILABILITY_WINDOW =
  "Invalid availability window";

export type AgendaWindow = { from: string; to: string };

/** Client-side guard before calling blocks/slots (BE still authoritative). */
export function assertClientAgendaWindow(
  window: Partial<AgendaWindow>,
): AgendaWindow {
  const from = window.from?.trim() ?? "";
  const to = window.to?.trim() ?? "";
  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (
    !from ||
    !to ||
    Number.isNaN(fromDate.getTime()) ||
    Number.isNaN(toDate.getTime()) ||
    toDate <= fromDate
  ) {
    throw new Error(AGENDA_INVALID_AVAILABILITY_WINDOW);
  }
  return { from, to };
}
