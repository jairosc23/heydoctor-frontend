# Agenda Enterprise — Fase 9 certificada (Dashboard Enterprise)

> Branch: `feature/agenda-enterprise`  
> Medical Copilot: **no modificado** · Backend: **sin cambios**

## Auditoría de reutilización

| Fuente SSOT (ya certificada) | KPI dashboard |
|------------------------------|---------------|
| `useAppointmentsListQuery` | Total / próximas citas / horas ocupadas |
| `useAvailabilityEnterpriseQuery` | Slots libres / horas libres / reglas / modo |
| `useScheduleBlocksQuery` | Bloques activos |
| `useWaitlistEntriesQuery` | Espera activa |
| `useRemindersQuery` / policies | Pendientes / enviados / fallidos / políticas |
| `useResolvedClinicTimezone` | Timezone + fuente |

Sin APIs nuevas. Sin mutaciones. Agregación de presentación en `buildAgendaDashboardMetrics`.

## Componentes

- `AgendaDashboardPanel` — overview READ ONLY
- `AgendaDashboardKpiCard` — KPI tiles
- Tab `dashboard` en `AgendaWorkspaceNav`

## Fuera de alcance

Analytics · reportes · export · calendarios externos · predicciones · nuevas consultas BE
