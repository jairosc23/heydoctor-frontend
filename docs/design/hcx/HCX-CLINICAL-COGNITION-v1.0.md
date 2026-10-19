# HCX Clinical Cognition v1.0  
## How Clinicians Cognitively Interact with HeyDoctor

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 6 — Clinical Cognition |
| **Document** | HCX Clinical Cognition |
| **Version** | 1.0 |
| **Status** | Official — **no implementation · no UI · no code** |
| **Consumes** | Communication System · Surface Recipes · Wireframes · Patterns · Foundations |
| **Path** | `docs/design/hcx/HCX-CLINICAL-COGNITION-v1.0.md` |

**Laws:** Spec only · no React · no CSS · no commits.  
**Separation:** Cognition describes attention and decision load. COS owns authority behavior. AI never owns attention as authority.

---

## 1. Purpose

Define how clinicians **attend, decide, interrupt, and continue** inside HeyDoctor so experience design reduces cognitive harm without inventing clinical authority.

Core law: **Dispose ≠ Confirm ≠ Emit** remains a cognitive law, not only a backend one.

---

## 2. Attention management

| Principle | Spec |
|-----------|------|
| One primary focus | Exactly one surface owns deep work at a time (documentation, orders, or HAB) |
| Peripheral AI | AI Dock is secondary attention; never steals focus from HAB |
| Quiet chrome | Header/nav do not compete with clinical narrative mid-act |
| Signal budget | Prefer one critical interrupt over many medium alerts |
| Restore focus | After interrupt, return cursor/focus to the interrupted field or HAB challenge |

---

## 3. Decision hierarchy

Ordered from highest cognitive / legal weight to lowest:

1. **Human Authority Confirm / Reject / Modify / Abort**  
2. **Emit** (post-HAB owned path)  
3. **Clinical documentation completeness** (draft → ready)  
4. **Orders placement** (after authority when irreversible)  
5. **Dispose of AI suggestions**  
6. **Navigation / search / notification ack**

Lower levels must not visually or verbally masquerade as higher levels.

---

## 4. Clinical interruption model

| Interrupt class | Behaviour |
|-----------------|-----------|
| **Hard safety** | Offline, session expiry, unbound context — freeze irreversible acts; explain recovery |
| **Authority** | HAB open — trap attention; block AI dispose controls |
| **Clinical critical alert** | Alert + live region; pause nonessential motion |
| **Assist suggestion** | Soft; never auto-interrupt typing mid-word |
| **Notification** | Inbox-first; toast only for noncritical |

**Rule:** Soft interrupts yield to hard and authority interrupts.

---

## 5. Information prioritization

Within an encounter workspace:

1. Patient / encounter identity (always glanceable)  
2. Bound context status (fail-closed visible when unbound)  
3. Active clinical work (notes / orders / Rx review)  
4. Timeline orientation  
5. AI suggestions  
6. Secondary chrome (nav, search)

Dashboard / agenda prioritize schedule and risk flags — not Copilot streams.

---

## 6. Context preservation

| Need | Spec |
|------|------|
| Spatial memory | Keep timeline rail and documentation position across soft navigations |
| Draft continuity | Never wipe clinician text on AI refresh or soft error |
| Journey awareness | Thin stage strip; does not claim authority |
| After rebind | Re-orient with “contexto restablecido”; restore last safe focus |
| After HAB | Return to the act that requested authority |

---

## 7. Cognitive continuity

Clinicians should experience one continuous consultation narrative:

- Opening → orient → explore → assist (optional) → document/compose → confirm → execute → complete  
- Assist may drop out (degraded) without breaking the narrative  
- Abandon / rebind are explicit cognitive chapters, not silent resets  

---

## 8. Decision fatigue reduction

| Tactic | Spec |
|--------|------|
| Fewer CTAs | One primary action per surface mode |
| Locked verbs | Canonical lexicon (Communication System) |
| Defaults that don’t decide | No pre-checked Confirm/Emit |
| Batch Dispose | Allow ignore/dismiss of low-value suggestions without serial modals |
| Progressive HAB | Only open HAB when an irreversible act is ready |

---

## 9. Alert prioritization

| Rank | Use |
|------|-----|
| P0 Critical | Patient safety / unbound during irreversible act / offline mid-write |
| P1 High | HAB required, emit failure after confirm |
| P2 Medium | Assist unavailable, validation |
| P3 Low | Informational tips, nonclinical system notices |

P0–P1 never toast-only. Ack ≠ Confirm.

---

## 10. AI attention model

| Rule | Spec |
|------|------|
| Peripheral | Dock/sheet; labeled **Sugerencia** |
| Opt-in depth | Expand evidence on demand |
| No authority gaze | Never full-screen challenge for Dispose |
| Streaming hygiene | Do not thrash focus or SR |
| Degraded honesty | “Asistencia limitada” without fake confidence |

AI may **attract** glance attention; it must not **demand** authority attention.

---

## 11. Human Authority attention model

| Rule | Spec |
|------|------|
| Full attention | Modal/band owns focus trap |
| Opaque truth | Act · identity · consequences · verbs |
| No parallel tasks | Disable AI dock interaction while HAB open |
| Calm motion | Elevation only; no celebration on Confirm |
| Exit clarity | Abort/Reject leave drafts intact unless stated |

---

## 12. Timeline cognition

Timeline is an **orientation river**, not a decision engine:

- Pins = “what matters now”  
- Day groups = continuity of care story  
- Selecting an event opens read detail; does not Confirm or Emit  
- New events animate gently; never auto-scroll while clinician types  

---

## 13. Multi-task workflows

Allowed cognitive multitasking:

- Read timeline while documenting  
- Peek AI suggestion while drafting (peripheral)  
- Ack notification without leaving encounter  

Forbidden multitasking:

- HAB Confirm while editing another patient’s chart  
- Emit while unresolved HAB challenge exists  
- Staff “approve” language during physician HAB  

---

## 14. Emergency behaviour

| State | Cognition |
|-------|-----------|
| Crash / unknown error | Preserve text; show recovery; no false success |
| Offline | Sticky banner; block HAB/emit/assist writes lacking guarantees |
| Unbound mid-HAB | Freeze Confirm; demand rebind |
| Critical alert during AI stream | Pause stream prominence; elevate alert |

Emergency UI prioritizes **safety comprehension** over aesthetics.

---

## 15. Progressive disclosure

Reveal in layers:

1. Identity + context health  
2. Primary clinical work  
3. Optional AI suggestion summary  
4. Evidence / why (on request)  
5. HAB challenge (only when irreversible)  
6. Emit controls (only after Confirm)

Do not dump all layers into the first viewport.

---

## 16. Cognitive accessibility

| Need | Spec |
|------|------|
| Working memory | Short sentences; one decision at a time |
| Attention disorders | Reduce simultaneous motion; stable layout |
| Screen readers | Announce authority and critical interrupts assertively |
| Low vision | Textual hierarchy > color alone |
| Stress / time pressure | Large recovery CTAs; no buried Confirm |

---

## 17. Relation to COS (consume only)

| COS | Cognitive presentation |
|-----|------------------------|
| E05 unbound | Hard interrupt + recovery |
| E04 HAB | Full attention model |
| E02 Dispose | Peripheral AI attention |
| E03 Journey | Continuity strip, not authority |
| E11 Emit (future) | Appears only post-Confirm in hierarchy |

---

## 18. Recommended next phase

**HCX Phase 7 — Role Cognition Playbooks** (physician / staff / patient attention maps per blueprint) **or** Content & Microcopy Matrix if copy slots are needed first for implementation readiness.

---

## 19. Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| Commits required | **None** |

**End of HCX Clinical Cognition v1.0.**
