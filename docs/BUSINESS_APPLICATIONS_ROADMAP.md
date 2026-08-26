# Business Applications Roadmap

**Type:** Platform Phase close + business applications identification  
**Date:** 2026-08-25  
**Does not:** design, implement, open platform Epics, create domains or identities, modify certified baselines  

This document does not change Core Platform, Architecture Baseline, RC-19A, Clinical Completion, Commercial Settlement, Clinical Operations Projection, Patient Care Continuity, Auth, Workspace, Foundation, Branding, WebRTC, the legacy patient portal, or Product Platform v1.0–v6.0.

**Business Applications Epic 1 — Digital Clinic:** CERTIFIED. See `docs/BUSINESS_APPLICATIONS_EPIC_1_DIGITAL_CLINIC_CERTIFIED_BASELINE.md`.

No se abre el siguiente Epic de Business Applications sin autorización explícita.

---

## 1. Declaración oficial de cierre de Platform Phase

La **Platform Phase** queda **oficialmente cerrada**.

No se abren nuevos Epics de plataforma.  
No se proponen nuevas capas arquitectónicas.  
No existen nuevos Epics consume-only que aporten valor sin crear hechos de negocio nuevos.

| Decisión | Estado |
|----------|--------|
| CORE_PLATFORM | **LTS (Long-Term Stable)** |
| PRODUCT_PLATFORM v6.0 | **LTS (Long-Term Stable)** |
| Epic 7 — Intelligent Patient Follow-up | **REJECTED BY ARCHITECTURE** |

El trabajo de plataforma posterior a este cierre solo procede por **incidente independiente**, autorización explícita y nueva certificación. No es el camino por defecto.

La siguiente etapa, si se autoriza, es **Business Applications Phase**: iniciativas de negocio que **consumen** la plataforma LTS. No es Product Platform v7.0.

---

## 2. CORE_PLATFORM = LTS

**Confirmado.** `docs/CORE_PLATFORM.md` permanece CERTIFIED y pasa a **Long-Term Stable**.

Dominios oficiales estables:

- Encounter (`EncounterId`) — write del ciclo `draft → … → locked`
- Clinical Completion (`ClinicalActId`) — write del acto
- Commercial Settlement (`SettlementId`) — write comercial
- Clinical Operations — proyección RO, keyed por `EncounterId`
- Patient Care Continuity — paquete efímero RO, keyed por `EncounterId`
- RC-19A, Auth, Workspace, Foundation, Branding, WebRTC — plataforma, no reabrir

Identidades oficiales estables: `EncounterId`, `ClinicalActId`, `SettlementId`, `CorrelationId` (tracing). No hay quinta identidad de negocio.

---

## 3. PRODUCT_PLATFORM v6.0 = LTS

**Confirmado.** `docs/PRODUCT_PLATFORM_BASELINE.md` (v6.0 CERTIFIED) pasa a **Long-Term Stable**.

| Ver | Epic | Superficie |
|-----|------|------------|
| v1.0 | Clinical Delivery Queue | `/panel/entrega-clinica` |
| v2.0 | Revenue Integrity | `/panel/integridad-ingresos` |
| v3.0 | Longitudinal Continuity | `/panel/continuidad-longitudinal/[patientId]` |
| v4.0 | Pre-Visit Clinical Brief | `/panel/brief-previsita/[patientId]` |
| v5.0 | Operational Pulse | `/panel/pulso-operativo` |
| v6.0 | Patient Portal | `/portal/encounter/[encounterId]` |

v1.0–v5.0 siguen CERTIFIED y frozen dentro de v6.0 LTS. El barrel v1.0 no se amplía.

Epic 7 no forma parte de Product Platform. Sigue **REJECTED BY ARCHITECTURE**.

---

## 4. Auditoría final de plataforma

Revisión del roadmap certificado (Core + Product v1.0–v6.0 + rechazo Epic 7).

### 4.1 ¿Existe algún vacío arquitectónico real?

**No.**

El grafo certificado cubre write clínico, write comercial, proyección de lectura y producto de staff y paciente:

```
Encounter
  ├── Clinical Completion          (ClinicalActId)
  ├── Commercial Settlement        (SettlementId)
  └── Clinical Operations          (RO, un asOf)
          └── Patient Care Continuity
                  ├── v1.0 cola de no entregados
                  ├── v3.0 línea (médico)
                  │       └── v4.0 brief de arranque
                  ├── v6.0 consulta de un Encounter (paciente)
                  └── (v2.0 lee Settlement vía COD; v5.0 compone v1+v2+v4)
```

Lo que falta en el mercado (adherencia, próximo control, FHIR, etc.) son **hechos de negocio o aplicaciones** que no existen como dominio oficial. No es un hueco del grafo de plataforma. Product Platform no puede leer lo que Core no certifica (conclusión Epic 7 y `docs/PRODUCT_ROADMAP_GAP_ANALYSIS.md`).

Residuales P1 de v6.0 (gate Auth paciente↔Encounter; PDF no está en PCC) son **incidentes de Auth o Completion**, no una capa arquitectónica nueva.

### 4.2 ¿Existe alguna duplicidad entre dominios?

**No.**

Completion y Settlement son independientes y no se escriben entre sí. COD no escribe. PCC no persiste y no es el panel RC-19A. Cada Epic de producto responde una pregunta distinta (cola ≠ cubos ≠ línea ≠ brief ≠ pulso ≠ portal paciente). Las lecturas en cascada (v4 desde v3, v5 desde v1+v2+v4, v6 desde PCC) son composición, no un segundo dominio.

`appointment id` del portal legado no es `EncounterId`. Conviven; no se unifican como identidad.

### 4.3 ¿Existe algún workflow incompleto?

**No**, en el alcance certificado.

Completion (CC-1…CC-11) cierra el acto vigente hasta entrega. Settlement (CS-1…CS-11) cierra caja hasta lock comercial. Encounter no pierde estados. Product Epics son READ ONLY y no dejan un workflow a medias. D9 (`ShareConsultationDialog`) está **fuera de alcance** RC-19A a propósito; no es un workflow Core incompleto.

### 4.4 ¿Existe alguna identidad faltante?

**No**, para la plataforma LTS.

Las cuatro identidades oficiales bastan para Encounter, acto, asentamiento y tracing. No falta una quinta para cerrar la Platform Phase. Cualquier `FollowUpId` / `ReminderId` / `PortalDocumentId` fue rechazado. El paciente autenticado es Auth, no un dominio de producto.

### 4.5 ¿Existe alguna dependencia circular?

**No.**

```
Encounter ──► Completion
Encounter ──► Settlement
Encounter + Completion + Settlement ──► COD ──► PCC ──► Product v1, v3, v6
COD ──► Product v2
v3 ──► v4 ──► v5
v1 + v2 + v4 ──► v5
```

Completion no depende de Settlement. Settlement no depende de Completion. Product no escribe Core. v6 no depende de v1–v5. No hay ciclo.

### 4.6 ¿Existe alguna baseline que aún no esté certificada?

**No**, en el catálogo de Platform Phase.

Core, Architecture Baseline, RC-19A Sprint 1/2, Completion, Settlement, COD, PCC y Product v1.0–v6.0 están CERTIFIED o FROZEN. Epic 7 no requiere baseline: está rechazado. `docs/PRODUCT_PLATFORM.md` es un puntero histórico, no el catálogo; el catálogo LTS es `docs/PRODUCT_PLATFORM_BASELINE.md`.

Nota de entrega (no es vacío de certificación): las superficies LTS viven en el working tree; el HEAD git de certificación es `6d6ec01…`. Eso es higiene de repositorio para la fase de negocio, no una baseline sin certificar.

### Cierre

Todas las respuestas son **NO**. La Platform Phase se declara **cerrada**.

---

## 5. Roadmap priorizado de Business Applications

Iniciativas de **negocio** que consumen la plataforma LTS. No son Epics de plataforma. No se diseña arquitectura. No se crean dominios ni identidades.

Prioridad: 1 = primero en consideración de negocio, si se autoriza la fase.

### Marketplace

| Campo | BA-MKT-1 Red de profesionales y oferta de agenda |
|-------|--------------------------------------------------|
| Objetivo | Que pacientes descubran y reserven atención en una red de prestadores, usando Auth y citas existentes. |
| Valor paciente | Elección de profesional / horario. |
| Valor médico | Demanda. |
| Valor clínica | Adquisición y ocupación. |
| Dep. Core | Auth (no reabrir). Encounter solo cuando exista consulta. |
| Dep. Product | Ninguna obligatoria (v6.0 posterior a la visita). |
| Complejidad | L |
| Impacto | Alto |
| Prioridad | 6 |

### Clínica Digital

| Campo | BA-CD-1 Sistema clínico-comercial del centro |
|-------|----------------------------------------------|
| **Status** | **CERTIFIED** |
| Baseline | `docs/BUSINESS_APPLICATIONS_EPIC_1_DIGITAL_CLINIC_CERTIFIED_BASELINE.md` |
| Superficie | `lib/business-applications/digital-clinic/**` (capa de procesos; URLs LTS) |
| Objetivo | Operar el día a día de la clínica sobre las superficies LTS: entrega, caja, línea, brief, pulso y ficha certificada. |
| Valor paciente | Atención cerrada (documento entregado, caja coherente). |
| Valor médico | Un sistema de trabajo ya certificado (v3.0, v4.0, ficha). |
| Valor clínica | Operación vendible: backlog, integridad de ingresos, pulso. |
| Dep. Core | Encounter, Completion, Settlement, COD, PCC, RC-19A (consumo). |
| Dep. Product | v1.0–v5.0 (uso). v6.0 si el paciente consulta el Encounter. |
| Complejidad | S |
| Impacto | Alto |
| Prioridad | **1** |

### Experiencia del Paciente

| Campo | BA-PX-1 Recorrido paciente sobre portal legado + v6.0 |
|-------|--------------------------------------------------------|
| Objetivo | Que el paciente use citas/pago (legado) y la consulta clínica certificada (`/portal/encounter/[encounterId]`) como un producto, sin nuevos hechos clínicos. |
| Valor paciente | Ver qué quedó de su consulta (v6.0). |
| Valor médico | Menos reconsulta por “no me dieron el documento”. |
| Valor clínica | Cierre del ciclo paciente. |
| Dep. Core | PCC/COD vía v6.0. Auth / portal legado sin rediseño de plataforma. |
| Dep. Product | v6.0 LTS. |
| Complejidad | M |
| Impacto | Alto |
| Prioridad | 2 |

### Inteligencia Artificial Clínica

| Campo | BA-AI-1 Productos de asistencia sobre Foundation existente |
|-------|-----------------------------------------------------------|
| Objetivo | Empaquetar la asistencia clínica ya existente (Copilot / Foundation) como oferta de negocio, sin reabrir Foundation ni RC-19A. |
| Valor paciente | Indirecto (mejor documentación si el médico la usa). |
| Valor médico | Apoyo en la visita. |
| Valor clínica | Diferenciación. |
| Dep. Core | Foundation / Copilot (congelados; solo consumo). Encounter. |
| Dep. Product | Ninguna. No sustituye v3.0/v4.0. |
| Complejidad | L |
| Impacto | Medio |
| Prioridad | 7 |

### Analítica / Business Intelligence

| Campo | BA-BI-1 Lectura ejecutiva de métricas ya certificadas |
|-------|------------------------------------------------------|
| Objetivo | Llevar a dirección las métricas PRODUCT-1 ya existentes (v1.0–v5.0), sin una séptima proyección de plataforma. |
| Valor paciente | Indirecto (centro menos atascado). |
| Valor médico | Bajo. |
| Valor clínica | Decisión (entrega, caja, continuidad). |
| Dep. Core | Ningún write. |
| Dep. Product | v1.0, v2.0, v5.0 (y v4.0 ya dentro del pulso). |
| Complejidad | S |
| Impacto | Medio |
| Prioridad | 4 |

### Integraciones

| Campo | BA-INT-1 Salida de identidades oficiales a redes clínicas |
|-------|----------------------------------------------------------|
| Objetivo | Intercambiar Encounter / acto / asentamiento con FHIR, HL7, LIS, RIS, aseguradoras o dispositivos, **mapeando** identidades LTS, sin acuñar una quinta. |
| Valor paciente | Continuidad fuera de HeyDoctor. |
| Valor médico | Menos doble registro. |
| Valor clínica | Licitaciones, redes, laboratorios. |
| Dep. Core | Encounter, Completion, Settlement, COD/PCC (lectura). |
| Dep. Product | Opcional v3.0/v6.0 como vistas. |
| Complejidad | L |
| Impacto | Alto |
| Prioridad | 3 |

### Operación de Clínicas

| Campo | BA-OPS-1 Multi-sede y operación más allá de un centro |
|-------|------------------------------------------------------|
| Objetivo | Operar varias sedes o unidades usando el mismo OS clínico-comercial LTS. |
| Valor paciente | Misma calidad de cierre en cada sede. |
| Valor médico | Mismo workspace. |
| Valor clínica | Escala. |
| Dep. Core | Auth/Workspace (org); no nuevos dominios clínicos. |
| Dep. Product | v1.0–v5.0 por sede (consumo). |
| Complejidad | L |
| Impacto | Alto |
| Prioridad | 5 |

### Internacionalización

| Campo | BA-I18N-1 Expansión de mercado y medios de pago |
|-------|------------------------------------------------|
| Objetivo | Operar en otros países (idioma, marca, cobro) consumiendo Branding/Auth/Settlement existentes. |
| Valor paciente | Acceso local. |
| Valor médico | Mercado. |
| Valor clínica | Ingresos. |
| Dep. Core | Branding, Auth, Settlement (Payku y reglas locales). |
| Dep. Product | Superficies LTS (copy ya en español: adaptación). |
| Complejidad | L |
| Impacto | Medio |
| Prioridad | 8 |

### Growth

| Campo | BA-GRW-1 Adquisición y reactivación comercial |
|-------|----------------------------------------------|
| Objetivo | Crecer la base de pacientes y clínicas sin nuevos hechos clínicos (canales, referidos, campañas). |
| Valor paciente | Descubrimiento. |
| Valor médico | Agenda. |
| Valor clínica | Ingresos. |
| Dep. Core | Auth, portal legado de citas. |
| Dep. Product | Ninguna clínica nueva. |
| Complejidad | M |
| Impacto | Medio |
| Prioridad | 9 |

---

## 6. Recomendación del primer frente de negocio

**Primer frente: Clínica Digital (BA-CD-1) — CERTIFIED.**

La capa de procesos (Atención, Caja por Encounter, Dirección Médica, Operaciones) está certificada. CORE_PLATFORM y PRODUCT_PLATFORM v6.0 siguen LTS.

No se abre el siguiente Epic de Business Applications sin **autorización explícita**.
