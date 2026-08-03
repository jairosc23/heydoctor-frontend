# HeyDoctor Copilot — Brand Foundation (SSOT)

| Field | Value |
|-------|-------|
| **Status** | Official brand SSOT |
| **Product** | HeyDoctor Copilot |
| **Baseline** | AEC-1 CLOSED / FROZEN |
| **Scope** | Product identity, naming, authority posture |
| **Out of scope** | Implementation, architecture changes, ADRs, code |

This document is the single source of truth for the official identity of **HeyDoctor Copilot** as a product within the HeyDoctor ecosystem.

---

# 1. Official Product Identity

**Product Name:**  
HeyDoctor Copilot

**Official Subtitle:**  
AI-First Clinical Intelligence

**Mission:**  
The unified clinical intelligence platform that empowers physicians before, during, and after every patient encounter.

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

NON-AUTHORITY  
Human-in-the-Loop  
Evidence-Driven

## Spanish

**HeyDoctor Copilot**  
Inteligencia Clínica AI-First

La plataforma unificada de inteligencia clínica que potencia a los médicos antes, durante y después de cada encuentro clínico con sus pacientes.

SIN AUTORIDAD CLÍNICA  
Médico en el Centro de la Decisión  
Basado en Evidencia

---

# 9. Future Scope

This document becomes the **SSOT** for all future UX, branding, and product decisions related to HeyDoctor Copilot.

- No implementation roadmap in this document.
- No architecture changes authorized by this document.
- No ADR created by this document.
- No code changes authorized by this document alone.
