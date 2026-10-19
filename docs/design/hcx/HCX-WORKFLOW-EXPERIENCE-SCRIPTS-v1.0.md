# HCX Workflow Experience Scripts v1.0  
## Canonical Experience Scripts for Clinical Workflows

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 8 — Workflow Experience Scripts |
| **Document** | HCX Workflow Experience Scripts |
| **Version** | 1.0 |
| **Status** | Official — **no implementation · no UI · no code** |
| **Consumes** | Role Cognition · Communication · Cognition · Blueprints · Surfaces |
| **Path** | `docs/design/hcx/HCX-WORKFLOW-EXPERIENCE-SCRIPTS-v1.0.md` |

**Laws:** Spec only · no React · no CSS · no commits.  
**Law:** Dispose ≠ Confirm ≠ Emit · Ack ≠ Confirm · Book ≠ Confirm · Join ≠ Confirm.

Each script: Cognitive flow · User interactions · AI participation · Human Authority checkpoints · Communication patterns · Accessibility · Error recovery · Cross-device continuity · Relationship with COS.

---

## 1. Consultation

| Field | Spec |
|-------|------|
| **Cognitive flow** | Orient → bind context → explore → (assist?) → document/compose → HAB if irreversible → complete |
| **User interactions** | Open encounter · confirm identity · navigate stages · save drafts · close/sign |
| **AI** | Optional dock; Dispose only |
| **HAB** | Sign/finalize and any irreversible act |
| **Communication** | “Contexto vinculado/no vinculado”; Confirmación de autoridad |
| **Accessibility** | Context status announced; HAB trap |
| **Error recovery** | Unbound → rebind; preserve notes |
| **Cross-device** | sm: journey strip + full-screen HAB |
| **COS** | E01 host · E05 bind · E03 journey · E04 HAB |

---

## 2. Documentation

| Field | Spec |
|-------|------|
| **Cognitive flow** | Section focus → draft → ready → HAB if finalize irreversible → never emit from notes |
| **User interactions** | Edit SOAP/sections · mark complete · request authority if required |
| **AI** | Suggest phrasing → Dispose accept-to-draft |
| **HAB** | Documentation finalize when irreversible |
| **Communication** | “Borrador” vs “Lista para confirmación” |
| **Accessibility** | Field labels; don’t flood SR on AI stream |
| **Error recovery** | Preserve text; retry save |
| **Cross-device** | Full-width editor on sm |
| **COS** | E06 drafts · E04 for finalize · Documentation ≠ Emit |

---

## 3. Therapy Planning

| Field | Spec |
|-------|------|
| **Cognitive flow** | Intent → plan draft → Ready ≠ Confirm → HAB → (later) Emit |
| **User interactions** | Compose plan · mark Ready · open HAB · never fused emit CTA |
| **AI** | Protocol/suggest meds → Dispose to draft |
| **HAB** | therapy_ready / prescription_pre_emit |
| **Communication** | Plan ≠ Ready ≠ Confirm ≠ Emit lexicon |
| **Accessibility** | Clear Ready vs Confirm labels |
| **Error recovery** | Keep plan draft on HAB reject/modify |
| **Cross-device** | Composer primary; AI sheet on sm |
| **COS** | E07 intents · E04 · E11 later |

---

## 4. Clinical Orders

| Field | Spec |
|-------|------|
| **Cognitive flow** | Build order draft → validate → Ready ≠ Emit → HAB when irreversible → owned path |
| **User interactions** | Add/remove items · validate · escalate to HAB |
| **AI** | Suggest orders → Dispose only |
| **HAB** | orders_ready when irreversible |
| **Communication** | “Orden en borrador” / “Requiere confirmación” |
| **Accessibility** | List semantics; deny language clear |
| **Error recovery** | Validation field errors; no silent dispatch |
| **Cross-device** | Builder full width sm |
| **COS** | E08 pre-emit · Orders ≠ Emit |

---

## 5. Prescription Review

| Field | Spec |
|-------|------|
| **Cognitive flow** | Review draft → HAB Confirm → Emit status (post-HAB) → never Confirm+Emit button |
| **User interactions** | Review lines · Confirm · separate Emit when available |
| **AI** | Safety explain peripheral; Dispose ≠ Confirm |
| **HAB** | prescription_pre_emit required before emit |
| **Communication** | Split CTAs; “Autoridad registrada — pendiente de emisión” |
| **Accessibility** | Assertive HAB; announce emit result separately |
| **Error recovery** | Emit fail does not revoke Confirm silently without copy |
| **Cross-device** | HAB full-screen sm |
| **COS** | E04 · E11 PE sole emitter |

---

## 6. Longitudinal Follow-up

| Field | Spec |
|-------|------|
| **Cognitive flow** | Orient timeline → read inform-only → optional new encounter |
| **User interactions** | Filter · pin · open read detail |
| **AI** | Summarize history peripheral; no renew/emit |
| **HAB** | None from timeline alone |
| **Communication** | Inform-only; no “autorizar desde timeline” |
| **Accessibility** | List + pins announced |
| **Error recovery** | Empty ≠ “sin hallazgos clínicos” |
| **Cross-device** | Rail xl; river sm |
| **COS** | E10 inform-only · Longitudinal ≠ Emit |

---

## 7. Telemedicine

| Field | Spec |
|-------|------|
| **Cognitive flow** | Join → connection truth → clinical work in parallel → leave |
| **User interactions** | Join/leave · AV controls · clinical panels |
| **AI** | Same Dispose rules; never claim “conectado” falsely |
| **HAB** | Same as in-person for irreversible acts |
| **Communication** | Connection state textual; amber/critical recovery |
| **Accessibility** | Live region for connection loss |
| **Error recovery** | Large reconnect; block HAB/emit if guarantees fail |
| **Cross-device** | Call chrome sticky; clinical stack below |
| **COS** | E17 modality · Join ≠ Confirm · media ≠ authority |

---

## 8. Emergency Flow

| Field | Spec |
|-------|------|
| **Cognitive flow** | Detect critical → freeze irreversible unsafe acts → recover → resume |
| **User interactions** | Acknowledge critical · rebind · reconnect · retry |
| **AI** | Pause prominence; manual path intact |
| **HAB** | Blocked if unbound/offline without guarantees |
| **Communication** | Qué falló → por qué → qué hacer |
| **Accessibility** | Assertive live regions; color not sole |
| **Error recovery** | Preserve clinician text; no false success |
| **Cross-device** | Sticky top banners all sizes |
| **COS** | E05 fail-closed · system z-band above assist |

---

## 9. Administrative Flow

| Field | Spec |
|-------|------|
| **Cognitive flow** | Scope clinic → configure → preview → apply admin confirm ≠ HAB |
| **User interactions** | Users/hours/flags · save configuration |
| **AI** | Optional config help; no clinical Confirm |
| **HAB** | Never for patient clinical acts |
| **Communication** | “Guardar configuración” not “Confirmar indicación” |
| **Accessibility** | Form errors per field |
| **Error recovery** | Config rollback messaging |
| **Cross-device** | Desktop preferred |
| **COS** | Admin presentation cannot disable HAB/PE |

---

## 10. Enterprise Coordination

| Field | Spec |
|-------|------|
| **Cognitive flow** | Portfolio → select site/clinic → drill into role workspace → return |
| **User interactions** | Scope change explicit · drill-in · portfolio ack |
| **AI** | Portfolio insights advisory only |
| **HAB** | Only after drill-in as Physician in clinic context |
| **Communication** | Breadcrumb scope; never “enterprise approved Rx” |
| **Accessibility** | Announce scope changes |
| **Error recovery** | Cross-tenant deny → last safe node |
| **Cross-device** | Desktop portfolio; mobile alerts |
| **COS** | Topology fail-closed · no org-level patient HAB |

---

## Cross-script matrix

| Script | HAB | Emit | AI Dispose |
|--------|-----|------|------------|
| Consultation | Yes (irreversible) | Post-HAB | Optional |
| Documentation | Finalize | No | Optional |
| Therapy | Ready→Confirm | Later PE | Optional |
| Orders | When irreversible | No from builder | Optional |
| Rx Review | Required | Post-HAB | Peripheral |
| Longitudinal | No | No | Summarize only |
| Telemedicine | Same as care | Same as care | Same |
| Emergency | Gated | Gated | De-emphasized |
| Admin | No clinical | No | Config only |
| Enterprise | Drill-in only | No at org | Advisory |

---

## Recommended next phase

**HCX Phase 9 — Implementation Handoff Pack** (tokenized string slots + component inventory mapping scripts → surfaces) **or** Content & Microcopy Matrix if copy production is next.

---

## Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| Commits required | **None** |

**End of HCX Workflow Experience Scripts v1.0.**
