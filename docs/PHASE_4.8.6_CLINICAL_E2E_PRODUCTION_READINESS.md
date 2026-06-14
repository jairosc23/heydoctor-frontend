# Phase 4.8.6 — Clinical E2E Production Readiness™

**Objetivo:** Validar flujo clínico completo P0 — especificación E2E ejecutable + pre-flight estático.

**Base:** Frontend `d525a5b6` (4.8.5) · Backend `c10e284` (sin cambios)

---

## Pregunta final

**¿Está HeyDoctor listo para activar permanentemente Clinical Action Workspace™ + Smart Clinical Workspace™ en producción?**

### Veredicto: **NO GO**

Hasta resolver blockers de pre-flight y ejecutar E2E runtime en staging.

---

## Casos P0 — resultados

| Caso | Flujo | Pre-flight estático | Runtime E2E |
|------|-------|---------------------|-------------|
| **P0-1 HTA** | Paciente → Memory → SOAP → Plan → Receta → Firma → Doc | **FAIL** | NOT EXECUTED |
| **P0-2 DM2** | Paciente → SOAP → Lab → Plan → Firma | **FAIL** | NOT EXECUTED |
| **P0-3 Aguda** | Paciente nuevo → SOAP → Documento → Cierre | **FAIL** | NOT EXECUTED |
| **P0-4 Pago** | Consulta → Firma → Pago → Lock | **FAIL** | NOT EXECUTED |

**Runtime:** Playwright spec preparada en `e2e/clinical-p0.spec.ts` — requiere staging + credenciales (ver `e2e/README.md`).

---

## Bugs / hallazgos (pre-flight código)

| ID | Severidad | Descripción |
|----|-----------|-------------|
| **F1** | Crítico | `canPay = signed \|\| completed` — pago posible antes de firma |
| **F2** | Alto | `handleSign` sin `flushNow()` autosave — pérdida borrador |
| **F3** | Alto | Receta firmada PDF habilitada pre-firma (`documentDisabled`) |
| **F4** | Alto | `/panel/consultas` legacy activo con workspace inline duplicado |
| **F5** | Alto | Flags workspace OFF por defecto — prod probablemente legacy 3-col |
| F6 | Medio | `chiefComplaint` fuera de autosave draft key |
| F7 | Medio | Close Flow no valida órdenes vía API |
| F8 | Medio | Triple superficie Rx/Lab (legacy page, right pane, sheet) |
| F9 | Medio | `openClinicalModule` no-op silencioso si flag OFF |
| F10 | Medio | `endConsultation` legacy ≠ cierre legal |
| F11 | Medio | `documentDisabled` parcial (certificado/referral sin restricción) |
| F12 | Medio | Estado `completed`: SOAP congelado pero firmable |

---

## Flags E2E

**Combinación obligatoria para P0:**

```
NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE=1
NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE=1
```

Layout: 2-col + Module Sheet + SOAP compacto (experiencia auditada 4.7–4.8.4).

Regression opcional P1: ambos OFF (legacy 3-col).

---

## Cobertura E2E

| Superficie | Cubierta P0 |
|------------|-------------|
| Autosave | ✓ |
| Clinical Memory | ✓ |
| Timeline | ✓ |
| Copilot | ✓ |
| Orders | ✓ |
| Module Sheet | ✓ |
| Firma | ✓ |
| Documentos | ✓ |
| Pago | ✓ |
| Close Flow Wizard | ✓ |

**Playwright:** config + spec listos · runtime **0/4** ejecutados en sesión 4.8.6.

---

## Riesgos operacionales

1. Sin ejecución runtime contra backend real en esta fase.
2. Pago depende Payku sandbox configurado.
3. Flags compile-time — rebuild al cambiar env.
4. Seeds HTA/DM2 requieren pacientes con memoria clínica.
5. Entradas `/panel/pacientes` → legacy `/panel/consultas` antes de redirect.

---

## Recomendaciones

1. Ejecutar `e2e/clinical-p0.spec.ts` en staging con flags ON.
2. Resolver F1–F3 antes de GO prod (fase 4.9 fixes).
3. Guard-rail o retirar workspace inline en `app/panel/consultas/page.tsx`.
4. Documentar seed UUIDs por caso en `.env.e2e`.
5. Tras E2E runtime PASS → proceder 4.9.1 activación flags prod.

---

## Archivos creados

| Archivo | Rol |
|---------|-----|
| `lib/clinical-e2e-production-readiness-audit.ts` | Auditoría + veredicto GO/NO GO |
| `lib/clinical-e2e-production-readiness-audit.test.ts` | Tests |
| `e2e/playwright.config.ts` | Config Playwright |
| `e2e/clinical-p0.spec.ts` | Spec ejecutable P0 |
| `e2e/README.md` | Guía ejecución |

---

## NO implementado

Nuevas apps, agents, analytics, IA, módulos, cambios UX, retiro flags/rollback, fixes F1–F12.
