# Business Applications — gap analysis

**Type:** functional audit (not an Epic)  
**Date:** 2026-08-25  
**Scope:** CORE_PLATFORM LTS · PRODUCT_PLATFORM v6.0 LTS · Business Applications Epic 1 CERTIFIED  

This document does not change Core, Architecture Baseline, Product Platform v6.0, or Digital Clinic Epic 1.

No asume un Epic 3. No propone tecnología, IA, dominios, identidades, workflows ni estados.

---

## Registro previo

| Ítem | Estado |
|------|--------|
| Product Epic 7 — Intelligent Patient Follow-up | REJECTED BY ARCHITECTURE |
| BA Epic 2 — Medical Director Console | REJECTED BY ARCHITECTURE |
| BA Epic 1 — Digital Clinic | CERTIFIED |

---

## Criterio de un Epic candidato

Debe cumplir **todos**:

- problema de negocio independiente  
- actor distinto  
- flujo distinto  
- sin duplicar LTS  
- sin modificar Core  
- sin modificar Product Platform  
- sin modificar Business Applications Epic 1  

Si falla cualquiera: **REJECTED BY ARCHITECTURE**.

---

## Auditoría por proceso

Leyenda: **Cubierto** · **Parcial** · **No cubierto**

### Recepción

**Parcial.**

- Cubierto: ruteo con listado de consultas (RC-19A, consumo), pulso v5.0, cola v1.0. Digital Clinic no reconstruye recepción; el personal puede usar esas URLs.  
- Falta: “en sala”, llamado, turnero, SMS de turno.  
- Por qué LTS no alcanza el resto: no hay hecho certificado de presencia en sala ni canal de notificación. Un Epic de turnero acuñaría hechos/reloj/identidad. **No es Epic candidato.**

### Admisión

**Parcial.**

- Cubierto: identidad y cobertura declarada (Auth / perfil de paciente); Encounter `draft` / `in_progress`. Brief v4.0 opcional al arrancar.  
- Falta: autorización de convenio / pagador en el acto de admisión.  
- LTS no certifica arancel ni bono. Motor de convenios = hechos nuevos. **No es Epic candidato.**

### Agenda

**Cubierto.**

- Agenda de panel existente y citas del portal legado (`appointment id`).  
- Digital Clinic consume; no rediseña. `appointment id` ≠ `EncounterId` (convivencia LTS).

### Atención

**Cubierto.**

- Core: Encounter, Clinical Completion, PCC.  
- Product: v3.0, v4.0, v1.0 (si queda sin entregar).  
- BA Epic 1: proceso Atención (`navigateAtencion`).

### Dirección Médica

**Cubierto.**

- Product v5.0 `/panel/pulso-operativo`.  
- BA Epic 1: proceso Dirección Médica (BA-11: solo pulso).  
- BA Epic 2 (consola) **REJECTED BY ARCHITECTURE**.

### Operaciones

**Cubierto.**

- BA Epic 1: proceso Operaciones (pulso → v1.0 y/o v2.0).  
- No inventario, boxes ni RRHH (BLOQ, no consola).

### Caja

**Parcial.**

- Cubierto: cobro **por Encounter** (Settlement + v2.0 + BA Epic 1 Caja).  
- Falta: arqueo de efectivo, caja del día, fondos fijos.  
- LTS no tiene `CajaDiariaId` ni cajón. Tesorería de día = hechos nuevos. **No es Epic candidato.**

### Facturación

**Parcial.**

- Cubierto: factura **por Encounter** tras `payment_verified` (Settlement).  
- Falta: libros SII, NC/ND, lote a isapre, boleta vs factura como régimen.  
- No se deriva de `invoiceId` único por Encounter. **No es Epic candidato** (hechos fiscales/convenio).

### Pacientes

**Cubierto** (operación clínica del maestro y la continuidad).

- Perfil / Auth; línea v3.0 y brief v4.0 por `patientId`; portal v6.0 para el Encounter entregado.  
- CRM / campañas = Growth, no proceso ambulatorio de este recorte.

### Documentación

**Parcial.**

- Cubierto: emisión receta / visit summary (Completion), entrega (v1.0), consulta de metadatos (v6.0).  
- Falta: visor del PDF (cuerpo no está en PCC). Es **incidente Completion**, no Epic de Business Applications.  
- No se reabre Completion desde BA.

### Calidad

**Parcial.**

- Cubierto: indicadores operativos PRODUCT-1 (backlog, `lockAnomaly`, handoff `absent`) vía v1.0 / v2.0 / v5.0.  
- Falta: eventos adversos, protocolos, acreditación. QMS ≠ pulso. **No es Epic candidato.**

### Indicadores

**Cubierto.**

- Operational Pulse v5.0 (KPIs, `pulseStatus`, alertas, composición).  
- Una “consola BI” que re-liste las mismas métricas duplica v5.0. **REJECTED** como Epic.

### Auditoría

**Parcial.**

- Cubierto: cadenas Completion y Settlement; COD por Encounter.  
- Falta: bitácora de acceso a ficha (Auth congelado); reportes a autoridad.  
- Reabrir Auth o un dominio de reporting regulatorio no es BA consume-only. **No es Epic candidato.**

### Gerencia

**Parcial.**

- Cubierto (gerencia operativa del centro): mismo que Dirección Médica (v5.0 + BA Epic 1).  
- Falta: P&amp;L, tesorería, multi-sede. Hechos no certificados. Consola ejecutiva ≠ pulso. **No es Epic candidato.**

### Administración

**Cubierto** (consumo).

- Auth y Workspace LTS: quién entra al panel.  
- IAM nuevo / multi-tenant = BLOQ (frente Operación de clínicas del roadmap de negocio, no un Epic LTS consume-only).

### Soporte

**No cubierto.**

- Tickets IT, mesa de ayuda: no hay hecho LTS.  
- No es operación clínica ambulatoria del acto/caja. Resolverlo sería un dominio ITSM. **No es Epic candidato** (falla problema de negocio del recorte clínico y exigiría dominio nuevo).

### Otras operaciones habituales

| Proceso | Estado | Baseline / motivo |
|---------|--------|-------------------|
| Teleconsulta | Cubierto | WebRTC LTS (no reabrir) |
| Entrega de documento al paciente | Cubierto | Completion + v1.0; paciente v6.0 |
| Continuidad entre visitas | Cubierto | v3.0 / v4.0 |
| No-show / reagendar | Cubierto | Agenda / portal legado (no rediseñar) |
| Insumos / farmacia de clínica | No cubierto | Inventario no es dominio LTS |
| Laboratorio / imágenes | No cubierto | LIS/RIS no certificados; integraciones = hechos de mapeo externos (roadmap BA-INT, no Epic 3 de procesos) |
| Referencia a otro prestador | No cubierto | No hay dominio de referencia; D9 share congelado |
| Consentimiento informado formal | Parcial | Perfil/ficha no son un acto de consentimiento certificado |
| Multi-sede | No cubierto | BA-OPS del roadmap; exige org en Auth/Workspace, no un pulso nuevo |

Insumos, LIS/RIS, referencia y multi-sede **no** pasan el filtro de Epic: o duplican freeze, o crean dominio, o son otra iniciativa de negocio (integraciones / operación de clínicas) que **no** se abre aquí.

---

## Evaluación de Epics

Ningún vacío **No cubierto** o **Parcial** cumple los siete requisitos de Epic independiente consume-only.

Ejemplos de rechazo:

| Idea | Falla |
|------|--------|
| Consola Dirección Médica | Duplica v5.0 + BA Epic 1 (ya REJECTED) |
| Turnero / recepción | Hechos de sala + reloj; no LTS |
| Convenios | Dominio tarifario nuevo |
| Tesorería / caja diaria | Nueva identidad/hechos de dinero |
| Facturación SII / lotes | Hechos fiscales / pagador |
| QMS / calidad ISO | Dominio de calidad |
| BI / gerencia financiera | Duplica indicadores o pide P&amp;L no certificado |
| Visor PDF | Incidente Completion, no BA |
| Hub `/panel/clinica-digital` | Viola BA-5 / BA-12 de Epic 1 |
| Portal paciente 2.0 | Duplica v6.0; portal legado freeze |

**Epics candidatos: ninguno.**

---

## Cierre

Los procesos de una clínica ambulatoria moderna que **LTS puede operar** (atender, cobrar el Encounter, dirigir el centro, desatascar entrega/caja, agendar, documentar el acto, ver indicadores, auditar acto y asentamiento) están cubiertos por Core + Product v6.0 + Digital Clinic Epic 1.

Lo que falta son **hechos de negocio** (convenio, tesorería, inventario, QMS, integración normativa). Eso no es un Epic 3 de Business Applications sobre la plataforma actual.

**BUSINESS APPLICATIONS PHASE COMPLETE**

No se abre Epic 3 ni ningún otro Epic de Business Applications sin autorización explícita.
