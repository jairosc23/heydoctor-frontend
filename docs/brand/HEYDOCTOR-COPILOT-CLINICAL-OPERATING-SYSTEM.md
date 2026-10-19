# HeyDoctor Copilot — Clinical Operating System (SSOT)

| Field | Value |
|-------|-------|
| **Status** | **OFFICIAL · FROZEN** |
| **Type** | Product philosophy SSOT — Clinical Operating System |
| **Product** | HeyDoctor Copilot — AI-First Clinical Intelligence |
| **Baseline** | Brand SSOT · Product Experience · Workspace + Navigation SSOT (approved) |
| **Architecture** | AEC-1 CLOSED / FROZEN · runtimes / APIs / contracts unchanged |
| **Change control** | Requires explicit **Product + Architecture** approval |
| **Scope** | Definitive product philosophy before P0 implementation |
| **Out of scope** | Code, refactors, PRs, runtime renames, backend changes |

This document is the **single source of truth** for HeyDoctor Copilot as the **Clinical Operating System** of the clinical encounter.

It does **not** authorize implementation by itself.  
It **does** freeze the product philosophy that P0+ must obey.

**Related SSOTs (do not supersede Brand Promise):**

| Document | Role |
|----------|------|
| `HEYDOCTOR-COPILOT-BRAND.md` | Identity · Brand Promise · Constitution |
| `HEYDOCTOR-COPILOT-PRODUCT-EXPERIENCE.md` | First impression · Insights HOME · continuum UX |
| `HEYDOCTOR-COPILOT-PREMIUM-EXPERIENCE.md` | Post-launch polish backlog |
| **This document** | Clinical Operating System · Encounter Memory · Flow · Timeline · Live Intelligence |

---

# 1. Product Vision

## 1.1 What HeyDoctor Copilot is

**HeyDoctor Copilot** is the **Clinical Operating System** of the patient encounter.

It is the unified clinical intelligence layer that orients to the case when the physician starts the encounter, surfaces live understanding without a prompt, and accompanies documentation, continuity, review, and close — always advisory, always under physician control.

| It is | It is not |
|-------|-----------|
| AI-First Clinical Intelligence | A chatbot |
| One Workspace for the encounter | A drawer of isolated tabs |
| One Encounter Memory | A chat transcript |
| One intelligence with multiple views | Parallel AI products |
| Advisory · Human-in-the-Loop | Clinical authority |
| The operating surface of the encounter | A renamed “Medical Copilot” brand |

**Official presentation (always):**

**HeyDoctor Copilot**  
**AI-First Clinical Intelligence**

**Mission:**  
The unified clinical intelligence platform that assists physicians before, during, and after every patient encounter.

## 1.2 Why it is NOT chat-first

Chat-first products wait for the physician to invent a prompt before delivering value.

HeyDoctor Copilot inverts that:

1. The physician starts the encounter.  
2. Copilot already orients to clinical context.  
3. **Clinical Insights (HOME)** prove understanding **before** any prompt.  
4. Assistant is a **capability** — used when the physician chooses — never the destination.

A prompt box as the first viewport would violate the Brand Promise and the Clinical Operating System model.

## 1.3 Why it is AI-First Clinical Intelligence

**AI-First** means intelligence is a first-class part of the encounter — not an add-on, not a side panel that sleeps until asked.

**Clinical Intelligence** means the object of understanding is **clinical context** (patient, encounter, evidence, continuity, decisions) — not conversation entertainment.

Value on open. Context before interaction. One product. One Workspace.

---

# 2. Encounter Intelligence Model

## Brand Promise — OFFICIAL / FROZEN

> The physician starts the encounter.  
> HeyDoctor Copilot understands the clinical context.

| Actor | Role |
|-------|------|
| **Physician** | Starts, owns, decides, confirms, emits, applies, signs |
| **HeyDoctor Copilot** | Understands, surfaces, suggests, explains, never seizes authority |

## Lifecycle of accompaniment

| Phase | Copilot role |
|-------|----------------|
| **Before** | Pre-visit context, continuity signals, prep hypotheses (advisory) |
| **During** | Live Insights, Voice Dictation, Assistant on demand, documentation gaps, risks |
| **After** | Review & Sign journey, evidence for close, continuity handoff (advisory until HITL) |

Copilot **accompanies** the encounter. It does not start it, own it, or close clinical action without Human-in-the-Loop.

---

# 3. Encounter Memory (SSOT)

| Field | Value |
|-------|-------|
| **Implementation status** | **P0 MINIMAL LIFECYCLE — IMPLEMENTED** |
| **P0 scope** | encounter status · patient context · active problems · decisions · workflow phase · dictation buffer ref · pending actions |
| **Out of P0** | Longitudinal intelligence · persistence beyond Encounter unmount |

Encounter Memory is **OFFICIAL** philosophy with a **minimal P0 runtime SSOT** (`EncounterMemoryProvider`).  
Full depth (timeline/live projection unification) remains iterative — not a second product.

## 3.1 Definition

**Encounter Memory** is the living, structured memory of **this** clinical encounter.

It is **not**:

- a chat history  
- a message log  
- a transcript dump as product truth  
- a separate “memory product”

It **is** the shared clinical state that every capability reads and that Live Intelligence updates as the encounter evolves.

## 3.2 Canonical contents

Encounter Memory holds (as available for the encounter):

| Domain | Examples |
|--------|----------|
| **Chief concern** | Motivo de consulta |
| **Active problems** | Problemas activos |
| **Diagnostic hypotheses** | Hipótesis diagnósticas (advisory) |
| **Medications** | Medicamentos activos / relevantes |
| **Exams / orders** | Exámenes, estudios, órdenes en contexto |
| **Decisions** | Decisiones clínicas registradas o en revisión HITL |
| **Open tasks** | Tareas pendientes / gaps de documentación |
| **Encounter state** | Fase del encuentro · readiness · signed/locked |

Additional signals (vitals, allergies, continuity artifacts, evidence refs) attach to the same memory model as the encounter accumulates context — they do not spawn parallel memories.

## 3.3 Consumption rule

**Every capability consumes Encounter Memory.**

| Capability | Relationship to Memory |
|------------|------------------------|
| Clinical Insights | Projects live understanding **from** Memory |
| Voice Dictation | May propose updates **into** Memory (buffer; no silent EMR write) |
| Assistant | Answers / composes **against** Memory |
| Recommendations | Considers next steps **from** Memory |
| Explainability | Explains projections **using** Memory + provenance |
| Evidence | Grounds claims **linked to** Memory |
| Continuity | Bridges longitudinal context **into** Memory |
| Review & Sign | Reviews Memory readiness before close / HITL / sign |

No capability may invent a private parallel “truth” that contradicts Encounter Memory for the same encounter.

## 3.4 Authority boundary

Encounter Memory is **advisory clinical state for intelligence**.

- Persistence to EMR / SOAP / sign requires **Human-in-the-Loop** and existing governed paths.  
- Dictation buffers and provisional hypotheses are **not** automatic chart writes.  
- NON_AUTHORITY applies to all Memory-derived surfaces.

---

# 4. Clinical Intelligence Flow

One intelligence. Multiple views. Same Encounter Memory.

```
Clinical Insights  →  Voice Dictation  →  Assistant  →  Recommendations
     (HOME)              (capture)         (on need)        (review)
        →  Explainability  →  Evidence  →  Continuity  →  Review & Sign
              (trust)         (support)    (longitudinal)     (close)
```

| View | Job |
|------|-----|
| **Clinical Insights** | What is understood **now** (HOME · no prompt) |
| **Voice Dictation** | Capture speech into an editable buffer toward Memory |
| **Assistant** | Ask / compose when the physician chooses |
| **Recommendations** | Next considerations to review (never silent orders) |
| **Explainability** | Why this appeared · limits |
| **Evidence** | What supports the insight / recommendation |
| **Continuity** | Longitudinal context for this patient / encounter |
| **Review & Sign** | HITL review · Finish Encounter · bridge to signature |

**Rules**

- Insights remain HOME on open.  
- Switching views does **not** restart the product or the session.  
- Physicians should feel: *“I am using one intelligence.”* — not *“I am changing apps.”*

**Runtime companions (not separate products):**

- Runtime status  
- Session state  
- HITL  
- Finish Encounter  

These appear in the Workspace (runtime strip and/or Review & Sign). They are part of the same Clinical Operating System — not a second brand.

---

# 5. Clinical Timeline

## 5.1 Definition

The **Clinical Timeline** is an ordered stream of **clinically relevant encounter events** — not a chat thread.

It answers: *What mattered in this encounter, and when?*

## 5.2 Event classes (conceptual)

Examples of timeline events (non-exhaustive):

- Encounter opened / phase changes  
- Documentation milestones (anamnesis, vitals, exam, diagnosis, plan)  
- Insight surfaced / risk flagged (advisory)  
- Dictation session started / finalized (buffer events)  
- Recommendation reviewed / deferred  
- Continuity signal attached  
- HITL approve / reject / dispose  
- Governed persistence / sign (when they occur via existing clinical paths)

## 5.3 What the Timeline is not

| Not | Why |
|-----|-----|
| Chat history | Chat is not the product model |
| Full telemetry dump | Physicians need clinical signal, not noise |
| Authority log that replaces HAB | Authority remains outside Copilot |

Timeline and Encounter Memory are complementary: Memory is the **state**; Timeline is the **sequence of meaningful changes**.

---

# 6. Live Intelligence

## 6.1 Definition

**Live Intelligence** means the Workspace continuously projects insights from Encounter Memory and encounter signals **in real time** (as data allows), **without waiting for physician prompts**.

## 6.2 Domains of live projection

| Domain | Intent (advisory) |
|--------|-------------------|
| Medication | Relevant med context / conflicts / gaps to review |
| Documentation | Missing or weak documentation signals |
| Risk | Safety / acuity / continuity risks to surface |
| Evidence | Support / provenance for what is shown |
| Follow-up | Pending tasks / next-step considerations |

## 6.3 Rules

- Live Insights prove the Brand Promise in experience.  
- Silence is acceptable when there is nothing clinically useful to say (no filler chat).  
- Live Intelligence never Confirm / Emit / Apply.  
- Degradation is fail-closed and honest — not fake certainty.

---

# 7. Product Principles

| Principle | Meaning |
|-----------|---------|
| **NON_AUTHORITY** | Copilot advises. It does not confirm, emit, or apply. |
| **Human-in-the-Loop** | Clinical persistence and close require the physician. |
| **Evidence-Driven** | Insights and recommendations prefer grounded provenance. |
| **Physician in Control** | The physician starts and remains the decision-maker. |
| **AI-First** | Intelligence before interaction; value on open. |
| **One Product** | One brand · one Copilot · no parallel AI brands. |
| **One Workspace** | HeyDoctor Copilot Workspace is the operating surface. |
| **One Encounter Memory** | P0: minimal in-encounter SSOT. No longitudinal persistence. |
| **One Navigation SSOT** | Encounter section navigation has a single owner (dynamic chrome offsets, re-subscribable observer, deterministic navigate). |

### Governing question (mandatory)

Every future product or UX decision must answer:

> **Does this help HeyDoctor Copilot understand the clinical context while keeping the physician in control — as one Workspace, one Encounter Memory, and one intelligence?**

If the answer is **NO**, it does not belong in HeyDoctor Copilot.

---

# 8. Relationship to existing architecture

This document freezes **product philosophy**. It does **not** rename or replace engineering contracts.

| Layer | Rule |
|-------|------|
| Runtimes / packages | Internal names (e.g. medical-copilot libs) may remain; **user-facing brand** is HeyDoctor Copilot only |
| APIs / routes | Unchanged by this SSOT |
| Providers / session | Unchanged contracts; Workspace mounts existing session/workflow concerns |
| Liquid / AssistOrchestrator / CopilotPresence | Presence and assist composition — open Workspace; not a second product |
| W5 Clinical Steward | Advisory cards remain NON_AUTHORITY |
| HAB / Confirm / Emit / Apply | Authority seam **outside** Copilot |
| EPIC-3 HITL acts (H1–H4) | Preserved; Workspace presents one physician journey |
| Brand SSOT / Promise | Still OFFICIAL / FROZEN — this document extends philosophy, does not rewrite identity |
| Navigation SSOT | Engineering baseline approved separately; this document mandates **One Navigation SSOT** as product principle |
| LAB `/medical-copilot` | Optional deep/engineering surface — never the product brand |

**Future Product Rule:** No parallel AI brands. No second “Copilot.” No chat-first fork.

---

# 9. Workspace model (product baseline)

Approved architectural baseline (implementation tracked separately as P0+):

```
Encounter (ConsultationWorkspace — shell of record)
└─ HeyDoctor Copilot Workspace
   ├─ Hero (identity · NON_AUTHORITY · Brand Promise sparingly)
   ├─ Runtime strip (status · session · HITL affordances)
   ├─ Capability continuum (views of one intelligence)
   └─ Capability host → consumes Encounter Memory (P0 minimal SSOT)
        + Clinical Timeline (events) — deepen post-P0
        + Live Intelligence (Insights HOME)
```

**P0 note:** Runtime strip and Workspace capabilities read Encounter Memory for status/phase/problems/dictation ref/pending actions. Longitudinal depth stays out of scope.

Navigation of chart sections (Continuity chrome, Signature, Foundation, future sections) obeys **One Navigation SSOT** so sticky chrome and observers never desync again.

---

# 10. Freeze statement

| Field | Value |
|-------|-------|
| **Status** | **OFFICIAL · FROZEN** |
| **Effective** | Upon merge to the product documentation baseline |
| **P0 gate** | P0 implementation must not violate this SSOT |

Changes to this document require explicit **Product + Architecture** approval.

---

# 11. Non-goals

- Implementation details, file moves, or PRs in this document  
- Renaming runtimes, APIs, providers, or routes  
- Granting Copilot clinical authority  
- Defining chat history as Encounter Memory  
- Shipping LAB Governed\* dumps as the product Workspace  
- Restoring “Medical Copilot” as a user-facing brand  

---

**End of SSOT — HeyDoctor Copilot Clinical Operating System**
