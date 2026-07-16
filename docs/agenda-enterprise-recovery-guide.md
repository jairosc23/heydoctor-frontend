# Agenda Enterprise — Guía de recovery

## Principios

1. Preferir rollback de Frontend si el defecto es UI/agregación.  
2. Backend SSOT solo se revierte con plan de migraciones.  
3. No tocar Medical Copilot como “atajo” de recovery.  
4. No borrar datos de citas para “arreglar” slots.

## Escenarios

### A) UI Agenda rota / blank

1. Confirmar `NEXT_PUBLIC_API_URL`.  
2. Revisar errores de red en `/api/appointments` y `/api/clinic/me`.  
3. Rollback deploy FE al commit previo certificado (p.ej. F8 `384b3126` o F9 `99f694f8`).  
4. Validar tabs Calendario y Disponibilidad.

### B) Slots incorrectos / vacíos

1. Verificar rules activas y bloques.  
2. Verificar timezone clínica.  
3. Admin: doctor filter correcto.  
4. Si motor BE sospechoso: no parchear FE con lógica paralela; hotfix en `AppointmentsAvailabilityService` con tests.

### C) Timezone incorrecta

1. Admin: PATCH `/api/clinic/me` con IANA válida.  
2. Doctor: limpiar override en perfil si aplica.  
3. Invalidar cache React Query (refresh / re-login).

### D) Reminders / waitlist inconsistentes

1. Listar SSOT vía API.  
2. Corregir con PATCH/DELETE existentes.  
3. No recrear tablas.

### E) Deploy FE apuntando a BE sin migraciones

1. Revertir FE o aplicar migraciones BE.  
2. Smoke `clinic/me` + `availability/rules`.

## Contactos / ownership

| Área | Owner sugerido |
|------|----------------|
| Appointments SSOT | Backend appointments |
| Panel Agenda | Frontend agenda |
| Copilot | **No involucrar** en incidents Agenda |

## Post-mortem mínimo

- Commit FE/BE en fallo  
- Endpoint fallido  
- Scope clínica/doctor  
- Acción de recovery  
- ¿Se requiere cambio de docs F10?
