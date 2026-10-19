# HeyDoctor Enterprise — Smoke Test Checklist

> Usar en **Fase 3** (post-merge RC2) y de nuevo en Preview/Production.  
> Entorno: staging preferido. Marcar PASS / FAIL / N/A.

---

## Preflight

| # | Check | Resultado |
|---|-------|-----------|
| P0 | Tip unificado BE+FE desplegado o local contra API correcta | |
| P1 | Usuario DOCTOR de prueba | |
| P2 | Usuario ADMIN de prueba | |
| P3 | Consulta de prueba existente | |
| P4 | Clínica con timezone IANA | |

---

## Auth / seguridad

| # | Check | Resultado |
|---|-------|-----------|
| A1 | Login JWT OK | |
| A2 | Ruta `/panel` protegida sin sesión | |
| A3 | Mutación sin CSRF rechazada | |
| A4 | Mutación con CSRF OK | |
| A5 | Doctor no ve datos de otra clínica | |

---

## Medical Copilot

| # | Check | Resultado |
|---|-------|-----------|
| C1 | Abrir `/panel/consultas/[id]/medical-copilot` | |
| C2 | Shell activo visible | |
| C3 | Kill switch deshabilita Copilot y preserva enlace a consulta | |
| C4 | Session ownership restaura mismo `sessionId` (reload) | |
| C5 | Auth recovery no ejecuta acciones clínicas indebidas | |
| C6 | Playwright `chromium-desktop-medical-copilot-rc2` (si `.env.e2e`) | |

---

## Agenda Enterprise

| # | Check | Resultado |
|---|-------|-----------|
| G1 | `/panel/agenda` carga | |
| G2 | Tab Dashboard KPIs / empty states sin crash | |
| G3 | Calendario día/semana/mes | |
| G4 | Availability summary + rules list | |
| G5 | Admin: selector doctor requerido para availability | |
| G6 | Slots libres visibles con rules activas | |
| G7 | Blocks: listar / crear (staging) / ver impacto slots | |
| G8 | Waitlist: listar / crear entrada | |
| G9 | Reminders: policies + instances list | |
| G10 | Timezone: ver clínica; admin puede editar (staging) | |
| G11 | Refresh no rompe workspace tabs | |

---

## Integración cruzada

| # | Check | Resultado |
|---|-------|-----------|
| X1 | Abrir Agenda y Copilot en la misma sesión sin contaminación | |
| X2 | Kill switch Copilot no oculta Agenda | |
| X3 | Logout limpia acceso a ambos | |

---

## Criterio

- Cualquier **FAIL en A\*** o **C1–C3** o **G1–G2** = **P0** → no promover.  
- FAIL en G7–G10 = P1 → documentar waiver o fix antes de prod.
