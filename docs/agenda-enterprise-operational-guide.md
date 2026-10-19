# Agenda Enterprise — Guía operacional

## Audiencia

Ops / support / clínica admin que opera Agenda en panel.

## Acceso

Ruta: `/panel/agenda`  
Roles: Doctor, Admin (JWT).  
Scope: siempre limitado a la clínica del usuario.

## Workspace (tabs)

| Tab | Uso operacional |
|-----|-----------------|
| Dashboard | Vista ejecutiva READ ONLY (KPIs del día/ventana cargada) |
| Calendario | Citas día/semana/mes; crear/editar/transicionar |
| Disponibilidad | Resumen, reglas, slots |
| Operaciones | Bloques, lista de espera, recordatorios |
| Ajustes | Timezone clínica (admin) / override doctor |

## Flujos diarios

1. **Abrir agenda** → verificar timezone en Dashboard/Ajustes.  
2. **Revisar disponibilidad** → rules activas + slots libres.  
3. **Gestionar bloques** → feriados / no atención.  
4. **Atender waitlist** → cuando haya huecos.  
5. **Revisar reminders** → políticas e instancias (estado SSOT).  
6. **Dashboard** → health label y conteos; no ejecuta acciones.

## Alcances

- **Doctor:** opera su agenda; no cambia timezone de clínica.  
- **Admin:** puede filtrar por doctor; PATCH timezone clínica.

## Incidentes frecuentes

| Síntoma | Chequeo |
|---------|---------|
| Sin slots | Rules activas, bloques, timezone, doctor seleccionado (admin) |
| KPIs en cero | Ventana de fechas / doctor filter / loading error |
| Waitlist vacía inesperada | Filtros from/to y doctorId |
| Horas “raras” | Timezone clínica vs override doctor |

## Qué no hacer

- No inventar citas fuera del SSOT.  
- No pedir a ingeniería “endpoints nuevos” para KPIs (Dashboard reutiliza datos).  
- No mezclar cambios de Medical Copilot con hotfixes de Agenda.
