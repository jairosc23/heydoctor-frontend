# Agenda Enterprise — Fase 1 certificada

> Branch: `feature/agenda-enterprise`  
> Scope: **Disponibilidad enterprise** (frontend consume SSOT backend)  
> Medical Copilot: **no modificado**

## Reutilización (sin duplicar)

| Capacidad | SSOT backend | Cliente FE |
|-----------|--------------|------------|
| Rules list | `GET /appointments/availability/rules` | `fetchAvailabilityRules` |
| Free slots | `GET /appointments/availability/slots` | `fetchAvailabilitySlots` |
| Bookable window | `AppointmentsAvailabilityService.assertBookableWindow` | (ya usado al crear citas en BE) |

No se crearon endpoints nuevos ni una segunda agenda.

## Entregables Fase 1

- `lib/services/appointments-availability.ts` — cliente SSOT
- `lib/agenda/availability-summary.ts` (+ tests)
- `lib/hooks/use-availability-enterprise.ts`
- `components/agenda/AgendaAvailabilityPanel.tsx`
- Integración en `app/panel/agenda/page.tsx`

## Fuera de alcance (fases siguientes)

- F2 Rules CRUD UI
- F3 Slots picker en booking
- F4 Blocks
- F5 Waitlist
- F6 Reminders
- F7 Timezone clinic profile
- F8 UX enterprise ampliada
- F9 Dashboard operativo
- F10 QA técnica completa

## Compatibilidad

- Calendario de citas existente intacto
- Admin sin `doctorId`: panel informativo (sin llamadas inválidas)
- Month view: query de slots acotada a ~1 semana para payload
