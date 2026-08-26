# Epic 7 — Intelligent Patient Follow-up

**Type:** functional analysis (pre-design)  
**Status:** **REJECTED BY ARCHITECTURE**  
**Decision:** 2026-08-25  
**Product Platform:** v6.0 remains CERTIFIED and frozen  

No es un fallo de implementación. Es una decisión de arquitectura. El Epic **no continúa**. No hay diseño. No hay implementación. No hay código.

**Registro:** no existe un vacío funcional certificable. Las capacidades actuales ya cubren el caso de uso post-firma / post-emisión / post-entrega / post-consulta. Abrir este Epic introduciría un dominio o workflow nuevo sin justificación.

This document does not change Core Platform, Architecture Baseline, RC-19A, Clinical Completion, Commercial Settlement, Clinical Operations Projection, Patient Care Continuity, Auth, Workspace, Foundation, Branding, WebRTC, the legacy patient portal, or Product Platform v1.0–v6.0.

**Recommendation (accepted):** Epic 7 **must not exist as an independent Product Platform epic** on the certified architecture. The question *what happens after sign / emit / deliver / patient consult* is already answered by capabilities certificadas, or it requires facts and workflows that **Core no certifica**. No hay un siguiente paso de producto derivable en solo lectura sin inventar un dominio.

No diseñar. No implementar.

---

## 1. Objetivo funcional

Determinar si existe un **seguimiento inteligente del paciente** que agregue valor clínico **después** de que el acto vigente fue firmado, emitido, entregado y consultado por el paciente, **sin** modificar el Core y **sin** crear workflows clínicos o comerciales.

La pregunta de producto no es “¿el paciente se beneficia de un recordatorio?”. Esa pregunta es clínica general. La pregunta que este análisis puede responder es:

*¿Qué objeto de Product Platform, keyed por una identidad oficial, se deriva de las proyecciones ya certificadas y no es v1.0–v6.0?*

Respuestas que **sí** cubre la arquitectura certificada:

- el documento ya entregado de **un** Encounter (v6.0 / PCC);
- la secuencia de actos vigentes entre Encounters **para el médico** (v3.0);
- el punto de arranque de la **próxima** visita **para el médico** (v4.0).

Respuestas que **no** cubre ninguna proyección certificada:

- cuándo vuelve el paciente (próximo control);
- si tomó la medicación (adherencia);
- qué vigilancia aplicar (reglas, umbrales, alertas);
- qué recordatorio disparar y cuándo (reloj, notificación).

Este análisis no propone un dominio `FollowUp`. No propone `FollowUpId`, `ReminderId` ni `AdherenceId`.

---

## 2. Problema que resuelve

### Lo que ocurre hoy, en orden certificado

```
Encounter signed
    └── Clinical Completion (write; ClinicalActId)     [congelado]
            └── documento prescription | visit_summary
                    └── deliveredAt
                            └── Patient Portal v6.0     [paciente consulta UN Encounter]
```

En paralelo, no en serie de paciente:

```
patientId
    └── Longitudinal Continuity v3.0     [médico: línea de Encounters]
            └── Pre-Visit Brief v4.0     [médico: qué retomar ANTES de la próxima visita]
```

Después de v6.0 el paciente **ya consultó** el hecho certificado (kind + `deliveredAt`). El médico **ya tiene** el hilo (v3) y el briefing de arranque (v4). Staff **ya entregó** (v1 deja de listar ese Encounter).

### El hueco percibido

“Seguimiento inteligente” nombra varias intenciones distintas:

| Intención | ¿Hay dato certificado? | ¿Quién ya lo cubre? |
|-----------|------------------------|---------------------|
| Controles posteriores / próximos controles | No. PCC no trae fecha de control. Las citas viven en el portal legado (`appointment id` ≠ `EncounterId`). | Portal legado (congelado) o un Encounter futuro (`draft` / `in_progress`, fuera del recorte clínico certificado de producto). |
| Recordatorios clínicos | No. No hay instante de vencimiento en COD/PCC. Un recordatorio exige reloj o persistencia. | Nadie. Exigiría workflow o notificación (Auth/backend). |
| Seguimientos recomendados | No. No hay protocolo ni intervalo en el `ContinuityPackage`. Inferirlo del `documentKind` sería inventar clínica. | Nadie, sin un dominio nuevo. |
| Adherencia | No. No hay tomas, dosis cumplidas ni eventos de paciente. | Nadie. |
| Vigilancia clínica | No. No hay umbrales, alertas ni observaciones post-entrega. | Nadie. Pulso v5.0 es de **clínica**, no de un paciente. |
| Continuidad entre Encounter distintos | Sí. Un paquete por Encounter, acto vigente, `asOf`. | **v3.0** (médico). **v4.0** (último ítem). PCC es el átomo de **un** Encounter. v6.0 es la consulta de **un** Encounter. |

El problema operativo “falta seguimiento” **no es un hueco de proyección**: es la ausencia de **hechos** en el Core. Product Platform no puede certificar adherencia ni el próximo control si Completion solo proyecta `documentKind`, `state` y `deliveredAt`.

---

## 3. Beneficio para paciente, médico y clínica

### Si se forzara un Epic 7 remix de datos ya certificados

| Actor | Beneficio real | Límite |
|-------|----------------|--------|
| **Paciente** | Volvería a ver lo mismo que v6.0 (documento entregado, pendiente de entrega, comercial informativo) o una línea que el médico ya ve en v3.0. | No gana un control, un recordatorio ni adherencia. Duplicar v6.0 o v3.0 no es valor clínico nuevo. |
| **Médico** | Ya tiene v3.0 y v4.0 para el *después* clínico entre visitas y el *antes* de la siguiente. | Un “seguimiento inteligente” de paciente no sustituye el brief. No debe reabrir Completion. |
| **Clínica** | v5.0 ya sintetiza entrega, caja y huecos de continuidad a nivel de centro. | Vigilancia de un paciente no es pulso de clínica. |

### Si se inventaran recordatorios / adherencia / próximos controles

El beneficio clínico sería real **en abstracto** (el paciente no olvida el control; el médico no pierde adherencia). Ese beneficio **no es alcanzable** con las dependencias autorizadas: exigiría writes, reloj, notificaciones o un dominio no certificado. Eso viola el objetivo de este Epic (“sin modificar el Core”, “sin workflows clínicos nuevos”).

Conclusión de beneficio: **no hay beneficio incremental certificable**. Hay o duplicación, o invención.

---

## 4. Dependencias

El enunciado autoriza analizar **únicamente** el consumo de:

| Fuente | Status | Qué aporta | Qué no aporta |
|--------|--------|------------|---------------|
| Patient Portal v6.0 | CERTIFIED / frozen | `PortalEncounterView` de **un** `EncounterId`. Documento solo si `deliveredAt != null`. | No es una línea. No se puede modificar. No tiene próximo control. |
| Patient Care Continuity | CERTIFIED / frozen | `ContinuityPackage`: handoff (`clinicalActId`, `state`, `documentKind`, `deliveredAt`) + contexto operativo. | Un Encounter. No adherencia. No fecha de control. No se modifica. |
| Clinical Operations Projection | CERTIFIED / frozen | Transitiva dentro de PCC. Encounter + Completion + Settlement en un `asOf`. | No se reentra desde producto si v6.0 / PCC ya resuelven el grano. |
| Clinical Completion | CERTIFIED / frozen | Slice ya proyectado (`documentKind`, `deliveredAt`, estado del acto). | Nunca `run*` / `save*`. Nunca reabrir emisión ni entrega. |

**No es dependencia autorizada para construir el Epic** (sí para no duplicarlos): v1.0, v2.0, v3.0, v4.0, v5.0, Settlement write, portal legado, Auth.

### Hechos disponibles (cerrados)

De PCC / v6.0, por Encounter:

- `EncounterId`, estado de ciclo de vida;
- `ClinicalActId` vigente o handoff `absent`;
- `prescription` \| `visit_summary` \| ninguno;
- `deliveredAt` presente o nulo;
- `SettlementId` / `isPaid` informativos.

De v3.0 (no listada como fuente de este Epic, pero certificada): secuencia de esos paquetes por `patientId`.

### Hechos no disponibles

- Próxima cita / próximo control clínico.
- Intervalo recomendado.
- Eventos de adherencia.
- Alertas de vigilancia.
- “Paciente ya consultó el portal” como hecho de dominio (v6.0 no persiste `portal_opened`).
- Reloj (“vence mañana”).

Sin esos hechos, un read model de “seguimiento inteligente” o es un **alias de v6.0**, o es un **alias de v3.0/v4.0**, o **inventa clínica**.

Completion y Settlement **no se reabren**. PCC **no se modifica**. `ContinuityPackage` y `PortalEncounterView` **no se modifican**.

---

## 5. Riesgos

| ID | Riesgo | Clasificación |
|----|--------|----------------|
| P0 | Crear `FollowUpId` / `ReminderId` / `AdherenceId` / `SurveillanceId` | Prohibido. Quinta identidad. |
| P0 | Reabrir Clinical Completion (emitir, reenviar, firmar) o Settlement (pagar, lock) | Freeze Core. |
| P0 | Modificar PCC, `ContinuityPackage` o `PortalEncounterView` | Freeze v6.0 / Core. |
| P0 | Nuevo workflow clínico o comercial; persistir seguimientos | Prohibido. |
| P1 | Duplicar v6.0 (“después de consultar” = volver a mostrar el documento) | No es Epic independiente. |
| P1 | Duplicar v3.0 / v4.0 bajo URL de paciente (continuidad entre Encounters) | Misma línea, otro actor; reimplementar agregación viola freeze y las dependencias autorizadas (v3.0 no es fuente de este Epic). |
| P1 | Usar el portal legado de citas como “próximo control” | Confunde `appointment id` con `EncounterId`; reabre Auth/portal. |
| P1 | Usar `Date.now` para recordatorios “vencidos” | Rompe determinismo (misma regla que v1–v6). |
| P2 | Inferir “si hay receta, hay seguimiento” desde `documentKind` | Inventa indicación clínica no certificada. |
| P2 | Notificaciones (push/email) | Auth/backend; no es proyección. |
| P3 | El lenguaje “inteligente” sugiere Copilot / Foundation | Congelados; fuera de dominio. |

Ningún riesgo de esta lista se mitiga implementando v7.0 sobre las fuentes autorizadas. Se mitiga **no abriendo el Epic**.

---

## 6. Exclusiones

No se toca:

- CORE_PLATFORM, ARCHITECTURE_BASELINE, RC-19A
- Clinical Completion, Commercial Settlement, COD, PCC
- Product Platform v1.0–v6.0 (incluidas `PortalEncounterView` y `/portal/encounter/[encounterId]`)
- Portal legado, Auth, Workspace, Foundation, Branding, WebRTC
- Encounter, `ClinicalActId`, `SettlementId`, `ContinuityPackage`

No entra en ningún diseño futuro de este nombre, mientras el Core no certifique hechos nuevos:

- recordatorios;
- adherencia;
- vigilancia;
- próximos controles como objeto de producto;
- workflows clínicos o comerciales;
- LocalStorage / SessionStorage / Browser State como fuente;
- reloj como fuente funcional.

---

## 7. Relación con Product Platform v1.0–v6.0

| Epic | Pregunta certificada | Relación con “seguimiento inteligente” |
|------|----------------------|----------------------------------------|
| v1.0 Delivery Queue | ¿Qué acto **no** se entregó en el centro? | El *después* de entregar es **salir de la cola**. No es seguimiento de paciente. |
| v2.0 Revenue Integrity | ¿Qué Encounter no cerró caja? | Comercial. El seguimiento clínico no se recorta por pago (PCC-5). |
| v3.0 Longitudinal Continuity | ¿Qué actos vigentes tiene este paciente **a lo largo** de los Encounters? | **Ya es** la continuidad entre Encounters. Actor: médico. |
| v4.0 Pre-Visit Brief | ¿Qué retomo **ahora**, antes de la próxima visita? | **Ya es** el siguiente paso clínico del médico. No es post-consulta del paciente. |
| v5.0 Operational Pulse | ¿Cómo está la clínica? | Agregado de centro. No es vigilancia de un paciente. |
| v6.0 Patient Portal | ¿Qué quedó de **este** Encounter para el paciente? | **Ya es** el paso post-entrega / post-consulta de un Encounter. |

Cadena temporal real:

1. Firmar / emitir → Completion (Core).  
2. Entregar → `deliveredAt` (Core); v1.0 deja de listar.  
3. Paciente consulta → v6.0.  
4. Médico ve el hilo y arranca la siguiente visita → v3.0 + v4.0.  
5. Una **nueva** visita es un **nuevo** `EncounterId` (ciclo Encounter), no un estado de seguimiento.

No falta un eslabón de Product Platform. Falta, si se desea más adelante, un **dominio o proyección de Core** (control, adherencia, recordatorio) que hoy **no existe** y este Epic no puede crear.

---

## 8. Superficie de producto propuesta

**Ninguna.**

No se propone `/portal/seguimiento`, `/panel/seguimiento`, ni un módulo `lib/product-platform/intelligent-follow-up/**`.

Cualquier superficie nueva sería:

- un segundo `PortalEncounterView` (viola freeze v6.0 y no añade hechos), o
- una segunda línea longitudinal (viola freeze v3.0 / dependencias), o
- un cliente de citas legado (viola portal/Auth), o
- un workflow con reloj (viola Core y PASS de producto).

El paciente sigue en `/portal/encounter/[encounterId]`. El médico sigue en v3.0 / v4.0. El portal legado sigue en citas. Nada de eso se rediseña aquí.

---

## 9. Criterios PASS / FAIL

No hay implementación que certificar. Si, contra esta recomendación, se autorizara un Epic 7, **FAIL inmediato** ante cualquiera de:

| ID | FAIL |
|----|------|
| IFU-1 | Cualquier write (`run*` / `ensure*` / `observe*` / `persist*` / `save*`). |
| IFU-2 | Nueva identidad o dominio. |
| IFU-3 | Modificar PCC, Completion, Settlement, v6.0, `ContinuityPackage` o `PortalEncounterView`. |
| IFU-4 | Reloj o storage de browser como fuente de “vencido” / “próximo”. |
| IFU-5 | Inferir un control o adherencia que no está en el paquete certificado. |
| IFU-6 | Duplicar membresía o UI de v3.0 / v4.0 / v6.0. |
| IFU-7 | Reabrir portal legado o Auth para “recordar la cita”. |

PASS de este **análisis**: el Epic **no avanza** a diseño. Eso conserva Core y v1.0–v6.0.

---

## 10. Recomendación

**¿Debe existir como Epic independiente dentro de Product Platform?** **No.**

**¿Alguna capacidad existente cubre el “después” clínico certificable?** **Sí.**

- Después de entregar y consultar **un** Encounter: **v6.0**.  
- Continuidad **entre** Encounters: **v3.0**.  
- Siguiente paso del **médico** hacia la próxima visita: **v4.0**.  
- Entrega pendiente en el centro: **v1.0** (no es post-consulta del paciente).

**¿El seguimiento inteligente (controles, recordatorios, adherencia, vigilancia, próximos controles) es derivable de v6.0 + PCC + COD + Completion?** **No.** Esos conceptos no están en el `ContinuityPackage` ni en `PortalEncounterView`.

**¿Reutilizar v1.0–v5.0 para inventar el seguimiento?** **No.** Están frozen y no contienen esos hechos. v3.0/v4.0 ya son continuidad/arranque, no adherencia.

**¿Qué faltaría para un Epic futuro con este nombre?** Un incidente de Core que certifique una proyección de seguimiento (hechos: próximo control, o adherencia, o recordatorio) **sin** quinta identidad improvisada en Product. Hasta entonces, Product Platform no tiene de qué leer.

**Decisión:** REJECTED BY ARCHITECTURE. El Epic 7 no continúa. No hay diseño ni implementación.
