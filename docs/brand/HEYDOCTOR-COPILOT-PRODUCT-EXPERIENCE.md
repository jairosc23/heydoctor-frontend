# HeyDoctor Copilot — Final Product Experience Refinement

| Field | Value |
|-------|-------|
| **Baseline** | PR #91 brand foundation |
| **Type** | Final product experience + identity alignment |
| **Mindset** | Official PRODUCT — not a renamed feature, not UI sections |
| **Brand Promise** | **OFFICIAL · FROZEN** (see Brand SSOT §1A) |
| **Architecture** | Unchanged · AEC-1 CLOSED / FROZEN |
| **Implementation** | Not in this document |

---

## 1. Product identity

HeyDoctor Copilot must always be presented as:

**HeyDoctor Copilot**  
**AI-First Clinical Intelligence**

The unified clinical intelligence platform that assists physicians before, during and after every patient encounter.

**Brand Promise — OFFICIAL / FROZEN**

> The physician starts the encounter.  
> HeyDoctor Copilot understands the clinical context.

| Attribute | Rule |
|-----------|------|
| Status | **OFFICIAL · FROZEN** |
| Change control | Requires explicit Product + Architecture approval |
| Nature | Product philosophy — **not** marketing slogan, **not** advertising copy |

| It is | It is not |
|-------|-----------|
| A clinical intelligence platform | A chatbot |
| One intelligence with multiple views | A drawer with tabs |
| Value before interaction | A prompt box waiting for input |
| Advisory · Human-in-the-Loop | Clinical authority |

Comparable *clarity* (not visual clone): Microsoft Copilot · GitHub Copilot · Cursor · Claude — the user knows the product in seconds.

### Brand Promise — philosophy

| Principle | Encoded in the promise |
|-----------|------------------------|
| **AI-FIRST** | Context is already understood when the encounter starts — intelligence before interaction. |
| **Human-in-the-Loop** | The physician starts; Copilot does not seize the encounter. |
| **Clinical Intelligence** | The object is clinical context, not chat. |
| **NON-AUTHORITY** | “Understands” ≠ decides, confirms, emits, or applies. |
| **Physician remains in control** | First actor = physician. Copilot serves. |

**Usage:** identity docs, UX principles, first-impression framing, presentations.  
**Not** repeated on every UI surface — identity, not chrome spam.

---

## 1b. UX principles (product)

### Governing question (mandatory)

Every future UX decision for HeyDoctor Copilot must answer:

> **Does this help HeyDoctor Copilot understand the clinical context while keeping the physician in control?**

If the answer is **NO**, it does **not** belong inside HeyDoctor Copilot.

### Supporting principles

1. **Physician first** — the encounter begins with the clinician; Copilot orients to context.  
2. **Intelligence before interaction** — live Insights prove the Brand Promise without a prompt.  
3. **One intelligence** — capabilities are views, not destinations that restart the product.  
4. **Trust ambient** — NON-AUTHORITY and Human-in-the-Loop are felt, not lectured.  
5. **Promise sparingly in UI** — Brand Promise frames identity; Insights prove it in experience.  
6. **Constitution alignment** — One Product · One Identity · One Copilot · AI-First · HITL · Evidence-Driven · NON-AUTHORITY · Physician Always in Control.

---

## 2. First impression (hero experience)

The first viewport is **the product**, not navigation.

```
Identity
  HeyDoctor Copilot
  AI-First Clinical Intelligence
        ↓
Mission (platform)
  The unified clinical intelligence platform that assists
  physicians before, during and after every patient encounter.
        ↓
Brand Promise (identity — use sparingly in UI)
  The physician starts the encounter.
  HeyDoctor Copilot understands the clinical context.
        ↓
Clinical Insights (live)     ← HOME · proves the promise in experience
        ↓
Capabilities                 ← secondary · same intelligence
        ↓
Assistant                    ← only when needed
```

### Rules
- No chat composer as the first thing.
- No primary “section switcher” competing with the hero.
- Live insights appear **without a prompt** — experiential proof of the Brand Promise.
- Quiet **NON-AUTHORITY** badge in the hero.
- Persistent trust footer (see §6).
- Brand Promise may appear once in identity framing / presentations; do **not** stamp it on every capability view.

---

## 3. Information hierarchy

```
┌─────────────────────────────────────────────┐
│  HERO — Product identity                    │
│  Name · Subtitle · Mission · NON-AUTHORITY  │
│  Brand Promise (identity; sparingly in UI)  │
├─────────────────────────────────────────────┤
│  HOME — Clinical Insights (live)            │
│  Experiential proof: understands context    │
│  for this patient / encounter — right now.  │
├─────────────────────────────────────────────┤
│  CONTINUUM — Same intelligence, other views │
│  Assistant · Recommendations ·              │
│  Explainability · Evidence                  │
├─────────────────────────────────────────────┤
│  FOOTER — Trust (always)                    │
│  You remain in control · Human-in-the-Loop  │
│  · Evidence-driven · NON-AUTHORITY          │
└─────────────────────────────────────────────┘
```

| Layer | Role | Physician perception |
|-------|------|----------------------|
| Hero | Product | “This is HeyDoctor Copilot.” |
| Insights HOME | Immediate value | “This understands my patient.” |
| Continuum | Depth on demand | “I can go deeper in the same intelligence.” |
| Footer | Trust | “I remain in control.” |

---

## 4. Clinical Insights = HOME

Everything else **expands from** Clinical Insights.

- Insights are the default destination of the product.
- Assistant is a **capability**, not the destination.
- Recommendations / Explainability / Evidence deepen the same case — they do not restart a different tool.

**AI-FIRST:** Intelligence before interaction. Value on open. No prompt required.

---

## 5. Capability philosophy

Do **not** make users think: *“I am changing sections.”*  
Make them feel: *“I am using one intelligence.”*

| View | Job in the same intelligence |
|------|------------------------------|
| **Clinical Insights** | What was detected for this encounter (HOME) |
| **Assistant** | Ask / compose when the physician chooses |
| **Recommendations** | Next considerations to review (never orders) |
| **Explainability** | Why this appeared · limits |
| **Evidence** | What supports the insight / recommendation |

Presentation: a **continuum / lenses of one intelligence** — not equal tabs, not five modules, not five products.

Flow of attention:

```
Clinical Insights  →  Assistant  →  Recommendations  →  Explainability  →  Evidence
      (home)            (on need)         (review)            (trust)           (support)
```

---

## 6. Trust

Authority must be visually obvious without shouting.

| Element | Treatment |
|---------|-----------|
| NON-AUTHORITY | Quiet badge in hero — always on |
| Footer | Persistent: *You remain in control · Human-in-the-Loop · Evidence-driven* |
| Actions | No Confirm · No Emit · No Apply inside Copilot |
| Tone | Advisory, clinical, calm |

---

## 7. Final acceptance

A physician opening HeyDoctor Copilot for the first time should think:

1. **“This understands my patient.”** — live Insights on open  
2. **“This helps me throughout the consultation.”** — mission + continuum  
3. **“I remain in control.”** — badge + footer + no authority actions  

…without reading documentation.

### Pass / fail checklist

| # | Criterion | Pass |
|---|-----------|------|
| 1 | Product identity obvious in &lt; 2s | Name + subtitle |
| 2 | Mission understood in &lt; 5s | Full value proposition visible |
| 3 | Not a chatbot | No chat-first viewport |
| 4 | Value without prompt | Live Clinical Insights on open |
| 5 | One intelligence | Capabilities feel like views, not sections |
| 6 | Assistant secondary | Not HOME |
| 7 | Trust ambient | Quiet badge + persistent footer |
| 8 | No training required | Acceptance thoughts above hold |

---

## 8. Screens

| Screen | Asset | Purpose |
|--------|-------|---------|
| Desktop hero / first impression | `docs/brand/assets/copilot-product-hero-desktop.png` | Product, not navigation |
| Mobile hero / first impression | `docs/brand/assets/copilot-product-hero-mobile.png` | Same product clarity on phone |
| Insights HOME | `docs/brand/assets/copilot-product-insights-home.png` | Live intelligence as home |

---

## 9. Future Product Rule

Future AI capabilities **must extend HeyDoctor Copilot**.

- Do **not** create parallel AI brands.  
- Do **not** ship alternate clinician-facing AI product names.  
- Everything must fit under:

**HeyDoctor Copilot**  
**AI-First Clinical Intelligence**

---

## 10. Brand Constitution (reference)

From Brand SSOT — permanent foundation:

- One Product  
- One Identity  
- One Copilot  
- AI-First  
- Human-in-the-Loop  
- Evidence-Driven  
- NON-AUTHORITY  
- Physician Always in Control  

---

## 11. Explicit non-goals

- No implementation in this step  
- No AssistOrchestrator / ClinicalCopilotDrawer architecture / Medical Copilot Runtime / Liquid / W5 / Steward / HAB / PE/COS changes  
- No API / route / contract / authority / governance changes  
- No new AI features  
- No deploy  

When experience implementation is authorized later: **presentation / experience layer only**, preserving architecture and this frozen identity.
