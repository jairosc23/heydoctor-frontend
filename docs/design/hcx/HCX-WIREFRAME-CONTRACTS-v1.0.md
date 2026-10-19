# HCX Wireframe Contracts v1.0  
## Spatial Behaviour Without UI Technology

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 4 — Surface Recipes & Wireframe Contracts |
| **Document** | HCX Wireframe Contracts |
| **Version** | 1.0 |
| **Status** | Official — **no implementation** |
| **Companion** | `HCX-SURFACE-RECIPES-v1.0.md` |
| **Path** | `docs/design/hcx/HCX-WIREFRAME-CONTRACTS-v1.0.md` |

**Laws:** Spec only · no React · no CSS · no Tailwind · no code · no Figma file required by this text · no commits.

Wireframe Contracts define **regions, adjacency, persistence, and stacking** so any future tool (Figma, code, paper) can place surfaces correctly.

---

## 1. Contract primitives

| Primitive | Meaning |
|-----------|---------|
| **Region** | Named rectangle in the workspace blueprint |
| **Persistent** | Remains while the workspace mode is active |
| **Transient** | Opens/closes without destroying persistent identity |
| **Overlay** | Above content; must declare z-band (chrome < assist < HAB < system) |
| **Focus owner** | Region that should receive keyboard focus on open |
| **Blocked** | Region visible but non-interactive (fail-closed) |

---

## 2. Global stacking contract

```
z.base        content / documentation / orders / timeline body
z.chrome      workspace header + nav
z.assist      AI dock / assist sheet
z.hab         Human Authority Zone (modal or attention band)
z.system      critical system / offline / session expiry
```

**Rule:** Assist must never stack above HAB while HAB is open.  
**Rule:** System offline/session can stack above HAB only for safety interrupt.

---

## 3. Physician encounter wireframe (xl)

```
+------------------+--------------------------------+------------------+
| HEADER (persist) | HEADER continued               | HEADER           |
+------------------+--------------------------------+------------------+
| TIMELINE         | DOCUMENTATION / CLINICAL WORK  | AI DOCK          |
| (persist rail)   | (focus owner default)          | (transient OK)   |
|                  | ORDERS / Rx REVIEW (swap in)   |                  |
+------------------+--------------------------------+------------------+
| HUMAN AUTHORITY ZONE (transient overlay/band; focus owner when open) |
+----------------------------------------------------------------------+
```

| Region | Surface recipe | Persist | Notes |
|--------|----------------|---------|-------|
| Header | Workspace Header | Yes | Identity sticky |
| Timeline | Timeline Surface | Yes (collapsible) | Orientation |
| Clinical work | Documentation / Orders / Rx Review | Yes (mode swap) | One primary mode |
| AI Dock | AI Dock | Optional | Dispose only |
| HAB Zone | Human Authority Zone | On demand | Blocks assist interaction |

**Journey chrome:** thin strip under header or above clinical work — not a fifth competing column.

---

## 4. Physician encounter wireframe (sm)

```
+---------------------------+
| HEADER                    |
+---------------------------+
| CONTEXT / JOURNEY STRIP   |
+---------------------------+
| CLINICAL WORK (primary)   |
+---------------------------+
| [Assist sheet] transient  |
| [HAB full-screen]         |
| [Search/Notif sheets]     |
+---------------------------+
```

Timeline collapses into a top sheet or secondary tab — never loses pin alerts.

---

## 5. Patient portal wireframe

```
+---------------------------+
| HEADER (brand + patient)  |
+---------------------------+
| HOME FOCAL (next action)  |
+---------------------------+
| CONTENT (docs/appts/msg)  |
+---------------------------+
| NAV (bottom or side)      |
+---------------------------+
```

| Forbidden regions | HAB physician zone · AI clinical dock as Confirm |
|-------------------|--------------------------------------------------|

---

## 6. Staff queue wireframe

```
+-------------+----------------------+
| HEADER      | HEADER               |
+-------------+----------------------+
| WORKLIST    | DETAIL / TASK PANEL  |
| (compact)   |                      |
+-------------+----------------------+
```

HAB physician controls **absent**. Blocked state copy when action requires physician.

---

## 7. Admin / Enterprise wireframes

**Admin**

```
+--------+---------------------------+
| NAV    | CONFIG WORK + PREVIEW     |
| TREE   |                           |
+--------+---------------------------+
```

**Enterprise**

```
+------------------+------------------+
| ORG CHROME       | SITE SWITCHER    |
+------------------+------------------+
| PORTFOLIO        | EMBEDDED CLINIC  |
|                  | (physician/staff)|
+------------------+------------------+
```

Embedded clinic inherits physician/staff contracts; org chrome must not restyle HAB.

---

## 8. Telemedicine wireframe

**Lobby**

```
+---------------------------+
| BRAND + JOIN + CONSENT    |
| (opaque consent block)    |
+---------------------------+
```

**In-call**

```
+------------------+--------+
| REMOTE VIDEO     | SELF   |
| (dominant)       |        |
+------------------+--------+
| CONTROLS BAR (persist)    |
+---------------------------+
| CLINICAL SHEET (transient)|
+---------------------------+
```

Assist may open in clinical sheet — still Dispose≠Confirm.

---

## 9. Overlay contracts

| Overlay | Focus owner | Dismiss | Blocks |
|---------|-------------|---------|--------|
| Search sheet | Search field | Esc / back | None clinically |
| Notification inbox | List | Esc | None |
| AI assist sheet | Suggestion / Dispose | Esc | Must not open over HAB |
| HAB challenge | Confirm control | Explicit Abort/Reject/back policy | Clinical work + assist |
| Offline banner | Non-modal | Cleared on online | Unsafe actions disabled |
| Error modal | Retry/close | After read | As needed |

---

## 10. Mode swap contract (clinical work column)

Only **one** primary mode occupies clinical work at a time:

| Mode | Surface |
|------|---------|
| Document | Documentation Surface |
| Orders | Orders Surface |
| Rx review | Prescription Review Surface |
| Explore | Mixed read-only clinical summary (optional) |

Mode swap must preserve header identity and timeline pins.

---

## 11. Empty / Error / Offline placement

| Surface | Placement |
|---------|-----------|
| Empty | Inside the region that lacks data (not global splash unless first-run) |
| Error | Inline in region; modal if blocking whole workspace |
| Offline | Top persistent banner under header across workspace |

---

## 12. Multi-monitor contract

| Display | Allowed |
|---------|---------|
| Primary | Header + Clinical work + HAB |
| Secondary | Timeline and/or AI Dock |
| Never | HAB-only on secondary without identity on same visual field as act summary |

---

## 13. Mapping to recipes & patterns

| Wireframe region | Recipe | Key patterns |
|------------------|--------|--------------|
| Header | Workspace Header | Dashboard · Auth |
| Nav | Workspace Navigation | Role blueprints |
| Timeline | Timeline Surface | Timeline Navigation |
| AI Dock | AI Dock | Copilot |
| HAB | Human Authority Zone | HAB Confirmation |
| Clinical modes | Documentation / Orders / Rx | Doc · Order Review · Rx Review |
| Tele | Telemedicine Surface | Tele Session |
| Home | Dashboard Surface | Dashboard |
| Alerts | Notification Surface | Notification |
| Find | Search Surface | Search · Selection |
| Absence | Empty Surface | Empty |
| Failure | Error Surface | Error Recovery |
| Offline | Offline Surface | Offline Recovery |

---

## 14. Acceptance (design)

A wireframe (any tool) complies when:

1. Regions match this adjacency/persistence model  
2. HAB and AI Dock are distinct  
3. Stacking order respected  
4. Mobile recomposition preserves identity + fail-closed  
5. No technology-specific widgets are required by the contract  

---

## 15. Recommended next HCX phase

**HCX Phase 5 — Content & Microcopy Matrix** (labels for Dispose vs Confirm, empty/error strings, SR names) — still no production UI unless separately authorized.

---

## Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| COS impact | **None** |

**End of HCX Wireframe Contracts v1.0.**
