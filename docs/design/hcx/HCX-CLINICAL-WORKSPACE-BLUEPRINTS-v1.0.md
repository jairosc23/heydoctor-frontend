# HCX Clinical Workspace Blueprints v1.0  
## Canonical Spatial Organization of HeyDoctor Workspaces

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 3 — Clinical Workspace Blueprints |
| **Document** | HCX Clinical Workspace Blueprints |
| **Version** | 1.0 |
| **Status** | Official blueprint specification — **no implementation** |
| **Consumes** | HCX Experience Patterns v1.0 · Foundations · Taxonomy · Motion · A11y |
| **Path** | `docs/design/hcx/HCX-CLINICAL-WORKSPACE-BLUEPRINTS-v1.0.md` |
| **Independence** | Blueprints **consume** COS · never redefine engines / EDPs / business logic |

**Laws:** Spec only · no React · no CSS · no Tailwind · no code · no commits.  
**Layering:** Patterns → **Blueprints** → Components → Implementation.

Blueprints define **where information lives and how attention moves**.  
They do **not** define components or implement UI.

---

# Part I — Global Workspace Rules

## 1. Workspace Composition Rules

1. Every workspace is one **clinical/operational world**, not a dashboard of unrelated apps.  
2. Composition order: **Identity → Context status → Primary work → Assist (optional) → Authority (when required)**.  
3. AI presence is a **shelf/dock**, never the authority zone.  
4. Notification surfaces are **peripheral**; they never replace HAB or critical alerts.  
5. Cross-role workspaces share HCX tokens/patterns; they **differ in zones and rights affordances**, not in brand.  
6. Blueprints map to Experience Patterns by name; new layouts require a pattern or blueprint amendment.

## 2. Workspace Layout Principles

| Principle | Spec |
|-----------|------|
| One primary job | One focus zone owns the viewport’s cognitive center |
| Stable chrome | Nav/identity persist; content transitions |
| Authority separation | Confirmation zone ≠ Assist dock |
| Progressive disclosure | Secondary panels open without relocating identity |
| Calm density | Prefer readable work over widget density |
| Brand presence | BrandLogo/wordmark in chrome on primary surfaces |

## 3. Information Density Rules

| Mode | Where | Rule |
|------|-------|------|
| Comfortable | Documentation, patient portal | Larger type, airy stacks |
| Compact | Staff queues, admin tables, agenda | Tight rows; AA still required |
| Touch | Mobile/tablet clinical | Targets ≥44px; fewer parallel columns |

Density never removes safety labels or collapses Dispose into Confirm.

## 4. Context Preservation Rules

1. Patient/encounter identity remains visible while clinical work is open.  
2. Switching patient/encounter uses Patient Selection Pattern — never silent.  
3. Multi-device resume restores **place-in-care** (stage + identity), not only theme.  
4. Unbound context shows fail-closed banner before assist/HAB affordances.  
5. Leaving a workspace does not imply clinical complete unless Completion Pattern ran.

## 5. Focus Management Rules

1. Opening HAB moves focus into the authority challenge.  
2. Opening assist does not steal focus from an active documentation field unexpectedly.  
3. Critical alerts may move focus; toasts must not.  
4. Modals trap focus; restore on close.  
5. Keyboard order follows visual zones: chrome → work → assist → HAB.

## 6. Interruptibility Rules

| Interrupt | Allowed behavior |
|-----------|------------------|
| Critical clinical alert | Pin + may pause non-authority work |
| Soft notification | Peripheral; do not interrupt typing |
| AI suggestion arrival | Never interrupt HAB; never auto-confirm |
| Tele connection loss | Banner; clinical sheet remains reachable |
| Session expiry | Authentication Pattern; preserve draft if safe |

## 7. Clinical Safety Layout Rules

1. HAB zone: opaque, elevated attention, labeled authority — clarity ≫ aesthetics.  
2. Rx / order review: opaque; tabular; identity sticky.  
3. Warnings/critical: not toast-only when in-encounter.  
4. Consent / identity mismatch: full-width readable blocks.  
5. Glass/liquid **forbidden** over safety prose.  
6. Staff workspaces **omit** physician-reserved HAB controls.

## 8. Cross-device Continuity Rules

1. Same blueprint zones; responsive recomposition only.  
2. Tablet ≈ condensed dual-zone; phone = single column + sheets.  
3. Multi-monitor: primary clinical on main; assist/timeline may undock — HAB stays with clinical identity.  
4. Concurrent edit conflict: block silent overwrite (Multi-device Continuity Pattern).

---

# Part II — Role Blueprints

## Blueprint A — Physician Workspace

| Field | Specification |
|-------|----------------|
| **Primary Goals** | Conduct bound encounter: orient, explore, document, optionally assist, confirm irreversible acts, complete safely. |
| **Information Hierarchy** | 1) Patient + encounter identity 2) Context status 3) Clinical work 4) Timeline/orientation cues 5) Assist dock 6) HAB when required 7) Notifications peripheral. |
| **Navigation Model** | Chrome to agenda/patients; inside encounter use Journey stage chrome + zone switches; no second clinical app. |
| **Workspace Zones** | **Chrome** · **Orientation/Timeline** · **Clinical Work** · **Assist Dock** · **Confirmation Host**. |
| **Persistent Areas** | Identity header · context banner (when relevant) · chrome nav · journey stage indicator. |
| **Temporary Panels** | Assist sheet · search · protocol hints · notification drawer. |
| **AI Presence** | Right dock (desktop); provisional styling; Dispose only — never Confirm/Emit. |
| **Human Authority Zone** | Bottom band or modal overlay on Confirmation Host; full attention; blocked if unbound. |
| **Timeline Placement** | Left rail (xl) or collapsible orientation strip; pins above fold. |
| **Notification Strategy** | Badge in chrome; inbox secondary; critical in-encounter uses alert pattern. |
| **Responsive Behaviour** | xl tri-zone · lg dual + assist sheet · sm single column. |
| **Multi-monitor Behaviour** | Work+identity on primary; assist/timeline secondary; HAB follows primary. |
| **Tablet Behaviour** | Dual: work + collapsible assist; HAB full-screen. |
| **Mobile Behaviour** | Single column; assist sheet; HAB full-screen; journey strip compact. |
| **Accessibility** | Skip to work; HAB focus trap; SR distinguishes suggestion vs confirm. |
| **Cognitive Load Strategy** | One stage body; hide unused mounts; comfortable density for notes. |
| **Relation with COS** | Visual host for E01/E03/E04/E05 presentation — does not own engines. |
| **Patterns consumed** | Workspace Opening · Journey · Documentation · Copilot · HAB · Timeline · Error/Offline · Multi-device. |

---

## Blueprint B — Patient Workspace (Portal)

| Field | Specification |
|-------|----------------|
| **Primary Goals** | Understand care status, appointments, post-emission deliverables, messages — with reassurance and privacy. |
| **Information Hierarchy** | 1) Personal greeting + brand 2) Next appointment / action 3) Documents/results available 4) Messages 5) Profile/security. |
| **Navigation Model** | Simple bottom/side nav: Home · Appointments · Documents · Messages · Profile. |
| **Workspace Zones** | **Chrome** · **Home focal** · **Content** · **Support** (help). No clinical Assist dock as physician Copilot. |
| **Persistent Areas** | Brand · patient name · privacy cues. |
| **Temporary Panels** | Booking sheet · message compose · consent viewer. |
| **AI Presence** | Optional patient education tips — clearly non-diagnostic; never HAB. |
| **Human Authority Zone** | **Absent** as physician HAB; patient Ack ≠ Confirm. Consent uses opaque consent blocks. |
| **Timeline Placement** | Simplified care timeline (patient-safe language); no clinician-only cues. |
| **Notification Strategy** | Clear inbox; appointment reminders; no clinical authority language. |
| **Responsive Behaviour** | Mobile-first single column. |
| **Multi-monitor Behaviour** | Not primary; same simple IA. |
| **Tablet Behaviour** | Comfortable two-column home optional. |
| **Mobile Behaviour** | Primary surface; large CTAs. |
| **Accessibility** | Plain language; large type; high contrast. |
| **Cognitive Load Strategy** | One next action; hide clinician machinery. |
| **Relation with COS** | Consumes patient-facing assets/emission viewers — never shows pre-emit as legal Rx. |
| **Patterns consumed** | Auth · Scheduling (patient book) · Notification · Empty/Error · Tele join as guest/patient. |

---

## Blueprint C — Staff Workspace

| Field | Specification |
|-------|----------------|
| **Primary Goals** | Queue operations: check-in, rooming, scheduling support, task lists — without physician HAB. |
| **Information Hierarchy** | 1) Queue/worklist 2) Selected patient operational card 3) Task actions 4) Schedule slice. |
| **Navigation Model** | Ops nav: Queue · Agenda · Patients (limited) · Messages. |
| **Workspace Zones** | **Chrome** · **Worklist** · **Detail** · **Task panel**. |
| **Persistent Areas** | Clinic/site · role · queue filters. |
| **Temporary Panels** | Quick book · note-to-physician (non-HAB). |
| **AI Presence** | Optional ops hints only; never clinical Confirm. |
| **Human Authority Zone** | **Forbidden** for reserved physician acts; UI must show “requires physician” when blocked. |
| **Timeline Placement** | Operational timeline (arrivals) not full longitudinal clinical river. |
| **Notification Strategy** | Ops-focused; severity for no-shows etc. |
| **Responsive Behaviour** | Compact tables on desktop; cards on mobile. |
| **Multi-monitor Behaviour** | Worklist + detail dual screens common. |
| **Tablet Behaviour** | Check-in friendly large taps. |
| **Mobile Behaviour** | Queue cards; limited clinical depth. |
| **Accessibility** | Compact still AA; clear disabled HAB. |
| **Cognitive Load Strategy** | Compact density; filters first. |
| **Relation with COS** | Staff rights as presented by COS — blueprint never invents HAB substitution. |
| **Patterns consumed** | Auth · Patient Search/Selection · Scheduling · Notification · Dashboard (ops) · Error. |

---

## Blueprint D — Administrator Workspace

| Field | Specification |
|-------|----------------|
| **Primary Goals** | Configure clinic operations, users, billing views, audit exports — without clinical authority chrome. |
| **Information Hierarchy** | 1) Admin sections 2) Selected entity 3) Forms/tables 4) Audit/status. |
| **Navigation Model** | Settings IA: Organization · Users · Catalogs · Billing · Compliance. |
| **Workspace Zones** | **Chrome** · **Nav tree** · **Config work** · **Preview/impact**. |
| **Persistent Areas** | Clinic/org context · env badges (staging). |
| **Temporary Panels** | Confirm destructive config (not clinical HAB). |
| **AI Presence** | Generally none; if present, ops-only. |
| **Human Authority Zone** | Admin “approve” ≠ clinical HAB styling; distinct copy. |
| **Timeline Placement** | Change/audit log lists, not patient longitudinal. |
| **Notification Strategy** | System/ops alerts. |
| **Responsive Behaviour** | Tables degrade to cards; avoid editing complex grids on phone. |
| **Multi-monitor Behaviour** | Config + docs/preview. |
| **Tablet Behaviour** | Read-heavy; careful edit. |
| **Mobile Behaviour** | Monitoring > configuration. |
| **Accessibility** | Forms labeled; destructive confirms clear. |
| **Cognitive Load Strategy** | Sectioned settings; progressive disclosure. |
| **Relation with COS** | Enterprise/admin presentation — cannot look like disabling HAB/PE. |
| **Patterns consumed** | Auth · Dashboard (admin) · Empty/Error · Notification. |

---

## Blueprint E — Enterprise Workspace

| Field | Specification |
|-------|----------------|
| **Primary Goals** | Multi-site oversight: portfolios, policies, cross-clinic ops — secondary to clinical identity when drilling into care. |
| **Information Hierarchy** | 1) Org/site switcher 2) Portfolio KPIs (calm) 3) Site list 4) Drill-down into clinic physician/staff blueprints. |
| **Navigation Model** | Org → Site → Clinic workspace (inherits Physician/Staff/Admin as appropriate). |
| **Workspace Zones** | **Enterprise chrome** · **Portfolio** · **Site rail** · **Embedded clinic workspace**. |
| **Persistent Areas** | Org name · site selector · compliance banners (informative). |
| **Temporary Panels** | Policy viewers · export wizards. |
| **AI Presence** | Analytics insights advisory only; never clinical Confirm. |
| **Human Authority Zone** | Not at org level for patient acts; drilling into clinic uses Physician HAB zone. |
| **Timeline Placement** | Org event/audit timelines; patient timeline only inside clinic physician blueprint. |
| **Notification Strategy** | Org-level ops + route to site. |
| **Responsive Behaviour** | Portfolio cards; site switcher always available. |
| **Multi-monitor Behaviour** | Portfolio + site clinic session. |
| **Tablet Behaviour** | Oversight dashboards. |
| **Mobile Behaviour** | Alerts/approvals lite — not deep multi-site config. |
| **Accessibility** | Site switcher labeled; banners not color-only. |
| **Cognitive Load Strategy** | Don’t overload first viewport with KPI theater; one drill path. |
| **Relation with COS** | E18/E19 presentation only — topology engines unchanged; policy UI cannot disable HAB. |
| **Patterns consumed** | Auth · Dashboard · Notification · Multi-device · Error. |

---

# Part III — Zone Reference (Physician canonical)

```
┌─────────────────────────────────────────────────────────────────┐
│ Chrome: Brand · Nav · Patient/Encounter · Alerts badge          │
├──────────────┬────────────────────────────┬─────────────────────┤
│ Orientation  │ Clinical Work (PRIMARY)    │ Assist Dock         │
│ Timeline     │ Docs / explore / therapy   │ Copilot provisional │
│ cues         │ Journey stage body         │ Dispose ≠ Confirm   │
├──────────────┴────────────────────────────┴─────────────────────┤
│ Confirmation Host (HAB) — when irreversible; opaque; attention  │
└─────────────────────────────────────────────────────────────────┘
```

---

# Part IV — Consistency & Governance

| Rule | Spec |
|------|------|
| Pattern binding | Each blueprint lists consumed Experience Patterns |
| No COS redefine | Blueprints never change fail-closed/HAB/PE meaning |
| Taxonomy | Zones map to Workspace/Experience layers; components fill later |
| Amendments | New role workspace requires HCX Phase review |
| Implementation | Future UI cites blueprint ID + pattern IDs |

---

# Part V — Recommended next HCX phase

**HCX Phase 4 — Surface Recipes / Wireframe Contracts** (still no production UI code unless separately authorized): detailed wireframe inventories per zone, empty/error content matrices, and Figma token board alignment — still implementation-independent.

---

## Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| COS impact | **None** — consume only |

**End of HCX Clinical Workspace Blueprints v1.0.**
