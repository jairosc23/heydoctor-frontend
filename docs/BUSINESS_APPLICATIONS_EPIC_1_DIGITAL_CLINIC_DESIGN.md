# Business Applications Epic 1 — Digital Clinic

**Type:** business process design  
**Status:** design only — not authorized for implementation  
**Platform:** CORE_PLATFORM LTS · PRODUCT_PLATFORM v6.0 LTS  
**Date:** 2026-08-25  
**Analysis:** `docs/BUSINESS_APPLICATIONS_EPIC_1_DIGITAL_CLINIC_FUNCTIONAL_ANALYSIS.md` (aprobado)

Digital Clinic **no** es plataforma. **No** crea dominios Core. **No** crea identidades. **No** crea workflows Core. Es una **capa de procesos de negocio** que consume CORE_PLATFORM y PRODUCT_PLATFORM v6.0.

No modifica LTS, RC-19A, agenda existente, portal existente, Auth, Workspace, Foundation, Branding ni WebRTC.

---

## 1. Recorte confirmado

Incluido:

1. Atención  
2. Caja por Encounter  
3. Dirección Médica  
4. Operaciones  

Excluido expresamente: turnero, convenios, tesorería bancaria, QMS, Marketplace, IA, portal paciente, agenda nueva, recepción como turnero, admisión como motor de pagador, facturación masiva, inventario, RRHH.

Los cuatro procesos se **separan por responsabilidad**. Operaciones **no** reimplementa Atención, Caja ni Dirección: solo rutea al frente atascado.

---

## 2. Naturaleza del modelo

No hay objeto de dominio `DigitalClinic`. No hay `ClinicProcessId`. No hay persistencia de “el día de la clínica”.

La unidad de negocio sigue siendo:

| Hecho | Identidad LTS |
|-------|----------------|
| Consulta | `EncounterId` |
| Acto clínico | `ClinicalActId` |
| Asentamiento | `SettlementId` |

`CorrelationId` no es identidad de proceso.

Digital Clinic describe **quién hace qué, en qué superficie LTS, con qué entrada y salida**. Los writes clínicos ocurren solo en Completion (ficha). Los writes comerciales ocurren solo en Settlement (ficha). Product Platform se **consulta**, no se reescribe.

---

## 3. Proceso: Atención

### Objetivo

Atender al paciente, dejar el acto vigente cerrado (firmado, emitido) y dejar el documento listo para entrega cuando corresponda.

### Actor responsable

**Médico** (titular del Encounter).  
Apoyo: no hay segundo actor de write clínico.

### Entradas

- `EncounterId` de la consulta en curso (`draft` / `in_progress` / `completed` según el ciclo Encounter).  
- Si hay historia certificada: brief de pre-visita del `patientId` (último ítem de la línea).  
- Si se requiere hilo: línea longitudinal del mismo `patientId`.

### Salidas

- Encounter avanzado según ciclo LTS (el médico no inventa estados).  
- `ClinicalActId` vigente vía Completion (o handoff `absent` si no hay acto).  
- Documento `prescription` o `visit_summary` en estado certificado; `deliveredAt` nulo o no según entrega.

### Dependencias

- Core: Encounter, Clinical Completion, PCC (lectura del paquete vigente).  
- Product: v4.0 (arranque), v3.0 (hilo), v1.0 (solo **después**, si quedó `document_ready` sin entregar).

### Reglas

- Un `ClinicalActId` vigente por Encounter.  
- No mezclar actos.  
- El impago no impide el handoff clínico (PCC-5).  
- La entrega no se hace en un workflow nuevo: si el acto queda no entregado, el ítem aparece en v1.0.  
- Completar la visita no cobra.

### Restricciones

- No modificar ficha, Completion UI, v3.0, v4.0 ni v1.0.  
- No usar portal paciente.  
- No agenda nueva.  
- No emitir desde la cola (la cola solo señala; la entrega sigue en la ficha certificada).

### Interacción con Core

Write: solo workflows ya certificados de Encounter y Completion en la ficha.  
Read: estado Encounter, snapshot de Completion, `ContinuityPackage`.

### Interacción con Product Platform

- **Antes** de entrar: v4.0.  
- **Durante / entre visitas:** v3.0 si el médico necesita el hilo.  
- **Después** si no entregó: v1.0 (otro proceso: Operaciones / el mismo médico en ficha).

---

## 4. Proceso: Caja por Encounter

### Objetivo

Cobrar **esa** atención y dejar el asentamiento comercial en un estado certificado (pago verificado, factura si aplica, lock comercial cuando corresponda).

### Actor responsable

**Administración / caja** (titular del cobro).  
El médico no repara `lockAnomaly` ni inicia pago como proceso de Atención.

### Entradas

- `EncounterId` (típicamente `signed` para iniciar pago, según Settlement LTS).  
- Tablero v2.0 para localizar Encounters `signed_unpaid` o `lock_anomaly`.  
- Pulso v5.0 solo como **alerta** de presión comercial (no cubo).

### Salidas

- `SettlementId` existente (nunca acuñado por Digital Clinic).  
- `isPaid` / factura (`invoiceId`) / lock según el workflow Settlement ya certificado.  
- El Encounter puede pasar a `locked` por el flujo comercial LTS, no por un proceso nuevo.

### Dependencias

- Core: Commercial Settlement (write en la sección certificada de cierre). Encounter (espejo de status).  
- Product: v2.0 (trabajo de caja del centro), v5.0 (indicador agregado).

### Reglas

- Una caja = un Encounter = un `SettlementId`.  
- Completion no se escribe desde Caja.  
- Query string de pago no verifica (CS-5): solo el estado certificado.  
- Factura por Encounter es **salida de Settlement** tras pago verificado; no hay proceso de facturación masiva en este recorte.  
- `lockAnomaly` se **ve** en v2.0; no se “repara” en Digital Clinic.

### Restricciones

- No tesorería (arqueo, banco, SII periódico).  
- No convenios ni copago de pagador.  
- No caja diaria ni `CajaDiariaId`.  
- No Payku nuevo: se usa el Settlement LTS.

### Interacción con Core

Write: solo `ensureSettlement` / pago / factura **ya montados** en el cierre de Encounter.  
Digital Clinic no añade llamadas ni estados.

### Interacción con Product Platform

- v2.0: lista de trabajo comercial.  
- v5.0: si hay presión comercial, Operaciones/Dirección mandan a v2.0, no a inventar cubos.

---

## 5. Proceso: Dirección Médica

### Objetivo

En una ronda, saber si el centro está presionado en entrega, caja, continuidad o arranque, y **enviar** al equipo al tablero certificado correcto.

### Actor responsable

**Dirección médica** (puede delegar lectura a coordinación; no opera entrega ni cobro aquí).

### Entradas

- Una carga de Operational Pulse (v5.0): `pulseStatus`, KPIs, alertas.

### Salidas

- Decisión de frente: entrega (v1.0) y/o caja (v2.0).  
- Continuidad/brief se leen **solo como KPI** en el pulso; no se abre una ronda de fichas desde Dirección como proceso de este recorte.  
- Ningún write. Ningún snapshot persistido del “estado del día”.

### Dependencias

- Core: ninguno directo (el pulso ya compuso v1/v2/v4).  
- Product: v5.0; navegación de negocio a v1.0 y v2.0 (CTAs ya existentes en el pulso).

### Reglas

- El pulso no es cola. No se entregan documentos ni se cobra en Dirección.  
- `!isPaid` no se lee como fallo de entrega.  
- Handoff `absent` no se lee como impago.  
- No hay `asOf` de clínica: es una fotografía de carga, no “hoy” de reloj de dominio.

### Restricciones

- No QMS, no comités, no privilegios.  
- No lista de pacientes en el pulso.  
- No modificar v5.0.

### Interacción con Core

Ningún write. Ninguna reapertura de Completion/Settlement.

### Interacción con Product Platform

Solo v5.0 como superficie de dirección. v1.0 y v2.0 son **destinos de derivación**, no pantallas de Dirección.

---

## 6. Proceso: Operaciones

### Objetivo

Que el flujo del día no se atasque: si hay backlog de entrega, se entrega; si hay riesgo comercial, se cobra; si hay hueco de arranque, el médico usa el brief. Operaciones **coordina**; no cierra actos ni caja.

### Actor responsable

**Coordinación clínica / operación de sala** (no Dirección; no Caja; no el médico en este rol).

### Entradas

- Misma fotografía v5.0 que Dirección (o la carga que coordinación abra).  
- Detalle de trabajo: v1.0 (ítems a entregar), v2.0 (filas comerciales), v4.0 (brief de un paciente **cuando** el médico va a atender — eso es Atención, no un recálculo operativo).

### Salidas

- Asignación de frente a un responsable LTS: médico (Atención / entrega en ficha), caja (Caja por Encounter).  
- Cero writes propios.

### Dependencias

- Core: Encounter solo como clave de los ítems ya proyectados.  
- Product: v5.0 (síntesis), v1.0, v2.0; v4.0 no se reimplementa (pertenece a Atención).

### Reglas

- Si `pulseDeliveryBacklog > 0` → proceso Caja **no** sustituye entrega; se deriva a v1.0 y la entrega se completa en ficha (Atención / Completion).  
- Si `pulseCommercialAtRisk > 0` → se deriva a v2.0 y Caja por Encounter.  
- Si `pulseLastHandoffAbsent` o briefs vacíos → no se “inventa” acto; se informa al médico (Atención / v4.0).  
- Operaciones no concatena una quinta cola.

### Restricciones

- No inventario, boxes, turnos de personal.  
- No turnero.  
- No nueva superficie que liste pacientes “de hoy”.  
- No modificar v1–v5.

### Interacción con Core

Ningún write. No `run*` / `ensure*` nuevos.

### Interacción con Product Platform

Orquesta **lecturas** v5.0 → v1.0 | v2.0. No llama proyectores internos ni PCC/COD por su cuenta.

---

## 7. Superficies de negocio

No hay superficie nueva. No hay ítem de sidebar. No se usa PanelLayout como diseño. No se redefine navegación.

| Proceso | Superficie de negocio (URL LTS; consumo) |
|---------|------------------------------------------|
| Atención | `/panel/brief-previsita/[patientId]` → `/panel/consultas/[encounterId]` (cierre Completion). Hilo opcional: `/panel/continuidad-longitudinal/[patientId]`. |
| Caja por Encounter | `/panel/integridad-ingresos` → `/panel/consultas/[encounterId]` (cierre Settlement). |
| Dirección Médica | `/panel/pulso-operativo` |
| Operaciones | `/panel/pulso-operativo` y, según el frente, `/panel/entrega-clinica` o `/panel/integridad-ingresos` |

El listado RC-19A `/panel/consultas` se **consume** para abrir un `EncounterId`; no se rediseña.

Prohibido en este diseño: `/panel/clinica-digital`, menú nuevo, componentes, playbook como app.

---

## 8. Separación de responsabilidades

| Proceso | Hace | No hace |
|---------|------|---------|
| Atención | Acto clínico, entrega en ficha | Cobrar, dirigir el centro |
| Caja | Cobro y factura de **un** Encounter | Emitir receta, reparar lock como Completion |
| Dirección | Leer pulso y derivar | Entregar, cobrar, listar pacientes |
| Operaciones | Asignar frente atascado | Ejecutar Completion o Settlement |

Un mismo humano puede tener dos roles en el tiempo; el **proceso** no se fusiona.

---

## 9. Riesgos (negocio)

| Tipo | Riesgo | Mitigación de proceso |
|------|--------|------------------------|
| Operacional | El equipo espera un tablero único “clínica digital” y no usa las cuatro URLs | El diseño es el playbook de URLs LTS; no se añade chrome. |
| Operacional | Operaciones entrega o cobra “para ganar tiempo” | Writes solo en ficha Completion/Settlement; colas son RO. |
| Regulatorio | Tratar el pulso o v2.0 como expediente legal | El expediente es Encounter + cadenas Completion/Settlement; el pulso no se archiva. |
| Regulatorio | Entregar documento clínico condicionado al pago | PCC-5: Atención no espera Caja. |
| Comercial | Dirección lee impago como fallo clínico | Cubos v2.0 y pulso comercial son frente distinto a v1.0. |
| Comercial | Caja por Encounter se usa como tesorería del día | Fuera de recorte; no hay arqueo. |
| Clínico | Saltar el brief y retomar un acto viejo | Atención **entra** por v4.0 cuando hay historia; v4.0 no hace look-back. |
| Clínico | Operaciones pide “inventar” handoff `absent` | Prohibido mint de `ClinicalActId`. |
| Integración | Unir cita de agenda con Encounter en este Epic | Agenda existente intacta; no hay mapeo-identidad. |
| Integración | Llamar portal paciente o Payku fuera de Settlement | Portal y medios de pago LTS no se reabren. |

No se listan riesgos técnicos de Core (freeze, SHA, stores).

---

## 10. Criterios PASS (BA-1 … BA-12)

| ID | Criterio |
|----|----------|
| BA-1 | Consume únicamente CORE_PLATFORM y PRODUCT_PLATFORM v6.0 (superficies y writes ya certificados). |
| BA-2 | No crea dominios técnicos ni de negocio persistidos (`DigitalClinic`, convenio, tesorería). |
| BA-3 | No crea identidades. Claves: `EncounterId`, `ClinicalActId`, `SettlementId` copiados. |
| BA-4 | No crea workflows Core. Cero `run*` / `ensure*` / `observe*` / `persist*` / `save*` nuevos. |
| BA-5 | No modifica LTS (Core, Product v1.0–v6.0, RC-19A, agenda, portal, Auth, chrome). |
| BA-6 | Los cuatro procesos están separados (Atención ≠ Caja ≠ Dirección ≠ Operaciones). |
| BA-7 | Responsable único por proceso (§3–§6). |
| BA-8 | No duplica v1.0, v2.0, v3.0, v4.0, v5.0, Completion, Settlement ni ficha. |
| BA-9 | Atención no cobra. Caja no emite. Dirección y Operaciones no escriben. |
| BA-10 | Caja es por Encounter, no por día ni por convenio. |
| BA-11 | Dirección usa solo el pulso; deriva a v1.0/v2.0 sin embeberlos. |
| BA-12 | Superficies = URLs LTS existentes. Cero PanelLayout/nav/componentes nuevos. |

### FAIL

- Nueva ruta, sidebar, o “shell” de clínica digital.  
- Turnero, convenios, tesorería, QMS, portal paciente, agenda nueva.  
- Quinta identidad o mapeo cita–Encounter.  
- Reimplementar colas o cubos.  
- Reloj o LocalStorage como fuente del proceso.

---

## 11. Exclusiones de implementación

Este diseño **no** autoriza código. Cuando (si) se implemente, no será un módulo `lib/product-platform/**` ni una página `/panel` nueva: será operación y, como máximo, documentación de playbook **fuera** de baselines LTS, sin tocar archivos congelados.

---

**Siguiente paso:** aprobación explícita de este diseño. Hasta entonces no hay implementación.
