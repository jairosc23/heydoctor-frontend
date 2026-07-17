/**
 * Agenda Enterprise Phase 8–9 — workspace navigation (presentation only).
 * Organizes certified Phase 1–7 surfaces + read-only dashboard.
 */

export type AgendaWorkspaceTab =
  | "dashboard"
  | "calendar"
  | "availability"
  | "operations"
  | "settings";

export const AGENDA_WORKSPACE_TABS: {
  id: AgendaWorkspaceTab;
  label: string;
  description: string;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    description: "KPIs ejecutivos de solo lectura",
  },
  {
    id: "calendar",
    label: "Calendario",
    description: "Vista de citas y navegación temporal",
  },
  {
    id: "availability",
    label: "Disponibilidad",
    description: "Resumen, reglas y slots",
  },
  {
    id: "operations",
    label: "Operaciones",
    description: "Bloques, lista de espera y recordatorios",
  },
  {
    id: "settings",
    label: "Zona horaria",
    description: "IANA clínica, profesional y preview",
  },
];

export function isAgendaWorkspaceTab(
  value: string,
): value is AgendaWorkspaceTab {
  return AGENDA_WORKSPACE_TABS.some((t) => t.id === value);
}
