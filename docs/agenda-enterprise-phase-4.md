# Agenda Enterprise — Fase 4 certificada (Blocks)

> Branch: `feature/agenda-enterprise`  
> Medical Copilot: **no modificado**

## Auditoría de reutilización

| Capacidad | SSOT | Fase 4 |
|-----------|------|--------|
| List | `GET /appointments/blocks` | Consumido |
| Create | `POST /appointments/blocks` | Consumido |
| Delete | `DELETE /appointments/blocks/:id` | Consumido |
| Update / toggle | `PATCH /appointments/blocks/:id` | Completado (mismo recurso) |
| isActive | columna aditiva + migración | Completado SSOT |
| Slot impact | `isBlocked` ignora inactivos | Sync slots |

## Superficie FE

- Cliente blocks en `appointments-availability.ts`
- Form helpers + panel CRUD
- Invalidación React Query → availability-enterprise + schedule-blocks

## Fuera de alcance

Waitlist · Reminders · Timezone profile · calendarios externos · Dashboard
