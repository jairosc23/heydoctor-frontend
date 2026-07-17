# HeyDoctor Enterprise — Production Promotion Runbook

> Promoción **después** del merge unificado (Fases 1–3 del merge runbook).  
> **NO ejecutar** sin autorización explícita de deploy.

---

## Prerrequisitos

- [ ] Fases 1–2 merge completadas y pusheadas en `release/medical-copilot-v1.0-rc2`  
- [ ] Fase 3 QA integrada PASS  
- [ ] (Recomendado) Fase 4 merge a `main` si la política de prod exige `main`  
- [ ] Acceso Railway + Vercel + secrets  
- [ ] Ventana de mantenimiento comunicada (si aplica)

---

## FASE 5 — Railway (Backend)

### 5.1 Pre-deploy

1. Confirmar tip a desplegar (SHA).  
2. Backup/snapshot DB según ops.  
3. Listar migraciones pendientes esperadas:

```
1751300000000-MedicalCopilotFoundation
1752600000000-ScheduleBlocksIsActive
1752700000000-WaitlistPriorityReason
1752800000000-ReminderPoliciesAndOffset
1752900000000-ClinicAndDoctorTimezone
```

(Omitir las ya aplicadas en el entorno target.)

### 5.2 Deploy

1. Trigger deploy Railway del servicio API (branch/commit autorizado).  
2. Esperar build healthy.  
3. Ejecutar/verificar migraciones (mecanismo del proyecto: TypeORM migrate / release command).  
4. Confirmar proceso de migración sin error.

### 5.3 Health

- [ ] Health endpoint OK  
- [ ] Logs sin crash loop  
- [ ] Redis/throttler: degradación documentada aceptable si fail-open  
- [ ] JWT login smoke  

### 5.4 Smoke API (mínimo)

| Check | Esperado |
|-------|----------|
| `GET /api/clinic/me` (auth) | 200 + timezone |
| `GET /api/appointments/availability/rules` | 200 |
| `GET /api/appointments` | 200 |
| `POST /api/medical-copilot/session` (o facade documentada) | 200 / contrato RC2 |
| CSRF en mutación | rechazo sin token; OK con token |

### 5.5 Rollback Railway

Redeploy del deployment anterior en Railway.  
No bajar migraciones aditivas sin plan DBA.

---

## FASE 6 — Vercel Preview (Frontend)

### 6.1 Variables Preview

| Variable | Notas |
|----------|-------|
| `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_HEYDOCTOR_API_URL` | API del entorno bajo prueba |
| `NEXT_PUBLIC_WS_URL` | WS alineado |
| `NEXT_PUBLIC_MEDICAL_COPILOT` | `1` o unset para ON; `0` para off |

### 6.2 Smoke Preview

- [ ] Login  
- [ ] `/panel/agenda` — tabs dashboard/calendario/disponibilidad/operaciones/ajustes  
- [ ] `/panel/consultas/[id]/medical-copilot` — shell + kill switch  
- [ ] Crear/editar cita (staging)  
- [ ] Timezone panel visible  

### 6.3 Feature flags

| Flag | Uso |
|------|-----|
| Copilot kill switch (localStorage) | Incidentes UI AI |
| `NEXT_PUBLIC_MEDICAL_COPILOT=0` | Apagar UI Copilot sin redeploy BE |
| Agenda | Sin flag dedicado — rollback FE si hace falta |

### 6.4 Criterio de salida Preview

PASS smoke + sin P0 → candidato a Production.

---

## FASE 7 — Production

### 7.1 Orden

1. Backend prod estable (Fase 5 sobre target prod).  
2. Promover Frontend Vercel Production al mismo contrato API.  
3. Smoke producción (datos reales / clínica piloto).  
4. Activar monitoreo (Sentry, Railway metrics, Vercel).

### 7.2 Smoke Production (abreviado)

- Login doctor + admin  
- Agenda: ver slots del día  
- Copilot: abrir sesión en consulta de prueba  
- Una mutación CSRF (p.ej. update menor no destructivo en staging-like clinic si aplica)

### 7.3 Abort promote

Si smoke P0:  
1. Revert Vercel a deployment previo.  
2. Si BE es causa: redeploy Railway previo.  
3. Activar kill switch Copilot si el fallo es solo AI UI.

---

## Comunicación

| Momento | Mensaje |
|---------|---------|
| Inicio promote | “Promoción Enterprise Copilot+Agenda iniciada” |
| Backend live | “API tip SHA … migraciones OK” |
| FE prod live | “Frontend Production tip SHA …” |
| Abort | “Rollback ejecutado; causa …” |
