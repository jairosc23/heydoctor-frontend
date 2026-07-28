# HCX Frontend Implementation Contract v1.0  
## How Frontend Engineering Realizes HCX Without Altering COS

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 9 — Frontend Implementation Contract |
| **Document** | HCX Frontend Implementation Contract |
| **Version** | 1.0 |
| **Status** | Official — **no implementation · no React · no CSS · no Tailwind · no code** |
| **Consumes** | Foundations · Tokens · Patterns · Blueprints · Surfaces · Wireframes · Communication · Cognition · Role Playbooks · Workflow Scripts |
| **Path** | `docs/design/hcx/HCX-FRONTEND-IMPLEMENTATION-CONTRACT-v1.0.md` |

**Laws:** Spec only · no commits.  
**Separation:** HCX owns experience. COS owns behavior. Frontend **presents** COS; it never becomes sole authority.

**Universal:** Dispose ≠ Confirm ≠ Emit · Plan ≠ Ready ≠ Confirm ≠ Emit · Ack ≠ Confirm · Book ≠ Confirm · Join ≠ Confirm.

---

## 1. Purpose

Define the **binding contract** for frontend engineering to implement HeyDoctor clinical experience so that:

1. HCX visual/cognitive law is preserved  
2. COS authority semantics are never weakened in the client  
3. Future UI tech choices remain replaceable without rewriting COS  

This contract does **not** prescribe React, Vue, SwiftUI, or CSS frameworks.

---

## 2. Mapping — HCX Foundations → Implementation

| Foundation concept | Implementation obligation |
|--------------------|---------------------------|
| Brand teal `#078A92` | Primary structural accent (CTA, focus, HAB accent, wordmark) — not decorative purple AI themes |
| Calm / clear / continuous | Typography hierarchy; one primary action per mode |
| Clinical truth > beauty | Never hide fail-closed, unbound, offline, or HAB behind aesthetics |
| Token system | Consume design tokens only; no hard-coded one-off clinical colors |
| Component taxonomy | Map taxonomy names to surface recipes; do not invent parallel taxonomies |

---

## 3. Mapping — Experience Patterns → UI Behaviour

| Pattern | UI behaviour contract |
|---------|----------------------|
| Human Authority Confirmation | Dedicated HAB zone; focus trap; four verbs only; Confirm ≠ Emit |
| AI Copilot | Peripheral dock/sheet; provisional label; Dispose verbs only |
| Timeline Navigation | Orientation river; no Confirm/Emit from events |
| Notification | Inbox-first; Ack ≠ Confirm; critical not toast-only |
| Error / Empty / Offline | Honest states; recovery CTAs; preserve clinician text |
| Patient Selection | Explicit switch; never silent patient change |
| Scheduling | Book ≠ Confirm |

---

## 4. Mapping — Workflow Scripts → Interaction Flows

| Workflow script | Frontend flow obligation |
|-----------------|--------------------------|
| Consultation | Host → context banner → journey strip → work → HAB when irreversible |
| Documentation | Draft save ≠ complete; complete only after HAB when COS requires |
| Therapy Planning | Ready CTA ≠ Confirm CTA ≠ Emit CTA (three distinct controls) |
| Clinical Orders | Builder has no dispatch/emit |
| Prescription Review | Split Confirm then Emit; ban fused button |
| Longitudinal | Read/inform only |
| Telemedicine | Connection truth; clinical HAB same as in-person |
| Emergency | Sticky system banner; freeze unsafe irreversible UX |
| Admin / Enterprise | Admin confirm ≠ HAB; org scope breadcrumb |

Frontend MUST call COS APIs that match these flows; must not invent local “confirm and emit” helpers.

---

## 5. Component implementation boundaries

| May implement | Must not implement |
|---------------|-------------------|
| Presentation of COS states | Sole-source HAB / fail-closed decisions |
| Dispose UI calling disposition API | Confirm language on AI dock |
| HAB mount calling `/hab-authority` | Client-only irreversible authorization |
| Draft editors for E06/E07 | PE emit from documentation/therapy modules |
| Feature flags hiding UX | Flags that disable BE HAB/context checks |

**Boundary test:** If the backend is down, the client must fail closed for irreversible acts — never “optimistically confirm.”

---

## 6. Design token consumption rules

1. Color, spacing, type, elevation, motion durations come from HCX tokens  
2. Semantic tokens (critical, warning, success, offline) over raw hex in features  
3. HAB and AI surfaces share brand teal differently: HAB = authority weight; AI = lighter secondary  
4. No new token forks per feature without HCX version bump  

---

## 7. Accessibility implementation requirements

| Requirement | Contract |
|-------------|----------|
| HAB open | Assertive live region; focus trap; Escape = Abort/dismiss per COS |
| AI content | Announced as suggestion; streaming throttled for SR |
| Critical / offline / unbound | Text + live region; color never sole channel |
| Locale | UI strings match locale; authority verbs locked glossary |
| Keyboard | All primary clinical actions reachable without pointer |

---

## 8. Motion implementation constraints

| Allowed | Forbidden |
|---------|-----------|
| Dock slide, HAB elevation, badge update `fast` | Confetti on Confirm; bounce on clinical errors |
| Reduced-motion: instant or opacity only | Motion that moves clinical text while editing |
| Offline banner appear without hiding content | Auto-scroll timeline while typing |

---

## 9. Responsive implementation rules

| Breakpoint intent | Contract |
|-------------------|----------|
| xl | Timeline rail + work + AI dock; HAB band/modal |
| sm | Assist sheet; HAB full-screen; sticky offline/context |
| Density | Staff/admin may be denser; never shrink HAB verbs to icons-only without text |

Wireframe Contracts define regions; frontend must not restack Assist above open HAB.

---

## 10. COS integration boundaries

| COS capability | Frontend rule |
|----------------|---------------|
| E05 Context | Show bound/unbound; block irreversible UX when unbound |
| E04 HAB | Only ConfirmationMount / HAB zone submits Confirm |
| E02 Disposition | Only Dispose API for AI accept/reject/refine/ignore |
| E03 Journey | Navigator reflects stages; stage ≠ authority |
| E06 Docs | Draft/complete APIs; no emit |
| E07 Therapy | PlanReady/handoff APIs; no Confirm/Emit fusion |
| E11 Emit (future) | Separate control after HAB; never from E06/E07 UI |

**Authority rule:** Backend remains SSOT. Frontend may challenge/display; never sole-enforce.

---

## 11. Forbidden implementation patterns

1. `confirmAndEmit` / “Confirmar y emitir” fused CTA  
2. AI “Aprobar” styled as HAB Confirm  
3. Treating PlanReady or Documentation Ready as Confirm  
4. LocalStorage/sessionStorage as authority evidence  
5. Optimistic irreversible writes without COS acknowledgement  
6. Staff UI offering clinical HAB  
7. Enterprise org-level “approve prescription”  
8. Disabling fail-closed via client feature flag  
9. Parallel mini-COS stores in the browser  
10. Purple “AI magic” visual system competing with clinical teal truth  

---

## 12. Performance expectations

| Area | Expectation |
|------|-------------|
| First clinical paint | Context identity + work surface before heavy AI |
| HAB open | Instant focus ownership; no waiting on AI stream |
| Draft autosave | Debounced; never blocked by Copilot |
| Offline detection | Sub-second banner; no false “saved” |
| Bundle | Clinical authority paths not gated behind optional AI chunks |

Beauty must not delay fail-closed or HAB.

---

## 13. Versioning and evolution strategy

| Change type | Process |
|-------------|---------|
| Token / copy tweak | HCX patch; no COS change |
| New surface recipe | HCX minor; update this contract mapping |
| New authority verb | **Forbidden in HCX alone** — requires COS/PO |
| Emit UX | Requires E11 COS readiness + this contract update |
| Breaking stack (z-order) | HCX major + FE Lead + PO |

Frontend library versions must declare which HCX contract version they implement.

---

## 14. Acceptance checklist (FE PR)

- [ ] Authority verbs match Communication System  
- [ ] No fused Confirm+Emit  
- [ ] Unbound/offline/error states honest  
- [ ] HAB focus trap present when mount open  
- [ ] AI labeled suggestion + Dispose only  
- [ ] COS API used for irreversible acts  
- [ ] Tokens used; no forbidden visual themes  
- [ ] a11y live regions for critical/HAB  

---

## 15. Recommended next phase

**HCX Phase 10 — FE Component Inventory & Story Matrix** (map each surface recipe to named components and Storybook/acceptance stories) **or** begin FE implementation behind flags strictly under this contract after PO authorize.

---

## Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| Commits required | **None** |

**End of HCX Frontend Implementation Contract v1.0.**
