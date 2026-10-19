# HeyDoctor Liquid Experience  
## Design Specification v1.0

| Field | Value |
|-------|-------|
| **Program** | HeyDoctor Liquid Experience |
| **Document** | Visual evolution & UX vision |
| **Version** | 1.0 |
| **Status** | Design specification — **no implementation** |
| **Scope** | Frontend visual language & experience vision only |
| **Independence** | Independent from COS Wave implementation |
| **Architecture** | Clinical Operating System Baseline v1.0 remains **frozen** |

**Laws for this document:** Design only · no code · no commits · no EDP changes · no HAB / PE / Clinical Context / backend redesign.

**Brand inheritance:** Evolves Branding SSOT (`#078A92` primary) and existing `--hd-*` token spirit — does not invent a parallel brand.

---

## 0. Purpose

Define the **next-generation visual identity and interaction vision** for HeyDoctor: a premium, calm, clinically trustworthy healthcare product experience that feels fluid (“liquid”) without sacrificing safety, readability, or accessibility.

This is **not** an imitation of Epic, Athena, Linear, Apple Health, or generic “AI SaaS glass” aesthetics.  
It is a **recognizable HeyDoctor language**: clinical clarity + human warmth + continuous flow.

---

## 1. Design principles (non-negotiable)

| # | Principle | Product meaning |
|---|-----------|-----------------|
| P1 | **Clinical safety first** | Irreversible acts, alerts, and authority moments must never be visually ambiguous or buried in decoration. |
| P2 | **Calm, premium, trustworthy** | Quiet confidence; no spectacle; materials feel considered, not trendy. |
| P3 | **Fluid interactions** | Transitions communicate continuity of care, not animation for its own sake. |
| P4 | **High readability** | Typography and contrast win over translucency whenever clinical content is present. |
| P5 | **Excellent accessibility** | WCAG 2.2 AA minimum; focus, motion, and color never sole-channel meaning. |
| P6 | **Responsive** | One system; layouts recompose — authority semantics do not. |
| P7 | **Performance-conscious** | Prefer CSS, few layers, limited blur; no permanent full-viewport filters. |
| P8 | **Motion with purpose** | Motion marks state change, attention shift, or continuity — never decoration loops. |
| P9 | **Visual consistency** | Tokens, elevation, and component recipes are shared across panel, portal, tele, and marketing. |

---

## 2. Visual language — “Liquid Clinical”

### 2.1 Metaphor

**Liquid** = care that *flows* without friction: encounter stages, context continuity, assist → human decision → outcome — as one continuous clinical world.

**Not** = water wallpaper, blobs, or constant glass overlays.

### 2.2 Signature traits (brand test)

If the first viewport could belong to another health SaaS after removing the logo, branding is too weak. Liquid Experience requires:

1. **Teal presence** as a structural accent (not only buttons).  
2. **Soft clinical atmosphere** (cool neutrals with teal undertone).  
3. **Clear authority hierarchy** in layout (work vs assist vs confirm).  
4. **Wordmark / BrandLogo** as a recognizable hero or chrome anchor on primary surfaces.

### 2.3 Anti-identity (explicitly avoid)

- Purple / indigo “AI default” gradients  
- Warm cream + terracotta editorial cliché  
- Dense broadsheet / newspaper clinical grids  
- Neon glow, heavy multi-layer shadows, emoji ornament  
- Pill-cluster dashboards and stat-strip hero overload  
- Glass over clinical text that reduces contrast  
- Dark mode as the product default (optional later; not v1 identity)

---

## 3. Color system

### 3.1 Brand core (inherited + extended)

| Token role | Value | Usage |
|------------|-------|--------|
| **Brand primary** | `#078A92` | Wordmark, key CTAs, focus rings, structural accents |
| **Brand primary deep** | `#056B72` | Hover/pressed primary; emphasis text |
| **Brand primary soft** | `#E6F5F6` | Selected rows, soft chips, ambient washes |
| **Brand mist** | `#F0F7F8` | Page atmosphere (evolves `--hd-surface-base`) |

### 3.2 Neutrals (clinical paper)

| Token | Value | Usage |
|-------|-------|--------|
| Ink | `#0F1C1E` | Primary text |
| Ink secondary | `#3D5256` | Secondary text |
| Ink muted | `#6B7F84` | Meta, timestamps |
| Line subtle | `#E8EEF0` | Borders (keep `--hd-border-subtle` spirit) |
| Surface base | `#F4F7F8` | App canvas |
| Surface chrome | `#FFFFFF` | Nav, top bars |
| Surface raised | `#FFFFFF` | Interactive panels that must stay opaque |
| Surface muted | `#F8FAFB` | Nested wells |

### 3.3 Semantic clinical (safety)

| Intent | Color | Rule |
|--------|-------|------|
| Success / safe | Teal-leaning green `#0F7A5F` | Confirm success feedback; never sole “go ahead” for HAB |
| Warning | Amber `#B45309` / soft `#FEF3C7` | Caution, unbound context, degraded assist |
| Critical / danger | `#B42318` / soft `#FEE4E2` | Alerts, allergy, fail-closed blocks |
| Info | Cool slate-teal `#3B6B73` | Neutral guidance |

**Rule:** Semantic color **reinforces** status; labels and icons must also convey meaning.

### 3.4 AI / assist chromatic discipline

Assist surfaces use **primary soft + mist**, never a second “AI purple brand.”  
Intelligence is a *tone of the same brand*, not a product-within-a-product.

### 3.5 Contrast targets

- Body text on surfaces: ≥ 4.5:1  
- Large text / UI chrome: ≥ 3:1  
- Focus ring: brand primary on white/mist, 3:1 against adjacent colors  
- Glass layers: never used as sole background for long-form clinical prose

---

## 4. Elevation system

Five disciplined levels (evolve `--hd-shadow-*`):

| Level | Name | Treatment | When |
|-------|------|-----------|------|
| **E0** | Flat canvas | No shadow | Page background, large reading areas |
| **E1** | Resting | `0 1px 2px rgba(2,44,44,0.05)` | List rows, subtle separators |
| **E2** | Raised | `0 2px 10px rgba(2,44,44,0.06)` | Panels, side rails |
| **E3** | Floating | `0 8px 24px rgba(2,44,44,0.08)` | Popovers, command palette |
| **E4** | Focus / modal | `0 12px 32px rgba(7,138,146,0.12)` | Modals, HAB confirmation stage |

**Rules**

- Prefer **border + E1/E2** over deep stacks.  
- Never stack E3+E4 for decoration.  
- Clinical documentation editors stay E0–E2 for calm reading.

---

## 5. Glass / Liquid surfaces

### 5.1 When glass is appropriate

| Surface | Allowed | Intent |
|---------|---------|--------|
| App chrome (top nav blur over scrolling content) | Yes, light | Continuity while scrolling |
| Telemedicine lobby / waiting ambience | Yes, moderate | Calm presence before clinical work |
| Marketing / auth hero atmosphere | Yes | Brand emotion |
| Assist “ambient” shelf behind opaque content | Soft wash only | Suggest fluidity |
| Clinical notes, Rx composition, alerts, HAB | **No glass** | Safety & readability |
| Data tables, timelines of facts | **No glass** | Scanability |

### 5.2 Liquid surface recipe (spec only)

- **Frost:** `backdrop-filter: blur(12–20px)` max; disable when `prefers-reduced-transparency`  
- **Fill:** `rgba(255,255,255,0.72–0.86)` on light theme  
- **Edge:** 1px `rgba(7,138,146,0.12)` or neutral line  
- **Refraction accent:** optional 1px inner highlight top edge — never rainbow borders  

### 5.3 Performance guardrails

- Max **one** full-width frosted chrome layer per view  
- No nested blur stacks  
- Respect `prefers-reduced-motion` and reduced transparency  
- Provide opaque fallback token `--hd-surface-chrome-solid`

---

## 6. Typography

### 6.1 Roles

| Role | Character | Usage |
|------|-----------|--------|
| **Display** | Confident, slightly soft geometric or humanistic sans | Landing, empty states, brand moments |
| **UI** | Highly legible sans (system or licensed clinical UI face) | App chrome, forms, tables |
| **Clinical body** | UI face at comfortable size (16px+ body in encounter) | Notes, plans, timelines |
| **Mono / code** | Tabular nums for vitals, codes, Rx quantities | CIE-10, doses, IDs |

### 6.2 Scale (desktop baseline)

| Step | Size | Use |
|------|------|-----|
| Display | 32–40 | Rare brand/hero |
| Title | 22–24 | Page / encounter title |
| Section | 17–18 | Zone titles |
| Body | 15–16 | Clinical reading |
| Meta | 12–13 | Timestamps, helpers |

**Rule:** Prefer fewer weights (Regular / Medium / Semibold). Avoid ultra-light for clinical text.

### 6.3 Brand wordmark

Continue Branding SSOT: wordmark in primary `#078A92`; never recolor to purple/black for “premium.”

---

## 7. Motion principles

### 7.1 Timing tokens (align with existing)

| Token | Duration | Use |
|-------|----------|-----|
| Fast | 150ms | Hover, border, color |
| Base | 200ms | Panel enter, focus shift |
| Slow | 250–320ms | Stage transitions, sheet present |
| Continuity | 400ms max | Journey stage morph — rare |

Easing: standard ease-out for entrances; ease-in-out for spatial moves. No bounce on clinical confirms.

### 7.2 Purposeful motion catalog

| Motion | Meaning |
|--------|---------|
| **Stage glide** | Journey advances; content cross-fades with shared axis |
| **Focus deepen** | Primary work zone subtly scales elevation E1→E2 |
| **Assist arrive** | Assist shelf slides/fades from consistent edge |
| **Confirm present** | Confirmation mount enters with E4 + reduced peripheral motion (attention lock) |
| **Fail-closed pulse** | Soft amber border breath once — not infinite loop |
| **Tele connect** | Connection quality indicator eases; no celebratory confetti |

### 7.3 Forbidden motion

- Infinite shimmer on clinical text  
- Parallax on encounter workspace  
- Layout thrash when AI streams tokens (prefer stable skeleton → content)  
- Motion that implies “AI decided” (no auto-check animations on irreversible acts)

### 7.4 Reduced motion

All essential feedback available without motion (color + text + icon). Decorative motion off under `prefers-reduced-motion`.

---

## 8. Component philosophy

### 8.1 Composition over card spam

**Default: no cards.**  
Use cards only when the container *is* the interaction (e.g., selectable appointment slot, tele participant tile).  
If removing border/shadow/radius does not hurt understanding, it should not be a card.

### 8.2 Component families

| Family | Behavior |
|--------|----------|
| **Chrome** | Nav, rails — may use light liquid frost |
| **Work surfaces** | Opaque, high contrast, calm |
| **Inputs** | Large hit targets; clear invalid/focus; never rely on color alone |
| **Actions** | Primary = brand teal; secondary = quiet; destructive = semantic red |
| **Authority actions** | Visually distinct from “Accept suggestion” / Dispose — stronger weight, dedicated mount |
| **Assist chips** | Soft primary; disposable; never look like final clinical truth |
| **Banners** | Full-bleed status (context unbound, degraded) — high clarity |
| **Overlays** | Modal/sheet with E4; dim backdrop; focus trap |

### 8.3 Density modes

| Mode | Where |
|------|--------|
| **Comfortable** | Encounter documentation, patient portal |
| **Compact** | Agenda multi-column, admin tables |
| Same tokens; spacing scale shifts — not a second visual brand |

### 8.4 Iconography

Simple line icons, 1.5–2px stroke, rounded joins. Clinical metaphors over playful. Status icons paired with text.

---

## 9. Workspace layout (physician)

### 9.1 Spatial model

One clinical world composed of **zones** (not a dashboard of widgets):

```
┌─────────────────────────────────────────────────────────────┐
│  Chrome (brand · patient identity · context status)         │
├────────────┬──────────────────────────────┬─────────────────┤
│ Orientation│     Clinical Work (primary)  │ Assist (optional)│
│ / timeline │     Documentation / plan     │ propose/dispose  │
│ cues       │                              │                  │
├────────────┴──────────────────────────────┴─────────────────┤
│  Confirmation mount (when irreversible) — full attention     │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Layout laws

1. **One primary job** in the viewport’s focus zone.  
2. Assist never overlays and obscures HAB/confirmation.  
3. Context unbound banner sits above work — fail-closed is visible.  
4. Therapy / docs / assist mounts are hosted; they do not each invent chrome.  
5. Brand mark remains readable in chrome (nav variant).

### 9.3 Responsive recomposition

| Breakpoint | Behavior |
|------------|----------|
| ≥1280 | Tri-zone as above |
| 768–1279 | Assist as sheet/drawer; orientation collapses to top strip |
| <768 | Single column: identity → work → assist sheet → confirm full-screen |

---

## 10. AI interaction patterns

### 10.1 Personality

Assistive, provisional, **never authoritative**. Visual language must make Dispose/Accept-suggestion feel lighter than Confirm.

### 10.2 Patterns

| Pattern | Spec |
|---------|------|
| **Propose** | Soft primary surface; “Sugerencia” label; dismissible |
| **Dispose / Accept suggestion** | Secondary control; does not use primary destructive/confirm styling |
| **Streaming** | Stable container; caret or subtle progress; no layout jump |
| **Degraded assist** | Amber banner + manual workspace fully usable |
| **Evidence / why** | Expandable meta; calm typography; no “magic” sparkle |
| **Multi-agent theater** | Forbidden as product UI metaphor |

### 10.3 Placement

Assist docks to a consistent edge (right on desktop). Never floats as a sticker over clinical notes.

---

## 11. Timeline experience

### 11.1 Intent

A **readable clinical river**: what happened, when, and what matters now — not a social feed.

### 11.2 Visual rules

- Vertical spine in brand soft / ink muted  
- Event nodes: small filled teal for clinical acts; outline for informational  
- Group by day with sticky day headers  
- Vitals / labs as compact rows with tabular numbers  
- Alerts pin above the fold with semantic color  
- Hover reveals source meta; click opens detail in work zone (no nested modal maze)

### 11.3 Motion

New events ease in from the spine (base timing). No auto-scroll stealing physician focus during active documentation.

---

## 12. Telemedicine experience

### 12.1 Emotional tone

Waiting room = calm clinic lobby, not entertainment app.

### 12.2 Surfaces

| Moment | Treatment |
|--------|-----------|
| Lobby / pre-join | Soft liquid chrome + brand; clear “Join” CTA |
| In-call | Opaque controls bar; video dominant; minimal chrome |
| Connection issues | Amber/critical banners; large readable recovery actions |
| Consent | Opaque, high contrast, no glass over legal text |
| End call summary | Quiet summary card optional; no confetti |

### 12.3 Layout

- Patient video primary; self-view small  
- Clinical side panel (notes/assist) available without covering faces by default  
- Mobile: video full-bleed; controls bottom; clinical panel as sheet

---

## 13. Dashboard experience

### 13.1 Philosophy

**Orientation, not ornament.** First viewport: brand + today’s clinical focus + one clear next action. Avoid stat-strip hero overload.

### 13.2 Structure

1. Chrome with BrandLogo  
2. “Hoy” focal strip (next appointments / open encounters)  
3. Secondary modules (agenda slice, messages count) — quiet  
4. No marketplace-style cards wall  

### 13.3 Visual

- Mist canvas + raised list rows (E1)  
- Primary CTA in brand teal  
- Empty states with calm illustration (abstract clinical continuity, not clipart)

---

## 14. Mobile adaptation

| Concern | Spec |
|---------|------|
| Touch targets | ≥ 44×44 px |
| Typography | Body ≥ 16px to reduce zoom/input issues |
| Navigation | Bottom or collapsible; brand visible |
| Encounter | Single-column; confirm full-screen |
| Tele | System-safe areas; large hang-up |
| Performance | Disable blur on low-power / reduced transparency |
| Offline / poor network | Opaque banners; no skeleton eternal |

---

## 15. Accessibility checklist (design)

- [ ] Color never sole indicator  
- [ ] Focus visible (brand ring) on all interactive elements  
- [ ] HAB / irreversible styling distinct from assist dispose  
- [ ] Live regions for fail-closed and connection loss  
- [ ] Contrast AA on all clinical text  
- [ ] Reduced motion / reduced transparency paths defined  
- [ ] Screen reader names for icon-only controls  
- [ ] Error text adjacent to fields, not only toast

---

## 16. Experience QA — “Liquid feel” without safety debt

| Question | Pass criterion |
|----------|----------------|
| Is the brand recognizable without the logo? | Teal structure + mist atmosphere present |
| Can a physician read notes for 20 minutes? | No fatigue from glass/shadow noise |
| Is Confirm visually different from Accept suggestion? | Yes, unmistakable |
| Does motion explain a state change? | Yes, or it is removed |
| Does mobile preserve authority order? | Confirm still blocking and clear |

---

## 17. Relationship to existing SSOT

| Existing | Liquid Experience stance |
|----------|---------------------------|
| Branding SSOT (`#078A92`, BrandLogo) | **Preserve**; elevate presence |
| `--hd-*` tokens in `globals.css` | **Evolve** as token expansion (future implementation) |
| Clinical workspace layouts | **Reskin/recompose** visually; do not redefine COS authority |
| COS / HAB / PE / Context | **Out of scope** — frozen architecture |

---

## 18. Out of scope (this specification)

- Implementation, CSS delivery, component code  
- Changes to COS Architecture, EDPs, HAB, PE, Clinical Context engines  
- Backend / API / schema work  
- Copywriting full content library  
- Dark theme as default identity  

---

## 19. Suggested future delivery phases (design → later build)

| Phase | Design deliverable | Build (later, separate PO auth) |
|-------|--------------------|--------------------------------|
| L0 | This spec (done) | — |
| L1 | Token board + Figma foundations | Token CSS mapping |
| L2 | Chrome + dashboard + portal | Non-clinical surfaces first |
| L3 | Workspace liquid layout | Encounter chrome only |
| L4 | Assist + timeline + tele polish | Flag-gated UX |

No phase above authorizes architecture change.

---

## 20. Document control

| Field | Value |
|-------|-------|
| Document | HeyDoctor Liquid Experience Design Spec v1.0 |
| Type | Design specification only |
| Code / commits | **None** |
| COS impact | **None** |

**End of HeyDoctor Liquid Experience Design Specification v1.0.**
