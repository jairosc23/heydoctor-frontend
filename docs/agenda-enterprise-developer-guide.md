# Agenda Enterprise — Guía para desarrolladores

## Arquitectura (resumen)

```
app/panel/agenda/page.tsx          → orquestador queries + tabs
components/agenda/*                → paneles / calendario / dashboard
lib/agenda/*                       → view-models, forms, metrics (sin I/O)
lib/hooks/use-*                    → React Query
lib/services/appointments*.ts      → HTTP SSOT
Backend appointments + appointments-enterprise + clinic
```

**Regla de oro:** Backend = SSOT. FE no reimplementa motor de slots/rules.

## Dónde tocar qué

| Necesidad | Lugar correcto |
|-----------|----------------|
| KPI presentación | `lib/agenda/agenda-dashboard-metrics.ts` |
| Tab workspace | `lib/agenda/agenda-workspace.ts` |
| CRUD rules | `AgendaAvailabilityRulesPanel` + `appointments-availability.ts` |
| Bloques | `AgendaBlocksPanel` + `/blocks` |
| Waitlist | `AgendaWaitlistPanel` + `/waitlist` |
| Reminders | `AgendaRemindersPanel` + `/reminders*` |
| Timezone | `AgendaTimezonePanel` + `clinic.ts` / `my-doctor-profile.ts` |
| Motor slots | **Solo BE** `AppointmentsAvailabilityService` |

## React Query keys (referencia)

- `["appointments", "list", …]`  
- `["appointments", "availability-enterprise", …]`  
- `["appointments", "schedule-blocks", …]`  
- `["appointments", "waitlist", …]`  
- `["appointments", "reminder-policies", …]`  
- `["appointments", "reminders", …]`  
- `["clinic", "me", …]`  
- `["doctor-profile", "timezone", …]`

Tras mutaciones: invalidar prefijos del dominio afectado (+ availability cuando cambien rules/blocks/timezone).

## Convenciones

- TypeScript estricto; sin `any` nuevo.  
- Forms: validación en `lib/agenda/*-form.ts` + tests.  
- Paneles `"use client"`.  
- Naming: `Agenda*` componentes, `use*Query` hooks.  
- No barrels nuevos innecesarios en F10+.

## Tests

```bash
npm run lint    # tsc --noEmit
npm test
NEXT_PUBLIC_API_URL=http://localhost:3001 NEXT_PUBLIC_WS_URL=ws://localhost:3001 npm run build
```

Tests Agenda: `lib/agenda/*.test.ts`.

## Freeze Medical Copilot

Cualquier PR Agenda **no debe** modificar `medical-copilot`, AI-*, RC3–RC6, workflow clínico.

## Endpoints SSOT (relativos a `/api`)

Ver `docs/agenda-enterprise-inventory.json` → `backend.endpoints`.
