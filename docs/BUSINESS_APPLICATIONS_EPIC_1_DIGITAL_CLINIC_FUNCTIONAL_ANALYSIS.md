# Business Applications Epic 1 — Digital Clinic

**Type:** functional analysis (pre-design)  
**Status:** not authorized for design or implementation  
**Platform:** CORE_PLATFORM LTS · PRODUCT_PLATFORM v6.0 LTS  
**Date:** 2026-08-25  
**Source:** `docs/BUSINESS_APPLICATIONS_ROADMAP.md` (BA-CD-1)

This document does not change Core Platform, Architecture Baseline, Product Platform v6.0, RC-19A, Completion, Settlement, COD, PCC, v1.0–v6.0, Auth, Workspace, Foundation, Branding, WebRTC, or the legacy patient portal.

No analiza arquitectura, Core, Product Platform, IA clínica, Marketplace, portal del paciente, WebRTC ni Branding. Eso ya está resuelto.

**Recommendation:** el Epic de negocio **Digital Clinic** debe existir como **capa de procesos operativos** que consume la plataforma LTS. No es Product Platform v7.0. No crea dominios técnicos. Solo cubre los procesos de una clínica real que **ya se pueden operar** con hechos certificados; declara fuera de alcance los que exigen hechos de negocio nuevos (convenio tarifario, tesorería bancaria, sistema de calidad ISO, etc.).

Esperar **aprobación explícita** antes de pasar al diseño. Este documento no autoriza código.

---

## 1. Objetivo

Convertir HeyDoctor en una **Clínica Digital operable**: el conjunto de procesos de negocio con los que una clínica real atiende, cobra y dirige **un día de trabajo**, usando **exclusivamente** CORE_PLATFORM y PRODUCT_PLATFORM v6.0.

No crea plataforma. No crea dominios técnicos. No reabre baselines.

Pregunta de negocio: *¿qué le falta a una clínica para funcionar, además de la ficha, si la plataforma ya cierra el acto, la caja del Encounter y los tableros de staff?*

---

## 2. Alcance

### Incluido

Procesos de negocio (no módulos de plataforma):

Recepción, Agenda, Admisión, Atención, Caja, Facturación, Tesorería, Convenios, Administración, Dirección Médica, Calidad, Auditoría, Operaciones.

Para cada uno: qué está cubierto por LTS, qué se puede construir como aplicación de negocio **consumiendo** LTS, y qué **no** se puede construir sin hechos de negocio nuevos.

### Respuestas a las preguntas del análisis

**1. ¿Qué procesos administrativos necesita una clínica además de la ficha clínica?**  
Agenda (turnos y disponibilidad), recepción (llegada y sala), admisión (identidad y cobertura), administración (quién opera el sistema), convenios (si atiende aseguradoras), calidad y auditoría administrativas, dirección (seguimiento del centro). La ficha no cubre “quién entra hoy” ni “quién cierra la caja del día”.

**2. ¿Qué procesos operacionales faltan para atender pacientes diariamente?**  
Llamar al siguiente paciente, no-show, flujo sala/teleconsulta, arranque de visita, entrega del documento, reconsulta. La **atención clínica** (ficha, acto, teleconsulta) ya está resuelta. Falta el **ruteo del día** alrededor de esa atención (recepción + agenda + cola de entrega).

**3. ¿Qué procesos comerciales faltan para vender servicios médicos?**  
Lista de prestaciones, precio, paquete, copago, convenio, cobro, comprobante. El cobro y la factura **por Encounter** ya existen en Settlement. Falta vender **antes** de la visita (arancel, convenio, paquete) y Marketplace (excluido: otra iniciativa).

**4. ¿Qué procesos financieros faltan para operar una clínica?**  
Caja por atención (existe), facturación por atención (existe tras pago verificado), tesorería (depósitos, conciliación bancaria, retenciones), cuentas por cobrar de convenios, cierre diario de caja, impuestos. Tesorería y CxC de convenio **no** están en LTS.

**5. ¿Qué procesos regulatorios faltan (sin modificar el Core)?**  
Expediente y cadena de acto/asentamiento ya auditables en Completion/Settlement/COD. Faltan, como proceso de negocio: consentimiento informado, acceso a ficha, retención, reportes a autoridad, receta electrónica ya emitida (el acto legal de emitir está en Completion; el trámite externo no). Esos trámites no se resuelven inventando un dominio en Core.

**6. ¿Qué procesos pueden construirse consumiendo únicamente CORE_PLATFORM y PRODUCT_PLATFORM v6.0?**  
Los que **orquestan** hechos ya certificados: día de recepción/operación (listado de consultas + pulso + cola de entrega + brief), caja y facturación **por Encounter**, dirección médica con pulso, auditoría de acto y asentamiento vía COD/PCC, calidad operativa con métricas PRODUCT-1 (backlog, impago, handoff `absent`).  
No: motor de convenios, tesorería bancaria, QMS de acreditación, arancel general, nómina.

### Fuera de este Epic

Diseño, implementación, Marketplace, portal del paciente, IA, WebRTC, Branding, nuevos Epics de plataforma.

---

## 3. Procesos de negocio

Leyenda de cobertura:

| Marca | Significado |
|-------|-------------|
| **LTS** | Ya operable con Core / Product v6.0 / agenda o Auth existentes. Digital Clinic **usa**, no reconstruye. |
| **BA** | Capa de proceso de negocio construible **consumiendo** LTS, sin dominio técnico nuevo. |
| **BLOQ** | Exige hechos de negocio que LTS no certifica. Fuera de este Epic. |

### Recepción

| | |
|--|--|
| Objetivo | Saber quién llegó, quién espera, a quién derivar (médico, caja, entrega). |
| LTS | Listado de consultas (RC-19A, consumo). Pulso v5.0 (presión de entrega/caja). Cola v1.0 (documentos no entregados). |
| Falta | “Paciente en sala” / llamado / turnero como hecho. No está en PCC. |
| BA | Playbook de recepción: consultar pulso + cola + listado; no mint de `ReceptionId`. |
| BLOQ | Turnero físico, pantallas de sala, SMS de “es su turno” (notificación / reloj). |

### Agenda

| | |
|--|--|
| Objetivo | Asignar cupos, disponibilidad, inasistencias. |
| LTS | Agenda de panel y citas del portal legado (`appointment id`). **No se rediseña.** |
| Falta | Unir formalmente cita ↔ `EncounterId` como identidad (prohibido acuñar mapeo-identidad). El Encounter nace cuando hay consulta. |
| BA | Operar la agenda existente como proceso de clínica digital. |
| BLOQ | Motor nuevo de slots, overbooking inteligente, Marketplace. |

### Admisión

| | |
|--|--|
| Objetivo | Identificar al paciente y su cobertura antes de atender. |
| LTS | Auth / ficha de paciente (datos, cobertura en perfil). Encounter `draft` / `in_progress`. |
| Falta | Verificación de convenio en el acto de admisión (autorización de prestador). |
| BA | Checklist de admisión sobre datos ya existentes (identidad, cobertura declarada). |
| BLOQ | Autorización en línea Isapre/Fonasa como dominio. |

### Atención

| | |
|--|--|
| Objetivo | Atender, documentar, firmar, emitir, entregar. |
| LTS | Ficha, Completion, WebRTC (resuelto), v3.0, v4.0, v1.0. |
| Falta | Nada de plataforma para el acto vigente. |
| BA | Protocolo de visita: brief (v4.0) → ficha → cierre → cola de entrega si aplica. |
| BLOQ | — |

### Caja

| | |
|--|--|
| Objetivo | Cobrar la atención. |
| LTS | Settlement (pago verificado, lock). v2.0 (impagos, anomalías). Pulso comercial v5.0. |
| Falta | Caja registradora del día (efectivo en cajón, arqueo). |
| BA | Caja **por Encounter**: operar Settlement + tablero v2.0. |
| BLOQ | Arqueo de efectivo, fondos fijos. |

### Facturación

| | |
|--|--|
| Objetivo | Emitir comprobante legal de la venta. |
| LTS | Invoice tras `payment_verified` (Settlement). |
| Falta | Boleta vs factura, notas de crédito, facturación periódica a convenio. |
| BA | Factura **por Encounter** ya certificado. |
| BLOQ | Libro de ventas SII, NC/ND, lote mensual a isapre. |

### Tesorería

| | |
|--|--|
| Objetivo | Dinero en banco, conciliación, impuestos. |
| LTS | `isPaid`, `invoiceId`, Payku como medio del Settlement. |
| Falta | Extracto bancario, matching, retenciones. |
| BA | Consultar estado comercial certificado (informativo). |
| BLOQ | Tesorería completa. **No entra en Digital Clinic v1 de negocio.** |

### Convenios

| | |
|--|--|
| Objetivo | Atender y cobrar según contrato con pagador. |
| LTS | Cobertura en perfil; `isPaid` no es copago de convenio. |
| Falta | Arancel, copago, bono, lote. |
| BA | Ningún motor. No inferir convenio desde Settlement. |
| BLOQ | Motor de convenios. **Fuera de este Epic.** |

### Administración

| | |
|--|--|
| Objetivo | Quién puede operar el sistema y cómo está configurada la clínica. |
| LTS | Auth, Workspace (congelados; consumo). |
| Falta | ABM de prestadores / sedes como producto (Operación de clínicas, otro frente). |
| BA | Roles existentes; sin rediseñar Auth. |
| BLOQ | IAM nuevo, multi-tenant nuevo. |

### Dirección Médica

| | |
|--|--|
| Objetivo | Ver si el centro está sano hoy y a qué frente enviar al equipo. |
| LTS | v5.0 pulso; CTAs a v1.0 y v2.0. |
| Falta | Credenciales, privilegios, comités. |
| BA | Ronda de dirección sobre el pulso. |
| BLOQ | Gobierno clínico institucional (staff médico). |

### Calidad

| | |
|--|--|
| Objetivo | Que el cierre clínico-comercial sea consistente. |
| LTS | Métricas: backlog de entrega, handoff `absent`, lock anomaly (v1/v2/v5). |
| Falta | Eventos adversos, protocolos, acreditación. |
| BA | Calidad **operativa**: leer KPIs certificados (no es QMS). |
| BLOQ | Sistema de calidad / ISO / GES. |

### Auditoría

| | |
|--|--|
| Objetivo | Reconstruir qué pasó en un Encounter (acto y caja). |
| LTS | Cadenas de Completion y Settlement; COD. |
| Falta | Bitácora de acceso a ficha (Auth). Reportes a autoridad. |
| BA | Auditoría **por Encounter** consumiendo COD (RO). |
| BLOQ | Auditoría de acceso y reportes regulatorios externos. |

### Operaciones

| | |
|--|--|
| Objetivo | Que el flujo del día no se atasque (entrega, caja, arranque). |
| LTS | v1.0, v2.0, v4.0, v5.0. |
| Falta | Inventario, boxes, turnos de personal. |
| BA | Operación del día clínico-comercial sobre tableros LTS. |
| BLOQ | Inventario, RRHH, facilities. |

---

## 4. Dependencias

Digital Clinic **solo consume**. No escribe Core. No modifica Product v6.0.

| Proceso | CORE_PLATFORM (consumo) | PRODUCT_PLATFORM (consumo) |
|---------|-------------------------|----------------------------|
| Recepción | Encounter (listado) | v1.0, v5.0 |
| Agenda | (agenda existente; no Core clínico) | ninguna obligatoria |
| Admisión | Encounter, Auth/perfil | v4.0 (opcional, arranque) |
| Atención | Encounter, Completion, PCC | v3.0, v4.0, v1.0 |
| Caja | Settlement | v2.0, v5.0 |
| Facturación | Settlement (`invoiceId`) | v2.0 |
| Tesorería | Settlement (solo lectura de pagado) | v2.0 informativo |
| Convenios | — | — (BLOQ) |
| Administración | Auth, Workspace | — |
| Dirección Médica | — | v5.0 (v1.0/v2.0 vía pulso) |
| Calidad | PCC/COD vía producto | v1.0, v2.0, v5.0 métricas |
| Auditoría | COD, Completion audit, Settlement audit | — |
| Operaciones | Encounter | v1.0–v5.0 |

Portal del paciente (v6.0) está **resuelto** y **excluido** de este análisis; no es proceso de operación interna de la clínica.

Nunca: `run*` / `ensure*` / `observe*` / `persist*` / `save*` nuevos. Los writes clínicos y comerciales **siguen** en ficha y Settlement ya certificados.

---

## 5. Riesgos

| ID | Riesgo | Mitigación |
|----|--------|------------|
| P0 | Reconstruir cola, cubos, pulso o ficha como “Clínica Digital” | Solo orquestar procesos; cero edits a LTS. |
| P0 | Acuñar `ClinicId` / `ReceptionId` / `ConvenioId` / `CajaDiariaId` | Prohibido. Identidades oficiales intactas. |
| P0 | Unificar `appointment id` con `EncounterId` | No hay quinta identidad. Agenda y Encounter conviven. |
| P1 | Meter tesorería o convenios en este Epic | Clasificados BLOQ. No diseñarlos aquí. |
| P1 | Reloj (“pacientes de hoy”) como fuente de dominio | El día operativo puede usar agenda existente; no se inventa `asOf` de clínica (v5.0 ya no lo tiene). |
| P1 | Sidebar / PanelLayout para “menú clínica digital” | Freeze RC-19A. El proceso usa URLs LTS, no chrome nuevo. |
| P2 | Calidad operativa confundida con QMS regulatorio | KPIs PRODUCT-1 ≠ acreditación. |
| P2 | Recepción espera un turnero | Fuera de LTS; no es FAIL del análisis. |

---

## 6. Exclusiones

- Arquitectura, Core, Product Platform, IA, Marketplace, portal del paciente, WebRTC, Branding.
- Diseño e implementación.
- Convenios, tesorería bancaria, QMS, inventario, RRHH, reportes a autoridad.
- Nuevos dominios técnicos, identidades, workflows clínicos o comerciales.
- Modificar cualquier baseline certificada.

---

## 7. Priorización

Solo procesos **LTS** o **BA**. BLOQ no se prioriza para construir en este Epic.

| Proceso | Objetivo | Paciente | Médico | Clínica | Core | Product | C | I | P |
|---------|----------|----------|--------|---------|------|---------|---|---|---|
| Atención | Atender y cerrar el acto | Alto (documento) | Alto | Alto | Encounter, Completion | v3.0 v4.0 v1.0 | S | Alto | 1 |
| Caja | Cobrar el Encounter | Medio | Bajo | Alto | Settlement | v2.0 v5.0 | S | Alto | 2 |
| Dirección Médica | Ver salud del centro | Indirecto | Medio | Alto | — | v5.0 | S | Alto | 3 |
| Operaciones | Desatascar entrega/caja/arranque | Medio | Alto | Alto | Encounter | v1.0–v5.0 | S | Alto | 4 |
| Recepción | Ruteo del día | Alto | Medio | Alto | Encounter | v1.0 v5.0 | M | Alto | 5 |
| Agenda | Cupos (existente) | Alto | Alto | Alto | — | — | S | Alto | 6 |
| Admisión | Identidad / cobertura declarada | Alto | Medio | Medio | Encounter, perfil | v4.0 opcional | M | Medio | 7 |
| Facturación | Comprobante por Encounter | Medio | Bajo | Alto | Settlement | v2.0 | S | Medio | 8 |
| Auditoría | Reconstruir acto y caja | Bajo | Medio | Alto | COD, audits | — | S | Medio | 9 |
| Administración | Operar con Auth existente | Bajo | Bajo | Medio | Auth, Workspace | — | S | Medio | 10 |
| Calidad | KPIs de cierre | Medio | Medio | Medio | vía producto | v1 v2 v5 | S | Medio | 11 |
| Tesorería | — | — | — | — | — | — | L | Alto | — (BLOQ) |
| Convenios | — | — | — | — | — | — | L | Alto | — (BLOQ) |

C = complejidad (S/M/L). I = impacto. P = prioridad de **proceso a operar** en Digital Clinic (1 = primero).

---

## 8. Recomendación

**¿Debe existir Digital Clinic como Epic de Business Applications?** **Sí**, acotado a **operar la clínica del día** sobre LTS.

**¿Es un Epic de plataforma?** **No.**

**¿Qué se construye en este Epic (cuando haya diseño autorizado)?**  
Una capa de procesos —no una nueva plataforma— que ordena el trabajo de:

1. Atención (ya LTS),  
2. Caja por Encounter,  
3. Dirección Médica (pulso),  
4. Operaciones (v1–v5),  
5. Recepción como playbook sobre listado + pulso + cola,  
6. Agenda y admisión **consumiendo** lo existente.

**¿Qué no se construye?**  
Convenios, tesorería, facturación masiva a pagadores, QMS, inventario, IAM nuevo.

**Primer recorte de negocio, si se autoriza diseño:**  
Atención + Caja + Dirección Médica + Operaciones (prioridades 1–4). Recepción (5) en el mismo recorte solo como **uso** de superficies LTS, sin turnero.

El siguiente paso, si se autoriza, es **diseño de procesos de negocio** (no diseño de Core). No implementación.
