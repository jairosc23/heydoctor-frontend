/**
 * Agenda Enterprise Phase 8 — workspace navigation (presentation only).
 * No domain logic; organizes certified Phase 1–7 surfaces.
 */

export type AgendaWorkspaceTab =
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
