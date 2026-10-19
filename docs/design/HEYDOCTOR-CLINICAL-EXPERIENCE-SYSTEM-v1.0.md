# HeyDoctor Clinical Experience System (HCX)  
## Official UX/UI System Specification v1.0

| Field | Value |
|-------|-------|
| **Program** | HeyDoctor Clinical Experience System (HCX) |
| **Version** | 1.0 |
| **Status** | Official design specification — **no implementation** |
| **Path** | `docs/design/HEYDOCTOR-CLINICAL-EXPERIENCE-SYSTEM-v1.0.md` |
| **Independence** | Independent design program — does **not** modify COS |
| **Architecture** | Clinical Operating System Baseline v1.0 remains **frozen** |
| **Brand inheritance** | Branding SSOT primary `#078A92` · evolves existing `--hd-*` spirit |
| **Related precursor** | Liquid Experience Design Spec v1.0 (absorbed into HCX as motion/surface vocabulary) |

**Hard boundaries — HCX SHALL NEVER modify:**

- Clinical Operating System Architecture  
- Engineering Design Packages (E01–E30)  
- Human Authority Boundary (product semantics / engines)  
- Clinical Context (engines)  
- Prescription & Emission (engines)  
- Backend architecture  

HCX defines **how those capabilities look and feel** when presented in UI — never what they mean or how they are enforced.

**Laws:** Design specification only · no UI implementation · no code · no commits.

---

# 1. HCX Vision

HeyDoctor’s Clinical Experience System is the **single visual and interaction language** for every current and future HeyDoctor surface: physician panel, patient portal, staff tools, telemedicine, scheduling, enterprise admin, and assistive AI.

**Vision statement**

> Care should feel calm, clear, and continuous — so clinicians move with confidence and patients feel protected. Beauty never competes with clinical truth.

HCX is **not** Apple, Material, Linear, Arc, Epic, or generic “AI glass SaaS.”  
It is **HeyDoctor**: teal-anchored clinical calm, liquid continuity, and unmistakable authority hierarchy.

**Brand test:** If the first viewport could belong to another health product after removing the logo, HCX is failing.

---

# 2. Design Manifesto

1. **Safety is the aesthetic.** Clarity is luxury.  
2. **Trust is designed**, not claimed — through readable hierarchy, honest states, and irreversible acts that look irreversible.  
3. **Calm is speed.** Removing noise makes experts faster.  
4. **One clinical world.** Workspace, assist, timeline, and confirmations belong to one experience — not bolted apps.  
5. **AI proposes; humans decide.** Visual language must never blur Dispose with Confirm, or suggestion with fact.  
6. **Liquid means continuity**, not decoration — flow between moments of care.  
7. **Accessibility is non-optional.** If it cannot be used safely by all intended users, it is unfinished.  
8. **Consistency compounds.** New screens consume HCX; they do not invent dialects.  
9. **Performance is courtesy.** Heavy effects that delay care are unethical in clinical UI.  
10. **Evolve the brand, don’t fork it.** Primary teal and BrandLogo remain the spine of identity.

---

# 3. Design Principles

| ID | Principle | Implication |
|----|-----------|-------------|
| **DP-01** | Clinical safety first | Warnings, HAB, identity, and Rx confirmation outrank ornament |
| **DP-02** | Premium calm | Quiet materials; restrained color; confident typography |
| **DP-03** | Trust by Design | Honest empty/error/loading; no fake certainty |
| **DP-04** | Cognitive load reduction | One primary job per focus zone |
| **DP-05** | Progressive disclosure | Advanced detail on demand; essentials always visible |
| **DP-06** | Calm Technology | Interrupt only when clinically useful |
| **DP-07** | Fluid continuity | Transitions explain “where I am in care” |
| **DP-08** | High readability | Contrast and type beat translucency on clinical content |
| **DP-09** | Purposeful motion | Motion = state change or attention guidance |
| **DP-10** | System coherence | Shared tokens/components across all products |
| **DP-11** | Performance consciousness | Prefer light CSS; limit blur/layers |
| **DP-12** | Responsive integrity | Layout recomposes; authority semantics do not |

### Anti-principles (forbidden)

- Purple/indigo “AI default” brand split  
- Warm cream + terracotta editorial cliché as product identity  
- Dense newspaper/broadsheet clinical grids as default  
- Neon glow, emoji ornament, pill-cluster hero dashboards  
- Glass over long clinical prose  
- Dark mode as default identity (optional later theme, not HCX v1 core)  
- Infinite decorative motion / parallax in encounter workspace  

---

# 4. Experience Principles

| ID | Experience law |
|----|----------------|
| **XP-01** | Orient → Work → Assist (optional) → Confirm (when irreversible) |
| **XP-02** | Context status is always visible when clinical work is open |
| **XP-03** | Dispose / Accept suggestion ≠ Confirm ≠ Emit (visually distinct) |
| **XP-04** | Fail-closed states are calm, loud enough, and actionable |
| **XP-05** | Speed = short paths + stable layout (no thrash while streaming AI) |
| **XP-06** | Patients see reassurance and clarity; clinicians see density on demand |
| **XP-07** | Enterprise scale never flattens clinical hierarchy into admin chrome |
| **XP-08** | Multi-device continuity preserves *place in care*, not just theme |

---

# 5. Visual Foundations

## 5.1 Visual identity — “Liquid Clinical”

**Metaphor:** Care flows. Stages, context, assist, and authority are one continuous world.  
**Not:** Water blobs, constant frost, or marketing spectacle inside clinical work.

**Signature traits**

1. Teal as **structural** accent (chrome, focus, key CTAs, HAB rail)  
2. Cool mist neutrals with teal undertone  
3. Clear zones: Orientation · Clinical Work · Assist · Confirmation  
4. BrandLogo / wordmark as recognizable chrome or hero anchor  

## 5.2 Color system

### Brand core

| Role | Value | Use |
|------|-------|-----|
| Brand primary | `#078A92` | Wordmark, primary CTA, focus, HAB accent |
| Brand primary deep | `#056B72` | Hover/pressed, emphasis |
| Brand soft | `#E6F5F6` | Selection, soft chips, HAB mount wash |
| Brand mist | `#F0F7F8` / `#F4F7F8` | Atmosphere / page canvas |

### Neutrals (clinical paper)

| Role | Value |
|------|-------|
| Ink | `#0F1C1E` |
| Ink secondary | `#3D5256` |
| Ink muted | `#6B7F84` |
| Line subtle | `#E8EEF0` |
| Surface base | `#F4F7F8` |
| Surface chrome | `#FFFFFF` |
| Surface raised | `#FFFFFF` |
| Surface muted | `#F8FAFB` |

### Semantic (safety)

| Intent | Foreground | Soft fill |
|--------|------------|-----------|
| Success / safe | `#0F7A5F` | Soft green wash |
| Warning | `#B45309` | `#FEF3C7` |
| Critical | `#B42318` | `#FEE4E2` |
| Info | `#3B6B73` | Cool slate wash |

**Rules:** Color never sole channel. Semantic colors reinforce labels/icons. AI/assist uses brand soft — **never a second purple AI brand**.

**Contrast:** Body ≥ 4.5:1; large/UI ≥ 3:1; focus ring distinguishable on mist and white.

## 5.3 Typography system

| Role | Character | Notes |
|------|-----------|-------|
| Display | Confident humanistic/geometric sans | Rare: landing, empty heroes |
| UI / Clinical body | Highly legible sans (e.g. Open Sans lineage or successor) | Encounter body ≥ 15–16px |
| Meta | Same family, smaller | Timestamps, helpers |
| Tabular / mono | Tabular nums | Vitals, doses, codes, IDs |

**Weights:** Regular · Medium · Semibold. Avoid ultra-light for clinical text.  
**Wordmark:** Always brand primary per Branding SSOT.

### Type scale (desktop baseline)

| Step | Size | Use |
|------|------|-----|
| Display | 32–40 | Brand moments |
| Title | 22–24 | Page / encounter |
| Section | 17–18 | Zone titles |
| Body | 15–16 | Clinical reading |
| Meta | 12–13 | Secondary |

## 5.4 Spacing system

Base unit **4px**. Preferred scale:

`0 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`

| Context | Rhythm |
|---------|--------|
| Compact (tables, agenda) | 4–8–12 |
| Comfortable (notes, portal) | 12–16–24 |
| Section breaks | 24–32–40 |

## 5.5 Elevation system

| Level | Name | Shadow (spirit) | Use |
|-------|------|-----------------|-----|
| E0 | Flat | none | Canvas, long reading |
| E1 | Resting | shadow-1 | Rows, subtle panels |
| E2 | Raised | shadow-2 | Side rails, modules |
| E3 | Floating | shadow-3 | Popovers, command |
| E4 | Authority / modal | shadow-focus (teal-tinted) | HAB, critical dialogs |

Prefer **border + E1/E2** over deep stacks. Never decorative E3+E4 stacks.

## 5.6 Shape language

- Softly rounded, clinical — not pill-everything  
- Radii: sm 8 · md 12 · lg 16 · xl 20 (align `--hd-radius-*`)  
- Full pills only for true tags/chips — not primary buttons by default  
- HAB mount: stronger top border (brand) rather than playful shape  

## 5.7 Borders

- Default: 1px `#E8EEF0`  
- Emphasis: 1–2px brand soft or primary at low alpha  
- Critical: semantic red border + label  
- Avoid heavy multi-borders and inset “skeuomorph frames”  

## 5.8 Shadows & blur

- Shadows: cool teal-black undertone (`rgba(2,44,44,…)`), soft, short  
- Blur: chrome/lobby only; max one full-width frost; respect reduced transparency  
- Opaque fallback always defined  

## 5.9 Glass / Liquid principles

| Allowed | Forbidden |
|---------|-----------|
| Top chrome frost over scroll | Glass over notes, Rx, alerts, HAB text |
| Tele lobby ambience | Nested blur stacks |
| Marketing/auth atmosphere | Rainbow borders / heavy refraction |

**Recipe (spec):** fill `rgba(255,255,255,0.72–0.86)` · blur 12–20px · 1px brand-tinted edge · optional top highlight.

## 5.10 Surface hierarchy

1. **Atmosphere** (mist canvas)  
2. **Chrome** (nav — may be liquid)  
3. **Work** (opaque raised)  
4. **Assist shelf** (soft brand wash, opaque content)  
5. **Authority** (HAB — highest attention, E4, opaque)  

## 5.11 Iconography

- Line icons, 1.5–2px stroke, rounded joins  
- Clinical metaphors over playful  
- Status always paired with text  
- No emoji as system iconography  

## 5.12 Illustration style

- Abstract continuity / calm clinic geometry  
- Teal + mist palette; minimal characters  
- Empty states: quiet hope, not cartoon chaos  
- Never medical gore or fear imagery  

## 5.13 Density scale

| Mode | Use |
|------|-----|
| Comfortable | Documentation, portal, education |
| Compact | Agenda, admin tables, multi-column ops |
| Touch | Mobile / tele controls (≥44px targets) |

Same tokens; spacing/type density shifts — not a second brand.

---

# 6. Motion Foundations

## 6.1 Motion philosophy

Motion **explains**. It never entertains.  
If removing motion loses meaning, replace with text/state — do not add more animation.

## 6.2 Timing

| Token | Duration | Use |
|-------|----------|-----|
| `motion.fast` | 150ms | Hover, color, border |
| `motion.base` | 200ms | Panel enter, focus shift |
| `motion.slow` | 250–320ms | Sheets, stage change |
| `motion.continuity` | ≤400ms | Rare journey morph |

Easing: ease-out entrances; ease-in-out spatial; **no bounce** on confirm/HAB.

## 6.3 Transition principles

- Shared-axis continuity between journey stages  
- Cross-fade content; keep chrome stable  
- AI streaming: stable container (no layout thrash)  
- Modal/HAB: peripheral calm + attention lock  

## 6.4 Micro-interactions

| Event | Behavior |
|-------|----------|
| Hover | Subtle border/bg; no lift circus |
| Focus | Brand ring; visible always |
| Selection | Brand soft fill + clear check/label |
| Press | Deep primary; instant feedback |
| Toggle | State label changes; color secondary |

## 6.5 Loading

- Skeletons matching final layout (not generic gray blocks of random width when avoidable)  
- Prefer local spinners over full-page blocking  
- Never infinite shimmer on clinical text  

## 6.6 Confirmation & error motion

- HAB present: E4 enter (slow), once  
- Error: brief attention (border/text); no shake loops  
- Fail-closed: single soft pulse optional; then static clarity  
- Success: quiet check; no confetti in clinical flows  

## 6.7 Attention guidance

- Move focus to the zone that needs the clinician  
- Do not auto-scroll documentation away during AI stream  
- Critical alerts pin; do not rely on toast alone for HAB/Rx  

## 6.8 Reduced motion

Under `prefers-reduced-motion`: essential feedback via color + text + icon only; decorative motion off.

---

# 7. Component Philosophy

> **Do not implement.** Define behavior so future UI is consistent.

**Default: no cards.** Cards only when the container *is* the interaction (slot, selectable tile). If removing chrome doesn’t hurt understanding, remove it.

### Workspace

One clinical world; zones with clear primary focus; brand in chrome; context banner when relevant.

### Sidebar / Navigation

Quiet, scannable; current location obvious; enterprise nav must not outrank encounter work.

### Timeline

Vertical clinical river; sticky day headers; teal nodes for acts; alerts pin; no social-feed theatrics.

### Clinical “cards”

Prefer rows/sections. When cards exist: low elevation, clear title, one purpose.

### AI Copilot

Docked assist shelf; provisional styling; Dispose/Accept suggestion lighter than HAB; no Emit/Confirm controls in assist.

### Telemedicine

Lobby calm (liquid allowed); in-call opaque controls; consent opaque; video primary.

### Scheduling

Readable grid; selection clear; Book ≠ Confirm clinically.

### Dashboards

Orient + next action; no stat-strip hero overload; brand present.

### Notifications

Calm inbox; Ack ≠ Confirm; severity color + label; no scream by default.

### Search

Fast, keyboard-first; results grouped; patient identity unambiguous.

### Tables

Compact density; tabular nums; sticky headers; row actions predictable.

### Forms

Large targets; inline errors; progressive sections; never color-only validation.

### Empty states

One sentence + one action; quiet illustration optional.

### Error states

Explain what failed, what to do; preserve entered data when safe.

### Mobile components

Sheets for assist; full-screen HAB; bottom-safe tele controls.

---

# 8. Clinical UX Guidelines

## 8.1 Patient experience

- Reassurance, plain language, large type  
- Show what to do next; hide clinical machinery  
- Post-emission deliverables clear; pre-emit not presented as legal Rx  
- Privacy-first empty states  

## 8.2 Physician experience

- Density on demand; encounter as home world  
- Assist optional; work always usable if AI degraded  
- HAB unmistakable when irreversible  

## 8.3 Staff experience

- Queues and tasks; **no** reserved HAB styling or controls  
- Clear “cannot confirm” when authority reserved  

## 8.4 Administrator experience

- Operational clarity; audit/export calm  
- Never restyle clinical confirm as admin “approve”  

## 8.5 Enterprise experience

- Multi-site chrome secondary to clinical identity  
- Policy banners informative; cannot look like HAB disable  

## 8.6 AI-assisted workflows

- Label suggestions as provisional  
- Evidence/why expandable  
- Degraded assist: amber + full manual path  

## 8.7 Longitudinal timeline

- Continuity informs; never looks like silent renew authority  
- Pin risks; quiet history  

## 8.8 Clinical decision support visualization

- Patterns/insights advisory; dismiss ≠ confirm  
- Separate from protocol advisory chrome if both present  

## 8.9 Video consultation

- Faces first; clinical panel as sheet/side  
- Connection loss: large recovery actions  

## 8.10 Multi-device continuity

- Resume place-in-care; same HAB/assist rules  
- Don’t require relearning patterns per device  

---

# 9. Clinical Safety Visual Rules

> Clarity over aesthetics. These surfaces may look “stricter” than the rest of HCX — by design.

| Concern | Visual rule |
|---------|-------------|
| **Human Authority Boundary** | Dedicated mount; brand top border + soft wash; labels “Confirmación de autoridad”; **no** Dispose/Accept-suggestion controls; E4 when modal; blocked styling if context unbound |
| **Prescription confirmation** | Opaque; medication list scannable; tabular doses; Confirm action distinct from “save draft”; never glass |
| **Clinical warnings** | Amber semantic + icon + text; sticky when in encounter |
| **Critical alerts** | Red semantic; high contrast; cannot be toast-only for allergies/ID mismatch |
| **Medication review** | Comparison layout; changes highlighted; confirm separate from scroll chrome |
| **Consent** | Opaque legal text; no frost; explicit action verbs |
| **Identity verification** | Patient identifiers prominent; photo/initials secondary; mismatch = critical pattern |

**Invariant visuals (UI-level reflection of COS — not redefinition):**

- Dispose ≠ Confirm ≠ Emit  
- Unbound context → blocked assist/HAB affordances with clear banner  
- Staff surfaces omit physician HAB controls  

---

# 10. Accessibility Guidelines

- WCAG 2.2 **AA** minimum; AAA for critical clinical text where feasible  
- Focus visible (brand ring) on all interactive elements  
- Hit targets ≥ 44×44 on touch  
- Do not rely on color alone  
- Live regions for fail-closed, connection loss, critical alerts  
- Screen-reader names for icon-only controls  
- Errors adjacent to fields  
- `prefers-reduced-motion` / `prefers-reduced-transparency` / contrast needs respected  
- Keyboard: full path for encounter essentials and HAB  

---

# 11. Mobile Guidelines

| Topic | Rule |
|-------|------|
| Layout | Single column; assist as sheet; HAB full-screen |
| Type | Body ≥ 16px where inputs exist |
| Nav | Collapsible or bottom; brand visible |
| Tele | Safe areas; dominant hang-up |
| Performance | Disable blur on low power / reduced transparency |
| Offline | Opaque banners; no eternal skeleton |
| Thumb zone | Primary actions reachable; destructive not easy-miss |

---

# 12. AI Interaction Guidelines

| Pattern | Spec |
|---------|------|
| Propose | Soft brand surface; “Sugerencia” / provisional label |
| Dispose / Accept suggestion | Secondary controls; lighter than HAB |
| Stream | Stable box; subtle progress; no jump |
| Degraded | Amber banner; manual workspace intact |
| Evidence | Expandable; calm; no sparkle “magic” |
| Multi-agent theater | **Forbidden** as product metaphor |
| Placement | Consistent dock (desktop right); never sticker over notes |
| Chromatic | Brand soft only — no purple AI skin |

---

# 13. Telemedicine Experience Guidelines

| Moment | Treatment |
|--------|-----------|
| Lobby | Calm liquid chrome + clear Join |
| Consent | Opaque, high contrast |
| In-call | Opaque control bar; video dominant |
| Poor connection | Warning/critical banners + recovery |
| Clinical side panel | Available without covering faces by default |
| End | Quiet summary; no celebration noise |
| Mobile | Full-bleed video; sheet for clinical tools |

Join ≠ Confirm · Book ≠ Confirm · Recording indicators must be honest and visible.

---

# 14. Design Tokens (future architecture)

> Specification only — naming for future implementation. No code in this program.

### Naming convention

`hcx.{group}.{role}.{variant}`  
Legacy bridge: map to existing `--hd-*` where overlapping.

### Token groups

| Group | Examples |
|-------|----------|
| **Color** | `hcx.color.brand.primary`, `.ink`, `.semantic.critical`, `.surface.base` |
| **Typography** | `hcx.font.family.ui`, `hcx.font.size.body`, `hcx.font.weight.semibold` |
| **Spacing** | `hcx.space.1` … `hcx.space.16` (4px grid) |
| **Radius** | `hcx.radius.sm|md|lg|xl` |
| **Elevation** | `hcx.elevation.0` … `hcx.elevation.4` |
| **Blur** | `hcx.blur.chrome`, `hcx.blur.lobby` |
| **Motion** | `hcx.motion.duration.fast|base|slow`, `hcx.motion.easing.standard` |
| **Border** | `hcx.border.subtle`, `hcx.border.brand` |
| **Z-index** | `hcx.z.chrome`, `.module`, `.assist`, `.hab`, `.system` (align overlay contract spirit) |
| **Breakpoint** | `hcx.bp.sm|md|lg|xl` (e.g. 640 / 768 / 1024 / 1280) |
| **Density** | `hcx.density.comfortable|compact|touch` |
| **Opacity** | `hcx.opacity.glass.fill` |

### Z-index philosophy (design)

Chrome < Module < Assist < HAB/Authority < System (toasts/critical OS-level).  
Exact integers deferred to implementation mapping of existing overlay tokens.

### Breakpoints (design targets)

| Name | Min width | Layout intent |
|------|-----------|---------------|
| sm | 0 | Single column |
| md | 768 | Sheet assist |
| lg | 1024 | Dual zone |
| xl | 1280 | Tri-zone workspace |

---

# 15. Future Evolution Strategy

| Horizon | Intent |
|---------|--------|
| **HCX 1.x** | Token board, Figma foundations, non-clinical chrome → workspace chrome (flag-gated) |
| **HCX 2.0** | Optional dark theme as *theme*, not new identity; denser enterprise packs |
| **HCX Continuity** | Cross-product pattern library; illustration pack; motion QA checklist |
| **Governance** | New patterns require HCX review; forking dialects forbidden |
| **COS relationship** | UX may visualize frozen invariants; never redefine engines/EDPs |

**Adoption rule:** Implementation programs consume HCX; they do not invent parallel design systems.

**Liquid Experience:** Treated as absorbed vocabulary (liquid surfaces, calm motion). HCX is the **system of record**.

---

# 16. Glossary

| Term | Meaning in HCX |
|------|----------------|
| **HCX** | HeyDoctor Clinical Experience System — official UX/UI system |
| **Liquid Clinical** | Visual metaphor: continuous calm flow; not decorative water/glass everywhere |
| **Chrome** | App framing (nav, top bars) |
| **Work surface** | Opaque clinical reading/editing area |
| **Assist shelf** | Copilot/propose UI zone |
| **Confirmation Mount / HAB UI** | Visual expression of Human Authority Boundary — not the engine itself |
| **Dispose** | Copilot disposition of a suggestion — not clinical Confirm |
| **Confirm** | Physician authority act UI — irreversible challenge |
| **Emit** | Out of HCX ownership; UI must not look like emit from assist |
| **Fail-closed UI** | Blocked affordances + clear banner when preconditions missing |
| **Density** | Comfortable / compact / touch spacing modes |
| **Brand test** | Identity recognizable without logo |
| **Calm Technology** | Interrupt only when useful; reduce ambient noise |
| **Progressive disclosure** | Details on demand; essentials persistent |
| **Trust by Design** | Honest states; no fake certainty |
| **Token** | Named design decision for future implementation |
| **COS** | Clinical Operating System — frozen architecture; HCX does not modify it |

---

# 17. Success Criteria (completeness)

HCX v1.0 is complete when a future frontend team can:

1. Choose color, type, space, elevation, motion **without inventing**  
2. Build workspace / assist / HAB / tele / portal **with one pattern language**  
3. Keep Dispose ≠ Confirm ≠ Emit **visually obvious**  
4. Meet AA accessibility and mobile integrity by following this doc  
5. Extend products without forking a second design system  

---

# 18. Document control

| Field | Value |
|-------|-------|
| Document | HeyDoctor Clinical Experience System (HCX) v1.0 |
| Type | Official UX/UI specification |
| Implementation | **None** |
| Commits required by this directive | **None** |
| COS / EDP / HAB / Context / PE / Backend impact | **None** |

**End of HeyDoctor Clinical Experience System (HCX) v1.0.**
