# Product Platform — roadmap gap analysis

**Type:** product roadmap review (not an Epic)  
**Date:** 2026-08-25  
**Scope:** Core Platform CERTIFIED + Product Platform **v6.0** CERTIFIED  
**Status:** freeze of product Epics until explicit authorization  

This document does not change Core Platform, Architecture Baseline, RC-19A, Clinical Completion, Commercial Settlement, Clinical Operations Projection, Patient Care Continuity, Auth, Workspace, Foundation, Branding, WebRTC, the legacy patient portal, or Product Platform v1.0–v6.0.

Does not authorize design or implementation. Does not open Epic 8 or any later Epic.

---

## Registro — Epic 7

| Campo | Valor |
|-------|--------|
| Epic | 7 — Intelligent Patient Follow-up |
| Análisis | `docs/EPIC_7_INTELLIGENT_PATIENT_FOLLOW_UP_FUNCTIONAL_ANALYSIS.md` |
| Decisión | **REJECTED BY ARCHITECTURE** |
| Naturaleza | No es un fallo. Es una decisión de arquitectura. |

Conclusión aceptada:

- No existe un vacío funcional certificable para “seguimiento inteligente”.
- Las capacidades certificadas ya cubren el caso de uso (v6.0 consulta del Encounter entregado; v3.0 continuidad entre Encounters; v4.0 arranque de la próxima visita).
- Crear el Epic introduciría un dominio o workflow nuevo sin justificación.

El Epic 7 **no continúa**. No hay diseño. No hay implementación. No hay documentos adicionales de este Epic.

---

## 1. Capacidades ya cubiertas

### Core Platform

| Capacidad | Qué cubre | Identidad / grano |
|-----------|-----------|-------------------|
| Encounter | Ciclo `draft → in_progress → completed → signed → locked` | `EncounterId` |
| Clinical Completion | Cierre del acto: firmar, emitir, receta o visit summary, entrega | `ClinicalActId` |
| Commercial Settlement | Cierre comercial: pago, factura, lock | `SettlementId` |
| Clinical Operations | Lectura conjunta Encounter + Completion + Settlement, un `asOf` | keyed por `EncounterId` |
| Patient Care Continuity | Paquete efímero del acto vigente (handoff + contexto operativo) | keyed por `EncounterId` |
| RC-19A | Chrome de workspace clínico | — |
| Auth, Workspace, Foundation, Branding, WebRTC | Plataforma | — |
| Portal legado | Citas, historial de citas, pagos, perfil (writes de agenda/pago) | `appointment id` ≠ `EncounterId` |

`CorrelationId` es tracing. No hay quinta identidad de negocio.

### Product Platform v1.0–v6.0

| Ver | Epic | Pregunta que ya está cerrada | Actor |
|-----|------|------------------------------|-------|
| v1.0 | Clinical Delivery Queue | ¿Qué acto `document_ready` **no** se entregó en el centro? | Staff |
| v2.0 | Revenue Integrity | ¿Qué Encounter no cerró caja? Cubos comerciales exclusivos. | Administración |
| v3.0 | Longitudinal Continuity | ¿Qué actos vigentes tiene este paciente **entre** Encounters? | Médico |
| v4.0 | Pre-Visit Clinical Brief | ¿Qué retomo **ahora**, antes de la próxima visita? | Médico |
| v5.0 | Operational Pulse | ¿Cómo está operando la **clínica** (entrega, caja, continuidad, arranque)? | Dirección / operación |
| v6.0 | Patient Portal | ¿Qué quedó de **este** Encounter ya certificado para el paciente? | Paciente |

Cadena clínica-comercial ya cerrada en solo lectura de producto:

```
signed → emitido → entregado → consultado por el paciente (v6.0)
                ↘ médico: línea (v3.0) y brief de arranque (v4.0)
staff: no entregados (v1.0) · caja (v2.0) · pulso de centro (v5.0)
```

---

## 2. Capacidades duplicadas (descartadas)

Ideas que **parecen** roadmap y son solo variantes o combinaciones de Core / v1.0–v6.0. **No justifican un Epic independiente.**

| Idea | Por qué se descarta |
|------|---------------------|
| Intelligent Patient Follow-up (Epic 7) | **REJECTED BY ARCHITECTURE.** Post-consulta = v6.0; entre Encounters = v3.0; próxima visita médico = v4.0. Recordatorio/adherencia/control no existen en PCC. |
| Línea longitudinal para el paciente | Variante de v3.0 (otro actor, mismos paquetes). |
| Brief de pre-visita para el paciente | Variante de v4.0. |
| “Home clínico” que junta colas, cubos, línea, brief y pulso | Combinación de v1.0–v5.0. v5.0 ya es la síntesis de clínica. |
| Segunda cola de entrega / “entregados del día” | Variante de v1.0 (membresía invertida) o de v6.0. |
| Tablero comercial para el paciente (pagar, factura, lock) | Variante de v2.0 + Settlement + portal legado de pagos. v6.0 ya muestra comercial informativo. |
| Lista de pacientes con último handoff `absent` | Combinación de v3.0/v4.0; v5.0 ya expone el KPI. |
| Pulso por médico / por sala / “hoy” | Variante de v5.0 más reloj (prohibido como fuente). |
| Reabrir Completion para ver el PDF | No es producto nuevo: es incidente de Completion (cuerpo no está en COD/PCC). |
| Reabrir portal legado (citas) como “próximo control clínico” | `appointment id` ≠ `EncounterId`. Auth/portal congelados. |
| Copilot / Foundation como “seguimiento inteligente” | Plataforma congelada. No es Product Platform. |
| WhatsApp / compartir consulta como Epic de producto | FAB y `ShareConsultationDialog` (D9) están en freeze RC-19A. |

Estas ideas no se priorizan. No se diseñan.

---

## 3. Vacíos funcionales reales

Hay huecos **clínicos o de operación** en el sentido amplio. Casi ninguno es un Epic de Product Platform **consumiendo solo baselines certificadas**.

### 3.1 Huecos que Core / plataforma no certifican (no son Epics de producto)

Sin un incidente de Core (hechos nuevos, identidad oficial o workflow), Product Platform **no tiene de qué leer**. Inventarlos rompería el freeze.

| Hueco | Valor potencial | Por qué no es Epic de producto ahora |
|-------|-----------------|--------------------------------------|
| Próximo control / intervalo de seguimiento | Alto para paciente y clínica | No está en `ContinuityPackage`. |
| Adherencia a indicaciones | Alto clínico | No hay eventos de toma. |
| Vigilancia / alertas por umbral | Alto clínico | No hay reglas certificadas. |
| Recordatorios (reloj, push, mail) | Alto de adherencia | Reloj, persistencia, Auth/backend. |
| Órdenes / laboratorios / interconsulta como dominio | Alto clínico | No son dominio oficial. |
| Export interoperable (p. ej. ficha externa) | Alto de clínica / regulación | No hay proyección de exportación certificada. |
| Identidad de cuidador / familiar | Alto de paciente | Quinta identidad. |
| Gate paciente ↔ Encounter | Seguridad de v6.0 | Auth congelado; residual P1 de v6.0, no un Epic. |
| Descubrimiento de `/portal/encounter/[id]` desde historial | Usabilidad v6.0 | Exigiría editar portal legado. |

### 3.2 Residuales certificados (no abren Epic)

| Residual | Origen | Tratamiento |
|----------|--------|-------------|
| v6.0 no muestra el PDF, solo metadatos | Diseño / PCC | Incidente Completion si se autoriza visor. |
| v4.0 no trae `encounterStatus` / settlement en el ítem v3.0 | Freeze v3.0 | No se “repara” con un Epic. |
| v6.0 `unavailable` si el paciente no puede leer COD | Auth / `fetchConsultation` | Incidente Auth, no producto. |

### 3.3 Vacíos de Product Platform v7+ (consume-only)

**Conjunto vacío.**

No hay una pregunta de producto, keyed por `EncounterId` / `ClinicalActId` / `SettlementId`, que:

- genere valor **nuevo** para paciente, médico o clínica;
- no esté ya en Core ni en v1.0–v6.0;
- no sea variante o combinación de esas capacidades;
- no rompa una baseline.

El techo de Product Platform sobre el Core actual **es v6.0**.

---

## 4. Priorización por impacto clínico y comercial

Impacto **si existieran hechos de Core** (no es autorización de trabajo):

| Prioridad | Tema | Impacto clínico | Impacto comercial | Vía correcta |
|-----------|------|-----------------|-------------------|--------------|
| — | No abrir Epics de Product Platform | Preserva el freeze; evita duplicar v1–v6 | Preserva integridad de caja y entrega ya certificadas | **Decisión actual** |
| n/a | Seguimiento / control / adherencia | Alto | Indirecto (reconsulta) | Solo si Core certifica hechos; hoy Epic 7 está rechazado |
| n/a | Visor del documento emitido | Medio (paciente ve la receta real) | Bajo | Incidente Completion, no v7 |
| n/a | Autorización paciente–Encounter | Alto de privacidad | Bajo | Incidente Auth |
| n/a | Más tableros / colas / pulsos | Bajo (duplicado) | Bajo | Descartado §2 |

No hay fila “Epic 8 de producto” con impacto justificable bajo las reglas actuales.

---

## 5. Recomendación de próximos Epics

**No recomendar ningún Epic de Product Platform en este momento.**

1. Product Platform permanece **v6.0 CERTIFIED**.  
2. Epic 7 permanece **REJECTED BY ARCHITECTURE**.  
3. No abrir diseño ni implementación de un v7.0 de producto.  
4. No abrir automáticamente otro Epic.  
5. El siguiente movimiento, si lo hay, no es un remix de PCC/COD/v1–v6: es un **incidente de Core o de plataforma** (hechos nuevos) con autorización explícita, o una autorización explícita que acepte un Epic de producto **después** de este freeze.

Hasta entonces, el valor clínico y comercial se obtiene **usando** las superficies ya certificadas (`/panel/entrega-clinica`, `/panel/integridad-ingresos`, continuidad, brief, pulso, `/portal/encounter/[encounterId]`), no añadiendo una séptima proyección sobre los mismos slices.

---

**Siguiente paso:** esperar **aprobación explícita** antes de abrir cualquier Epic nuevo. Este documento no autoriza diseño, código ni ramas.
