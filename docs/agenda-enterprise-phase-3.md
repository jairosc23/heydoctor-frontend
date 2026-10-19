# Agenda Enterprise — Fase 3 certificada (Slots)

> Branch: `feature/agenda-enterprise`  
> Medical Copilot: **no modificado**

## Auditoría de reutilización

| Capacidad | SSOT | Acción Fase 3 |
|-----------|------|---------------|
| Slots libres | `GET /appointments/availability/slots` | Consumido (sin endpoint nuevo) |
| Slot engine | `listAvailableSlots` (rules + blocks + conflicts) | Reutilizado |
| Slots ocupados | Citas activas `GET /appointments` | Derivados en FE (view-model) |
| Sync rules | Invalidación React Query F2 | Heredada |
| Clínica | `ClinicGuard` + `user.clinicId` | Filtro tenant implícito / badge |

No se creó segunda agenda ni modelos duplicados. **Backend sin cambios** en esta fase.

## Superficie FE

- `lib/agenda/slots-view-model.ts` — lógica de presentación (libre/ocupado, día, horas)
- `components/agenda/AgendaSlotsPanel.tsx`
- Filtro profesional (admin) + duración de slot → query SSOT
- Navegación día/semana/mes de la agenda alimenta el rango de slots
- Click slot libre → nueva cita; ocupado → editar cita

## Fuera de alcance

Blocks · Waitlist · Reminders · Timezone clinic profile · calendarios externos
