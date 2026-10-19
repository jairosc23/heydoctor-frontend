# HeyDoctor Enterprise — Post-Deploy / Post Go-Live Validation

> Ejecutar tras Fases 5–7 (Railway + Vercel). Ventana de observación: **24–72 horas**.

---

## T+0 (inmediato, 0–30 min)

| # | Check | OK |
|---|-------|----|
| D1 | Railway service running / no crash loop | |
| D2 | Health endpoint OK | |
| D3 | Vercel Production 200 en `/login` y `/panel` (auth) | |
| D4 | Login doctor OK | |
| D5 | Agenda carga | |
| D6 | Copilot abre en consulta de prueba | |
| D7 | Sentry/error tracker sin spike P0 | |
| D8 | CSRF mutación smoke | |

---

## Seguridad (T+0 / T+1h)

| # | Check | OK |
|---|-------|----|
| S1 | JWT emit/refresh normal | |
| S2 | RBAC doctor vs admin (timezone clínica solo admin) | |
| S3 | Clinic scope: no leak cross-tenant | |
| S4 | Doctor scope Agenda: no editar agenda ajena | |
| S5 | CSRF enforced en mutaciones | |

---

## Medical Copilot

| # | Check | OK |
|---|-------|----|
| M1 | Session create OK | |
| M2 | Kill switch operativo | |
| M3 | Ownership tras reload | |
| M4 | Sin auto-persistencia indebida a EMR | |
| M5 | Multi-réplica: sticky/session nota (si >1 replica) | |

---

## Agenda Enterprise

| # | Check | OK |
|---|-------|----|
| E1 | Availability rules/slots | |
| E2 | Blocks activos afectan slots | |
| E3 | Waitlist CRUD | |
| E4 | Reminders policies/instances (sin exigir envío real) | |
| E5 | Timezone clínica correcta en UI | |
| E6 | Dashboard KPIs coherentes con paneles | |
| E7 | Persistence citas: create/transition OK | |

---

## Performance / estabilidad (T+24h)

| # | Check | OK |
|---|-------|----|
| P1 | p95 API Agenda aceptable vs baseline | |
| P2 | Sin crecimiento anómalo de errores 5xx | |
| P3 | FE bundle/route `/panel/agenda` usable | |
| P4 | Copilot bootstrap latency aceptable | |
| P5 | Logs sin thrash Redis/throttler crítico | |

---

## Criterio de cierre go-live

- Todos los checks T+0 PASS.  
- Sin P0 abiertos a T+24h.  
- P1 documentados con owner.  

Si P0: ejecutar `enterprise-rollback-runbook.md` y marcar go-live **NO GO**.
