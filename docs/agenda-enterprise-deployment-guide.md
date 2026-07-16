# Agenda Enterprise — Guía de deployment

> Esta guía **documenta** el proceso. Fase 10 **no ejecuta** deploy.

## Orden recomendado

1. Confirmar branch `feature/agenda-enterprise` (o release branch post-merge).  
2. Backend: aplicar migraciones pendientes (timezone, reminders, waitlist, blocks).  
3. Deploy Backend `heydoctor-backend-pro` (HEAD certificado Agenda: `82841419` o posterior merge).  
4. Deploy Frontend `heydoctor-frontend` (HEAD con F9+F10 docs).  
5. Smoke staging: `/panel/agenda` tabs Dashboard → Calendario → Disponibilidad → Operaciones → Ajustes.  
6. Solo entonces promoción a producción con checklist GO.

## Variables FE

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_API_URL` | Base API (sin hardcode SSOT) |
| `NEXT_PUBLIC_WS_URL` | WebSocket (panel general) |

No hay feature flags dedicados Agenda Enterprise F1–9 (superficie siempre en `/panel/agenda`).

## Backend

- Prefijo global `/api`.  
- Endpoints bajo `/api/appointments/*`, `/api/clinic/me`, `/api/doctor-profile/me`.  
- JWT + RolesGuard DOCTOR|ADMIN (excepto confirm/cancel token).

## Verificación post-deploy

| Check | Esperado |
|-------|----------|
| `GET /api/clinic/me` | timezone IANA |
| `GET /api/appointments/availability/rules` | 200 / lista |
| `GET /api/appointments/availability/slots` | 200 / slots |
| UI Dashboard | KPIs numéricos o empty states, sin crash |
| Medical Copilot | Intacta (smoke path consultas) |

## Rollback

Ver `agenda-enterprise-recovery-guide.md`.  
Rollback FE independiente posible si BE ya tiene migraciones (FE solo consume).  
Rollback BE: restaurar release anterior **solo** si migraciones son backward-compatible; timezone columns son aditivas.
