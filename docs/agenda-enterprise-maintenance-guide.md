# Agenda Enterprise — Guía de mantenimiento

## Cadencia sugerida

| Frecuencia | Actividad |
|------------|-----------|
| Semanal | Smoke staging: crear cita, rule, block, waitlist entry |
| Mensual | Revisar políticas de reminder huérfanas / bloques vencidos |
| Por release | Re-ejecutar gates FE + checklist certification JSON |
| Ad hoc | Actualizar IANA si clínica cambia sede/país |

## Mantenimiento de código (dev)

- Preferir extender paneles existentes; **no** duplicar clientes API.  
- Invalidaciones React Query por prefijo de dominio (`appointments`, `waitlist`, etc.).  
- Tests unitarios en `lib/agenda/*.test.ts` ante cambios de view-model.  
- Documentar nuevas fases en `docs/agenda-enterprise-phase-N.md` si el producto las autoriza.

## Deuda conocida (no urgente)

1. Ocupación de slots derivada en FE (F3) — monitorear desfaces.  
2. Reminders sin canal de envío real.  
3. `fetchClinicMe` deprecated fuera de Agenda — no reintroducir en Agenda.  
4. Documentación de fases vive en repo FE (BE sin phase docs).

## Prohibiciones de mantenimiento

- No agregar analytics/export/ICS/Google/Outlook sin fase de producto.  
- No conectar IA / Copilot a Agenda.  
- No crear tablas/endpoints “para el dashboard”.  
- No modificar RC3–RC6 / Enterprise Engines clínicos.

## Limpieza segura

- Entradas waitlist `cancelled` / fulfilled: DELETE vía API.  
- Bloques inactivos: soft via `isActive` o DELETE según política clínica.  
- Policies reminder: DELETE si doctor sale del roster.
