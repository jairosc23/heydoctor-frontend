# Agenda Enterprise — Fase 7 certificada (Timezone)

> Branch: `feature/agenda-enterprise`  
> Medical Copilot: **no modificado**

## Auditoría de reutilización

| Capacidad | SSOT | Fase 7 |
|-----------|------|--------|
| Snapshots `clinicTimezone` / `patientTimezone` en citas | Sí | Consumidos |
| Slots/rules engine con `@IsTimeZone` | Sí | Alimentados desde SSOT clínica |
| `date-fns-tz` / Intl DST | Sí | Preview + forms |
| `clinics.timezone` | — | Columna + GET/PATCH `/clinic/me` |
| Doctor override | — | `doctor_profiles.timezone` vía `/doctor-profile/me` |

## Superficie FE

- `useResolvedClinicTimezone` reemplaza browser como fuente primaria
- `AgendaTimezonePanel`: clínica, profesional, paciente (desde citas), preview DST
- Invalidación React Query → availability / slots / blocks / waitlist / reminders

## Fuera de alcance

Google Calendar · Outlook · ICS · Dashboard · Analytics
