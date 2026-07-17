# Agenda Enterprise — Fase 2 certificada (Rules)

> Branch: `feature/agenda-enterprise`  
> Medical Copilot: **no modificado**

## Diseño técnico

- Entidad SSOT: `DoctorAvailabilityRule`
- Servicio: `AppointmentsAvailabilityService`
- Superficie HTTP bajo `/appointments/availability/rules`
- FE: panel de reglas + formulario + mutaciones React Query con invalidación de disponibilidad (Fase 1)

## Contratos

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/appointments/availability/rules` | Listar (activas + inactivas) |
| POST | `/appointments/availability/rules` | Crear |
| PATCH | `/appointments/availability/rules/:ruleId` | Editar / activar-desactivar |
| DELETE | `/appointments/availability/rules/:ruleId` | Eliminar |

`PATCH`/`DELETE` completan el mismo recurso SSOT (no API paralela). El listado incluye reglas inactivas para poder reactivarlas.

## Reutilización

- Auth / roles existentes
- `collectClinicDoctorOptions` (admin)
- Panel Button UI
- Invalidación de query `availability-enterprise` (Fase 1)

## Fuera de alcance

Fase 3 Slots picker · F4 Blocks · F5 Waitlist · etc.
