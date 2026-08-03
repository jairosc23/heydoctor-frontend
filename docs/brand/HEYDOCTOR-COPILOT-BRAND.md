# HeyDoctor Copilot — Brand Foundation (SSOT)

| Field | Value |
|-------|-------|
| **Status** | **OFFICIAL · IDENTITY COMPLETE** |
| **Product** | HeyDoctor Copilot — official product (not a renamed feature) |
| **Baseline** | AEC-1 CLOSED / FROZEN |
| **Brand Promise** | **OFFICIAL · FROZEN** |
| **Scope** | Permanent product identity for all future UX decisions |
| **Out of scope** | Implementation, architecture, runtimes, backend, APIs, governance |

This document is the single source of truth for the official identity of **HeyDoctor Copilot** as a product within the HeyDoctor ecosystem.

---

# 1. Official Product Identity

HeyDoctor Copilot must always be presented as:

**HeyDoctor Copilot**  
**AI-First Clinical Intelligence**

It is an **official product**, not a renamed feature.

**Mission:**  
The unified clinical intelligence platform that empowers physicians before, during, and after every patient encounter.

---

# 1A. Brand Promise — OFFICIAL / FROZEN

| Field | Value |
|-------|-------|
| **Status** | **OFFICIAL** |
| **Freeze** | **FROZEN** |
| **Change control** | Future modifications require explicit **Product + Architecture** approval |

**Immutable Brand Promise:**

> The physician starts the encounter.  
> HeyDoctor Copilot understands the clinical context.

This sentence is part of the **official product identity**.

- It is **NOT** a marketing slogan.  
- It is **NOT** advertising copy.  
- It **IS** the product philosophy.

**Use consistently in:** brand SSOT, Product Experience, UX principles, first-impression identity framing, future presentations.  
**Do not overuse in UI.** Identity framing — not every screen.

### Why this promise defines HeyDoctor Copilot

| Principle | How the Brand Promise expresses it |
|-----------|--------------------------------------|
| **AI-FIRST** | Intelligence is already oriented to clinical context when the encounter begins — value before the physician has to ask. |
| **Human-in-the-Loop** | The physician **starts** the encounter. The product does not start, own, or close clinical action. |
| **Clinical Intelligence** | The promise is understanding **clinical context**, not chatting or entertaining. |
| **NON-AUTHORITY** | “Understands” is advisory comprehension — not decide, confirm, emit, or apply. |
| **Physician remains in control** | Subject of the first sentence is the physician. Copilot is the second actor, in service of the first. |

---

# 2. Brand Principles

- **AI-First** — Clinical intelligence is a first-class part of the encounter experience, not an add-on.
- **Human-in-the-Loop** — The physician remains the decision-maker; the Copilot assists, never replaces clinical judgment.
- **Evidence-Driven** — Insights and recommendations are grounded in evidence and provenance where available.
- **NON-AUTHORITY** — Copilot outputs are advisory. They do not confirm, emit, or apply clinical actions.
- **Physician-Centered** — Language, flow, and priorities serve the clinician’s work before, during, and after the encounter.
- **Explainable** — Users can inspect why an insight or recommendation appears.
- **Safe by Design** — Safety boundaries, governance seals, and authority separation are product invariants.

---

# 3. Product Vision

One unified AI experience.  
One brand.  
One Copilot.  
Multiple internal capabilities.

---

# 4. User-facing Capabilities

| Capability | Description |
|------------|-------------|
| **Clinical Insights** | Real-time and encounter-contextual clinical signals that help the physician see what matters in the case. |
| **Assistant** | Conversational and generative assistance for clinical orientation, questions, and composition support. |
| **Recommendations** | Suggested next considerations for the physician to review; never automatic clinical orders. |
| **Explainability** | Transparent rationale, provenance, and limits of advisory intelligence. |
| **Evidence** | Supporting clinical evidence and references that back insights and recommendations. |

---

# 5. Internal Architecture (reference only)

The following names are **implementation details**. They must **not** be used as user-facing product names.

| Internal name | Role (reference) |
|---------------|------------------|
| AssistOrchestrator | SSOT for assist disclosure / fatigue orchestration |
| Liquid Assist Plane | Liquid experience assist surface |
| ClinicalCopilotDrawer | Primary Copilot drawer shell |
| Medical Copilot Runtime | Medical Copilot runtime / workspace internals |
| W5 Clinical Intelligence | Deterministic clinical intelligence plane |
| Steward | Steward review / governance harness |
| HAB | Human Authority Boundary (clinical authority) |
| PE / COS | Prescription Engine / Clinical Order surfaces (authority) |

Internal names remain unchanged. Branding does not rename runtimes, APIs, or contracts.

---

# 6. Authority Model

| Plane | Authority |
|-------|-----------|
| MODEL | **NON-AUTHORITY** |
| Clinical Intelligence | **NON-AUTHORITY** |
| HAB / PE / COS | **Authority** |

**Hard rules**

- No Confirm from Copilot.
- No Emit from Copilot.
- No Apply from Copilot.

---

# 7. User-facing Naming Rules

**Official visible brand:**  
HeyDoctor Copilot

**Preferred sections:**

- Clinical Insights
- Assistant
- Recommendations
- Explainability
- Evidence

**Avoid exposing** (unless strictly required for developers):

- Medical Copilot
- Clinical Copilot
- W5
- Clinical Assist

---

# 8. Official Brand Statement

## English

**HeyDoctor Copilot**  
AI-First Clinical Intelligence

The unified clinical intelligence platform that empowers physicians before, during, and after every patient encounter.

**Brand Promise — OFFICIAL / FROZEN**  
The physician starts the encounter.  
HeyDoctor Copilot understands the clinical context.

NON-AUTHORITY  
Human-in-the-Loop  
Evidence-Driven

## Spanish

**HeyDoctor Copilot**  
Inteligencia Clínica AI-First

La plataforma unificada de inteligencia clínica que potencia a los médicos antes, durante y después de cada encuentro clínico con sus pacientes.

**Promesa de producto — OFICIAL / CONGELADA**  
El médico inicia el encuentro.  
HeyDoctor Copilot comprende el contexto clínico.

SIN AUTORIDAD CLÍNICA  
Médico en el Centro de la Decisión  
Basado en Evidencia

---

# 9. Future Product Rule

Future AI capabilities **must extend HeyDoctor Copilot**.

- Do **not** create parallel AI brands.  
- Do **not** introduce alternate clinician-facing AI product names.  
- Everything must naturally fit under:

**HeyDoctor Copilot**  
**AI-First Clinical Intelligence**

Internal runtimes and planes may keep engineering names; the **user-facing product** remains one.

---

# 10. Future Scope

This document is the **permanent product identity SSOT** for all future UX, branding, and product decisions related to HeyDoctor Copilot.

- Brand Promise is **OFFICIAL / FROZEN** (see §1A).  
- No implementation roadmap in this document.  
- No architecture, runtime, backend, API, or governance changes authorized by this document alone.  
- AEC-1 remains CLOSED / FROZEN.

---

# 11. Brand Constitution

Philosophical foundation of HeyDoctor Copilot. Permanent.

- **One Product**
- **One Identity**
- **One Copilot**
- **AI-First**
- **Human-in-the-Loop**
- **Evidence-Driven**
- **NON-AUTHORITY**
- **Physician Always in Control**

Any future capability, surface, or UX decision that violates this constitution does not belong under HeyDoctor Copilot.
