# HCX Experience Patterns v1.0  
## Canonical Interaction Patterns for Clinical Workflows

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 2 — Experience Patterns |
| **Document** | HCX Experience Patterns |
| **Version** | 1.0 |
| **Status** | Official pattern specification — **no implementation** |
| **Parent** | HCX v1.0 · HCX Foundations · Taxonomy · Motion · A11y |
| **Path** | `docs/design/hcx/HCX-EXPERIENCE-PATTERNS-v1.0.md` |
| **Independence** | Patterns **consume** COS · never redefine engines, EDPs, or business logic |

**Laws:** Spec only · no React · no CSS · no Tailwind · no code · no commits.

**Layering**

```
Experience Patterns  (this document — behavior & cognition)
        ↓
Component Taxonomy   (structure)
        ↓
Tokens / Foundations (material)
        ↓
Future UI implementation
```

Patterns sit **above** components. Components implement patterns; patterns do not invent COS semantics.

---

## 0. How to read a pattern

Each pattern uses the same schema:

| Field | Meaning |
|-------|---------|
| **Objective** | What success looks like for the user |
| **Trigger** | What starts the pattern |
| **User Intent** | Why the user is here |
| **Information Hierarchy** | What must be seen first → last |
| **Primary Actions** | Main verbs |
| **Secondary Actions** | Supporting verbs |
| **Cognitive Load** | How we keep load low |
| **Safety Considerations** | Clinical / trust risks in UX |
| **Accessibility** | Operable / perceivable notes |
| **Mobile Behaviour** | Recomposition rules |
| **Failure Behaviour** | When things go wrong |
| **Success Behaviour** | Completion feedback |
| **Motion Principles** | Allowed purposeful motion |
| **Relation with COS** | Consumes which capability — **no redefinition** |

**Global invariants (all patterns)**

- Dispose ≠ Confirm ≠ Emit (visual and labeling)  
- Fail-closed UI when preconditions missing  
- Clarity over ornament on safety surfaces  
- HCX tokens / motion / a11y standards apply  

---

## 1. Authentication Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Establish a trusted session with clear role and clinic context, without clinical work until authenticated. |
| **Trigger** | Visit to protected surface; session expiry; explicit sign-in. |
| **User Intent** | “Prove who I am and enter my workplace safely.” |
| **Information Hierarchy** | 1) Brand 2) Sign-in form 3) Errors/help 4) Secondary links (recover). |
| **Primary Actions** | Sign in. |
| **Secondary Actions** | Forgot password · language · support (non-clinical). |
| **Cognitive Load** | Single column; one primary CTA; no dashboard chrome. |
| **Safety Considerations** | No clinical data on auth screens; clear session-expired copy; no silent role escalation in UI. |
| **Accessibility** | Labels not placeholders-only; errors associated; focus on first field; keyboard submit. |
| **Mobile Behaviour** | Full-bleed calm form; body ≥16px inputs; brand visible. |
| **Failure Behaviour** | Inline error; preserve email; rate-limit messaging calm; no clinical peek. |
| **Success Behaviour** | Quiet transition to dashboard/workspace; no celebratory motion. |
| **Motion Principles** | Fade to app `base`; no bounce. |
| **Relation with COS** | Consumes AuthN/AuthZ/tenancy presentation only — does not redefine auth engines. |

---

## 2. Patient Search Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Find the correct patient quickly with identity confidence. |
| **Trigger** | Search affordance; “open patient”; scheduling attach patient. |
| **User Intent** | “Locate *this* person among many.” |
| **Information Hierarchy** | 1) Query field 2) Result identity (name + DOB/ID) 3) Clinic-safe meta 4) Empty/no-match. |
| **Primary Actions** | Search · select result. |
| **Secondary Actions** | Clear · refine filters · create patient (if permitted — separate confirm). |
| **Cognitive Load** | Instant feedback; group results; highlight match tokens; limit visual noise. |
| **Safety Considerations** | Ambiguous matches require extra identity cues; never auto-select sole fuzzy match without confirmation when risk high; tenancy boundaries respected in what is shown. |
| **Accessibility** | Combobox pattern; announce result count; arrow-key list. |
| **Mobile Behaviour** | Full-screen search sheet; large tap rows. |
| **Failure Behaviour** | No results copy + refine tips; error distinct from empty. |
| **Success Behaviour** | Selection proceeds to Patient Selection / open. |
| **Motion Principles** | Results fade `fast`; no layout thrash. |
| **Relation with COS** | Consumes patient directory read models — does not invent identity SSOT. |

---

## 3. Patient Selection Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Commit to a patient identity before clinical work proceeds. |
| **Trigger** | Choosing a search result; switching patient; booking attach. |
| **User Intent** | “I am sure this is the right patient.” |
| **Information Hierarchy** | 1) Full identity header 2) Distinguishing attributes 3) Confirm/cancel 4) Warnings (duplicate risk). |
| **Primary Actions** | Confirm patient · Cancel. |
| **Secondary Actions** | View summary · report mismatch. |
| **Cognitive Load** | One decision; large identity block; minimal chrome. |
| **Safety Considerations** | Mismatch = critical pattern; switching patient mid-encounter requires explicit interrupt; never silent swap. |
| **Accessibility** | Dialog focus trap; announce identity; confirm labeled clearly. |
| **Mobile Behaviour** | Full-screen confirmation. |
| **Failure Behaviour** | Block proceed on unresolved mismatch; explain why. |
| **Success Behaviour** | Patient sticky in chrome; proceed to workspace opening. |
| **Motion Principles** | Modal `slow`; no bounce. |
| **Relation with COS** | Aligns with CareBinding/context *presentation*; engines bind via COS — UI does not redefine binding. |

---

## 4. Clinical Workspace Opening Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Enter the physician clinical world only when entry conditions are understandable and safe. |
| **Trigger** | Open consultation/encounter; resume encounter. |
| **User Intent** | “Start or continue care for this bound encounter.” |
| **Information Hierarchy** | 1) Patient + encounter identity 2) Context status 3) Work zone 4) Assist optional 5) Confirm region when needed. |
| **Primary Actions** | Enter workspace · Resume. |
| **Secondary Actions** | View timeline · open assist later. |
| **Cognitive Load** | Orient once; don’t dump every widget; progressive mounts. |
| **Safety Considerations** | If context unbound, show fail-closed banner; do not present assist as fully bound; guest/booking actors never enter physician workspace. |
| **Accessibility** | Announce workspace title + patient; skip to clinical work. |
| **Mobile Behaviour** | Single column; context banner top; assist as sheet later. |
| **Failure Behaviour** | Entry denied with reason; path back to agenda/search. |
| **Success Behaviour** | Stable chrome; ready for journey/documentation. |
| **Motion Principles** | Chrome stable; content fade `base`. |
| **Relation with COS** | Consumes E01 workspace host concepts visually — does not modify E01 EDP. |

---

## 5. Consultation Journey Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Move through care stages without illegal shortcuts or lost place. |
| **Trigger** | Inside open workspace; stage control; resume after interrupt. |
| **User Intent** | “Know where I am in the encounter and what is next.” |
| **Information Hierarchy** | 1) Current stage 2) Allowed next 3) Blocked next with reason 4) Content of stage. |
| **Primary Actions** | Advance (legal) · Go back (legal). |
| **Secondary Actions** | Jump only if journey rules allow · view stage checklist. |
| **Cognitive Load** | Stage chrome compact; one stage body focus. |
| **Safety Considerations** | UI must not offer Assist→Emit shortcut; irreversible stage entry routes through HAB pattern when required by COS; recovery after interrupt restores place-in-care. |
| **Accessibility** | Stage announced; disabled next explained. |
| **Mobile Behaviour** | Stage selector as compact strip or sheet. |
| **Failure Behaviour** | Illegal transition: static deny + explanation. |
| **Success Behaviour** | Stage content cross-fade; history preserved. |
| **Motion Principles** | Shared-axis `slow`; no parallax. |
| **Relation with COS** | Consumes E03 journey legality — UI never invents transitions. |

---

## 6. Clinical Documentation Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Capture clinical narrative with high readability and clear draft vs complete. |
| **Trigger** | Enter documentation zone; edit note sections. |
| **User Intent** | “Record what matters for this encounter.” |
| **Information Hierarchy** | 1) Section structure 2) Active field 3) Status draft/complete 4) Assist suggestions (peripheral). |
| **Primary Actions** | Edit · Save draft · Mark complete (if allowed). |
| **Secondary Actions** | Templates · AI propose into draft · expand prior. |
| **Cognitive Load** | Comfortable density; long-form line length; hide non-writing chrome. |
| **Safety Considerations** | Complete ≠ Confirm ≠ Emit; AI inserts are provisional until disposed; no glass over prose; finalize-irreversible uses HAB pattern when COS requires. |
| **Accessibility** | Labels; headings; autosave status announced sparingly. |
| **Mobile Behaviour** | Full-width editor; sticky section nav. |
| **Failure Behaviour** | Preserve text on save fail; clear retry. |
| **Success Behaviour** | Quiet save indicator; no confetti. |
| **Motion Principles** | Minimal; caret stability over animation. |
| **Relation with COS** | Consumes E06 documentation semantics — does not redefine draft engines. |

---

## 7. AI Copilot Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Offer provisional assistance without implying clinical authority. |
| **Trigger** | Open assist dock; invoke suggest; degraded mode notice. |
| **User Intent** | “Help me think / draft — I still decide.” |
| **Information Hierarchy** | 1) Provisional label 2) Suggestion content 3) Evidence/why 4) Dispose actions 5) Never HAB/Emit. |
| **Primary Actions** | Dispose / Accept suggestion into draft · Dismiss · Regenerate (if allowed). |
| **Secondary Actions** | Expand evidence · copy · feedback. |
| **Cognitive Load** | Docked shelf; don’t cover notes; stable streaming container. |
| **Safety Considerations** | Visual language lighter than HAB; no Confirm/Emit controls; degraded assist keeps manual workspace usable; no multi-agent theater. |
| **Accessibility** | Announce as suggestion; don’t flood SR on every token. |
| **Mobile Behaviour** | Bottom sheet; swipe dismiss ≠ clinical reject. |
| **Failure Behaviour** | Degraded banner; empty assist with retry; workspace remains. |
| **Success Behaviour** | Suggestion applied to draft only; quiet. |
| **Motion Principles** | Dock slide `base`–`slow`; stream without thrash. |
| **Relation with COS** | Consumes E02 propose/dispose — does not redefine Copilot authority. |

---

## 8. Human Authority Confirmation Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Obtain an explicit physician authority decision for irreversible acts. |
| **Trigger** | COS-required confirmation point; user opens confirmation mount; irreversible stub/act ready. |
| **User Intent** | “I knowingly Confirm / Reject / Modify / Abort.” |
| **Information Hierarchy** | 1) What is being authorized 2) Patient/encounter identity 3) Consequences summary 4) HAB actions 5) Context-bound status. |
| **Primary Actions** | Confirm · Reject · Modify · Abort. |
| **Secondary Actions** | View details · cancel back to work (if Abort not chosen). |
| **Cognitive Load** | Full attention; dim periphery; one challenge at a time. |
| **Safety Considerations** | Clarity ≫ aesthetics; opaque; distinct from Copilot Dispose; blocked if context unbound; staff must not see physician-reserved HAB; never looks like emit. |
| **Accessibility** | Focus trap; assertive purpose; announce decision result; keyboard complete. |
| **Mobile Behaviour** | Full-screen challenge. |
| **Failure Behaviour** | Unbound/deny: static block + recovery (bind context / contact support); no partial confirm. |
| **Success Behaviour** | Record acknowledged quietly; return to journey; **no** auto-emit implied by UI. |
| **Motion Principles** | Elevation.4 enter `slow`; no bounce/confetti. |
| **Relation with COS** | Consumes E04 HAB — UI expresses challenge; does not redefine HAB engines. |

---

## 9. Prescription Review Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Review medication intent with scannable safety before any emission path. |
| **Trigger** | Therapy ready for review; open Rx review; post-HAB pre-emit review. |
| **User Intent** | “Verify the right drug, dose, patient, and warnings.” |
| **Information Hierarchy** | 1) Patient identity 2) Medication lines (tabular) 3) Warnings/allergies 4) Diff if modified 5) Confirm/back. |
| **Primary Actions** | Proceed to HAB (if required) · Back to edit. |
| **Secondary Actions** | Expand monograph/warning · compare prior. |
| **Cognitive Load** | Compact table clarity; highlight changes only. |
| **Safety Considerations** | Opaque; no glass; Confirm styling only on HAB step; review ≠ emit; critical alerts not toast-only. |
| **Accessibility** | Table headers; dose announced fully; warnings listed. |
| **Mobile Behaviour** | Stacked cards with tabular nums; sticky patient header. |
| **Failure Behaviour** | Safety block explained; cannot pretend success. |
| **Success Behaviour** | Advance to HAB or COS-allowed next — UI does not call it “emitted” until true. |
| **Motion Principles** | Static emphasis; minimal motion. |
| **Relation with COS** | Consumes E07/E11 readiness presentation — PE emit remains COS; UI never second emitter. |

---

## 10. Clinical Order Review Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Review labs/orders/referrals as pre-emit clinical intent. |
| **Trigger** | Orders compose complete; review before authorize/send path. |
| **User Intent** | “Check what will be ordered and why.” |
| **Information Hierarchy** | 1) Order list 2) Priority/timing 3) Warnings 4) Actions. |
| **Primary Actions** | Approve for HAB (if required) · Edit · Cancel. |
| **Secondary Actions** | Duplicate check · protocol hint (advisory). |
| **Cognitive Load** | Group by type; progressive details. |
| **Safety Considerations** | Pre-emit labeling; protocol apply ≠ confirm; opaque review. |
| **Accessibility** | Lists with names; status text. |
| **Mobile Behaviour** | Vertical stack; sticky summary. |
| **Failure Behaviour** | Validation errors inline per line. |
| **Success Behaviour** | Quiet advance; no emit language unless COS emit occurred. |
| **Motion Principles** | `fast` expansions only. |
| **Relation with COS** | Consumes E08 pre-emit orders — does not create orders hub semantics. |

---

## 11. Timeline Navigation Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Orient in longitudinal history without turning it into a social feed. |
| **Trigger** | Open orientation zone; jump from alert; patient chart timeline. |
| **User Intent** | “What happened, when, and what matters now?” |
| **Information Hierarchy** | 1) Pinned alerts 2) Now/recent 3) Day groups 4) Event detail. |
| **Primary Actions** | Select event · jump to day · filter type. |
| **Secondary Actions** | Expand meta · open source artifact read-only. |
| **Cognitive Load** | Sticky day headers; quiet spine; pin only true risks. |
| **Safety Considerations** | Continuity informs — UI must not look like silent renew/authorize; alerts pin above fold. |
| **Accessibility** | List semantics; announce pin; keyboard select. |
| **Mobile Behaviour** | Full-width river; filters in sheet. |
| **Failure Behaviour** | Partial load with retry; don’t empty entire chart silently. |
| **Success Behaviour** | Detail opens in work zone; timeline keeps place. |
| **Motion Principles** | New events ease `base`; no auto-scroll while typing elsewhere. |
| **Relation with COS** | Consumes E10/longitudinal assets as display — never authorizes. |

---

## 12. Scheduling Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Book and manage time without implying clinical confirmation. |
| **Trigger** | Open agenda; book appointment; reschedule. |
| **User Intent** | “Place the right patient in the right slot.” |
| **Information Hierarchy** | 1) Day/week context 2) Availability 3) Patient identity 4) Slot confirm. |
| **Primary Actions** | Book · Reschedule · Cancel appointment. |
| **Secondary Actions** | Waitlist · reminders prefs · filters. |
| **Cognitive Load** | Compact density; clear selected slot; avoid widget sprawl. |
| **Safety Considerations** | Book ≠ HAB Confirm; tele join ≠ confirm; identity on attach uses Patient Selection pattern. |
| **Accessibility** | Grid keyboard operable; conflict announced. |
| **Mobile Behaviour** | Day agenda list; book as sheet. |
| **Failure Behaviour** | Conflict/double-book explained; preserve draft booking fields. |
| **Success Behaviour** | Slot occupied feedback quiet; optional notification pattern. |
| **Motion Principles** | Selection `fast`; sheet `slow`. |
| **Relation with COS** | Consumes E15 scheduling SSOT presentation — hosts consume only. |

---

## 13. Telemedicine Session Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Connect people calmly and keep clinical tools usable without covering faces. |
| **Trigger** | Join tele; lobby; in-call; end. |
| **User Intent** | “See/hear the other party and optionally document.” |
| **Information Hierarchy** | Lobby: brand · join · consent. In-call: remote video · controls · clinical sheet optional. |
| **Primary Actions** | Join · Leave · Mute · Camera. |
| **Secondary Actions** | Open clinical panel · switch device · reconnect. |
| **Cognitive Load** | Lobby calm; in-call minimal chrome. |
| **Safety Considerations** | Consent opaque; connection loss banner; Join ≠ Confirm; recording indicator honest if present. |
| **Accessibility** | Control labels; state announced; captions strategy when applicable. |
| **Mobile Behaviour** | Full-bleed video; bottom controls; clinical as sheet; safe areas. |
| **Failure Behaviour** | Reconnect primary; fallback instructions; no fake “connected.” |
| **Success Behaviour** | Connected indicator calm; end summary quiet. |
| **Motion Principles** | Lobby liquid allowed; in-call motion minimal. |
| **Relation with COS** | Consumes E17 modality presentation — not a second journey engine. |

---

## 14. Notification Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Deliver timely awareness without stealing clinical authority. |
| **Trigger** | New notification; open inbox; in-app toast for low severity. |
| **User Intent** | “Know what needs my attention.” |
| **Information Hierarchy** | 1) Severity 2) Title 3) Time 4) Deep link target. |
| **Primary Actions** | Open · Acknowledge. |
| **Secondary Actions** | Snooze · mute channel · mark unread. |
| **Cognitive Load** | Group by day; severity color + label; inbox over toast spam. |
| **Safety Considerations** | Ack ≠ Confirm; critical clinical alerts may bypass quiet toast rules (use alert pattern); no HAB in notification alone. |
| **Accessibility** | Live region for critical; inbox navigable. |
| **Mobile Behaviour** | Full inbox list; swipe secondary. |
| **Failure Behaviour** | Delivery failure noted; retry send separate from clinical deny. |
| **Success Behaviour** | Read state quiet. |
| **Motion Principles** | Toast `fast`; no loop. |
| **Relation with COS** | Consumes E16 notification SSOT when present — UI does not fork engines. |

---

## 15. Dashboard Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Orient the user to *today’s next clinical action* without dashboard theater. |
| **Trigger** | Post-login landing; home navigation. |
| **User Intent** | “What should I do now?” |
| **Information Hierarchy** | 1) Brand + greeting context 2) Next actions (appointments/open encounters) 3) Secondary modules 4) Empty. |
| **Primary Actions** | Open next encounter · Open agenda. |
| **Secondary Actions** | Search patient · notifications. |
| **Cognitive Load** | One focal strip; no stat-hero overload; progressive modules. |
| **Safety Considerations** | Don’t surface PHI in shared-screen-unsafe widgets without care; no fake urgency. |
| **Accessibility** | Landmarks; next action link clear. |
| **Mobile Behaviour** | Vertical stack; primary CTA thumb-reachable. |
| **Failure Behaviour** | Module-level errors; rest of dashboard remains. |
| **Success Behaviour** | Navigate into workspace/agenda patterns. |
| **Motion Principles** | Subtle enter `base`. |
| **Relation with COS** | Presentation assembly only — no new clinical SSOT. |

---

## 16. Empty State Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Explain absence and offer one clear next step. |
| **Trigger** | No data for view (agenda empty, no results, first-run). |
| **User Intent** | “Is this broken or just empty — what do I do?” |
| **Information Hierarchy** | 1) Honest title 2) One sentence 3) Primary CTA 4) Optional quiet illustration. |
| **Primary Actions** | Single recommended action. |
| **Secondary Actions** | Learn more · contact support (rare). |
| **Cognitive Load** | Sparse; no fake charts. |
| **Safety Considerations** | Don’t imply clinical clearance; patient empty states reassuring. |
| **Accessibility** | Text first; illustration decorative. |
| **Mobile Behaviour** | Centered calm block. |
| **Failure Behaviour** | Empty ≠ error (use Error Recovery if failed load). |
| **Success Behaviour** | CTA proceeds to create/search/book. |
| **Motion Principles** | None required. |
| **Relation with COS** | Neutral — no business rule changes. |

---

## 17. Error Recovery Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Recover from failure without losing trust or clinical input. |
| **Trigger** | Action/network/server failure; validation failure. |
| **User Intent** | “Fix this and continue.” |
| **Information Hierarchy** | 1) What failed 2) Why (plain) 3) What to do 4) Retry/support. |
| **Primary Actions** | Retry · Edit & resubmit. |
| **Secondary Actions** | Dismiss · copy error id · support. |
| **Cognitive Load** | Inline preferred; modal only if blocking. |
| **Safety Considerations** | Preserve entered clinical text when safe; never mark emit/HAB success on failure; distinguish auth expiry (Authentication Pattern). |
| **Accessibility** | Error associated to fields; announce on appear. |
| **Mobile Behaviour** | Sticky error summary if long forms. |
| **Failure Behaviour** | Nested failure: escalate clarity; stop spinning. |
| **Success Behaviour** | Error clears; quiet resume. |
| **Motion Principles** | Brief highlight `fast`; no shake loops. |
| **Relation with COS** | Surfaces engine errors honestly — does not invent success. |

---

## 18. Offline Recovery Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Keep user oriented when connectivity is lost; avoid fake online clinical certainty. |
| **Trigger** | Offline/degraded network detected; request fail as offline. |
| **User Intent** | “Can I still work? What is safe?” |
| **Information Hierarchy** | 1) Offline banner 2) What remains available 3) What is blocked 4) Reconnect. |
| **Primary Actions** | Reconnect / retry · Continue read-only if allowed. |
| **Secondary Actions** | View queued actions (if any — product-defined). |
| **Cognitive Load** | Persistent banner; don’t toast-spam. |
| **Safety Considerations** | Block HAB/emit/assist-write UI when COS cannot guarantee; never imply durable save if not; tele: connection pattern. |
| **Accessibility** | Banner as status/alert; announce online restore. |
| **Mobile Behaviour** | Top sticky banner; large retry. |
| **Failure Behaviour** | Still offline after retry: keep banner; guide to safer channel. |
| **Success Behaviour** | Banner clears; optional one-line “Back online.” |
| **Motion Principles** | Static banner preferred. |
| **Relation with COS** | UI reflects capability availability — offline policy owned by platform/COS ops, not redefined here. |

---

## 19. Multi-device Continuity Pattern

| Field | Specification |
|-------|----------------|
| **Objective** | Resume place-in-care across devices without relearning patterns or breaking authority rules. |
| **Trigger** | Open same encounter on another device; switch tablet/phone mid-tele; session resume. |
| **User Intent** | “Continue where I left off safely.” |
| **Information Hierarchy** | 1) Same patient/encounter identity 2) Stage/place restored 3) Device limits notice 4) Conflicts if two actives. |
| **Primary Actions** | Resume · Take over (if allowed) · Open read-only. |
| **Secondary Actions** | Sign out other device (account-level). |
| **Cognitive Load** | Same HCX patterns; density adapts; no new IA. |
| **Safety Considerations** | HAB/emit rules identical; warn on concurrent edit conflict; tele device switch uses Telemedicine pattern; never drop identity. |
| **Accessibility** | Announce resume point; consistent names. |
| **Mobile Behaviour** | Touch density; sheets for assist; full-screen HAB. |
| **Failure Behaviour** | Conflict: block silent overwrite; ask user. |
| **Success Behaviour** | Seamless visual continuity; quiet. |
| **Motion Principles** | Minimal; prefer instant restore. |
| **Relation with COS** | Consumes session/encounter continuity as provided — does not create parallel state engines. |

---

## 20. Pattern composition map

| Flow | Patterns in order (typical) |
|------|----------------------------|
| Start day | Authentication → Dashboard → Scheduling / Patient Search |
| Open care | Patient Search → Patient Selection → Workspace Opening → Journey |
| Document with AI | Documentation ↔ Copilot → (optional) HAB |
| Meds | Prescription Review → HAB → (emit owned by COS/PE, not a pattern here) |
| Orders | Clinical Order Review → HAB if required |
| Remote visit | Scheduling → Telemedicine ↔ Documentation/Copilot |
| Cross device | Multi-device Continuity → resume Journey/Tele |

---

## 21. Governance

1. New workflows must map to existing patterns or propose an HCX pattern amendment.  
2. Patterns never override COS fail-closed / HAB / PE rules.  
3. Component work must cite pattern IDs in future implementation tickets.  
4. Experience Patterns SSOT is this document under HCX Phase 2.

---

## Document control

| Field | Value |
|-------|-------|
| Document | HCX Experience Patterns v1.0 |
| Implementation | **None** |
| COS / EDP / engine impact | **None** — consume only |

**End of HCX Experience Patterns v1.0.**
