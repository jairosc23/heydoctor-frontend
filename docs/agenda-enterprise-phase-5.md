# Agenda Enterprise — Fase 5 certificada (Waitlist)

> Branch: `feature/agenda-enterprise`  
> Medical Copilot: **no modificado**

## Auditoría de reutilización

| Capacidad | SSOT | Fase 5 |
|-----------|------|--------|
| Entity `appointment_waitlist_entries` | Sí | Reutilizada + `priority` / `reason` aditivos |
| Create | `POST /appointments/waitlist` | Consumido |
| List | — | Completado `GET` mismo recurso |
| Update / toggle | — | Completado `PATCH` (`priority`, `reason`, `status`) |
| Delete | — | Completado `DELETE` |
| Promoción al cancelar cita | Sí (FIFO) | Orden por `priority` + `created_at` |
| Matching slots | Availability engine | `matchingSlotAvailable` en listado |

## Superficie FE

- Cliente waitlist en `appointments.ts`
- Form helpers + panel CRUD
- Invalidación React Query → waitlist + availability-enterprise + appointments/list
- Rules/Blocks también invalidan waitlist (huecos cambian)

## Fuera de alcance

Reminders · Timezone profile · calendarios externos · Dashboard · Analytics
