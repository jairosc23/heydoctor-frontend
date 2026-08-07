# Encounter Shell — Clinical Operating System Architecture (SSOT)

| Field | Value |
|-------|-------|
| **Status** | **OFFICIAL** |
| **Architecture** | **FROZEN** |
| **Runtime** | **STABLE** · **SINGLE** |
| **Production** | **READY** (subject to CI · Preview · Smoke) |
| **Navigation** | **SSOT** |
| **Clinical Snapshot** | **SINGLE SOURCE OF CONTEXT** |
| **Encounter Memory** | **SINGLE** |
| **Providers** | **SINGLE MOUNT** |
| **Bootstrap** | **SINGLE** |
| **Product** | **HeyDoctor Copilot** — Clinical Operating System |
| **Architecture review** | **FINAL GO FOR MERGE** |
| **Enterprise baseline** | After merge gates GREEN |
| **Next phase** | **Clinical Intelligence** (extends this foundation) |
| **Change control** | Requires explicit Product + Architecture approval |

This document freezes the **Encounter Shell** as the sole clinical operating surface of the HeyDoctor Clinical Workspace.

**FINAL GO FOR MERGE** (Architecture Review).  
When CI · Preview · Smoke are GREEN, Encounter Shell becomes the **official enterprise baseline**. Architecture is **FROZEN**.

Future work must **extend** this foundation without introducing parallel runtimes, providers, navigation systems, or context sources.

---

## Architecture stack (canonical)

```
Encounter
    ↓
Encounter Shell
    ↓
Runtime
    ↓
Memory
    ↓
Clinical Snapshot
    ↓
Capabilities
```

| Layer | Meaning |
|-------|---------|
| **Encounter** | The clinical consultation session (route `/panel/consultas/[id]`) |
| **Encounter Shell** | One persistent workspace — never a stack of separate products |
| **Runtime** | Single HeyDoctor Copilot runtime tree for the encounter |
| **Memory** | Single Encounter Memory SSOT (in-encounter) |
| **Clinical Snapshot** | Single shared clinical context from Memory (+ shell supplements) |
| **Capabilities** | Views of the same intelligence (Insights, Continuity, Voice, Review, Evidence, …) |

---

## Frozen invariants

| Invariant | Rule |
|-----------|------|
| Runtime | **SINGLE** — one mount; no remount on Full Record, Continuity, or capability switches |
| Navigation | **SSOT** — `lib/encounter/navigation/*` owns section scroll / chrome offset |
| Clinical Snapshot | **SINGLE SOURCE OF CONTEXT** — `EncounterClinicalSnapshotProvider` + `useClinicalSnapshot()` |
| Encounter Memory | **SINGLE** — one `EncounterMemoryProvider` per encounter |
| Providers | **SINGLE MOUNT** — `HeyDoctorCopilotRuntimeProviders` only on the encounter page |
| Bootstrap | **SINGLE** — lazy (Workspace open) or eager flag; never duplicated |

---

## Product identity

| Field | Value |
|-------|-------|
| Product | **HeyDoctor Copilot** |
| Role | **Clinical Operating System** of the encounter |
| Authority | **NON_AUTHORITY** · Human-in-the-Loop |
| Brand | Does not rename or supersede Brand SSOT |

**Related SSOTs (do not conflict):**

| Document | Role |
|----------|------|
| `HEYDOCTOR-COPILOT-BRAND.md` | Identity · Brand Promise |
| `HEYDOCTOR-COPILOT-CLINICAL-OPERATING-SYSTEM.md` | Product philosophy |
| `LANDING-HERO-SSOT.md` | Landing visual identity |
| **This document** | Encounter Shell architecture freeze |

---

## Capabilities (same Snapshot)

All of the following consume **exactly** the shared Clinical Snapshot:

- Foundation (context feed into Snapshot supplements)
- Clinical Insights
- Assistant
- Continuity (Encounter Timeline — React-only in-shell surface)
- Voice
- Review & Sign
- Evidence
- Full Clinical Record (React-only in-shell surface — same ownership model as Continuity)

---

## Full Record ownership (frozen)

| Rule | Value |
|------|-------|
| Model | **React-only** in-shell surface (same as Continuity) |
| Open / close | React state only — no route change |
| History API | **Forbidden** — no `pushState` / `replaceState` / `popstate` |
| URL overlay param | **Forbidden** — no `?ficha` |
| Runtime / Memory / Snapshot | Remain mounted for the entire Encounter lifetime |

---

## Forbidden

| Forbidden | Why |
|-----------|-----|
| Navigating Full Record to `/panel/pacientes/*` from the encounter | Destroys Runtime / Memory / Snapshot |
| History API / `?ficha` / `popstate` for Full Record | Triple ownership; corrupts Encounter Runtime vs App Router |
| Second MedicalCopilot / Memory / Snapshot trees for Daily Hub capabilities | Duplicated state |
| Ad-hoc section scroll bypassing Navigation SSOT | Offset / sticky regressions |
| Treating Continuity as a separate product | Breaks One Workspace |
| Local Clinical Snapshot builders per capability | Divergent context |

---

## Implementation anchors

| Path | Role |
|------|------|
| `components/copilot/HeyDoctorCopilotRuntimeProviders.tsx` | Single Runtime + Memory + Snapshot mount |
| `context/EncounterMemoryContext.tsx` | Encounter Memory SSOT |
| `context/EncounterClinicalSnapshotContext.tsx` | Clinical Snapshot SSOT |
| `hooks/useClinicalSnapshot.ts` | Shared Snapshot consumer |
| `lib/encounter/navigation/*` | Navigation SSOT |
| `hooks/useEncounterFullRecordNavigation.ts` | Full Record open/close (React-only; same model as Continuity) |
| `components/encounter/EncounterFullRecordOverlay.tsx` | Full Record in-shell surface |
| `components/clinical/continuity/ContinuityPanelShell.tsx` | Continuity / Encounter Timeline |
| `app/panel/consultas/[id]/page.tsx` | Encounter Shell host |

---

## Acceptance

A physician completes an entire consultation inside **one** Encounter Shell:

- One Workspace  
- One Runtime  
- One Memory  
- One Clinical Snapshot  
- One Navigation  
- One Clinical Operating System — **HeyDoctor Copilot**

---

## Merge gates (pre-baseline)

| Gate | Required |
|------|----------|
| CI | GREEN |
| Preview | Validation pass |
| Smoke | Encounter interaction pass |

**If all gates pass → FINAL GO FOR MERGE.**

Post-merge enterprise baseline:

| Field | Value |
|-------|-------|
| Encounter Shell | **OFFICIAL** |
| Architecture | **FROZEN** |
| Runtime | **STABLE** · SSOT |
| Production | **READY** |
| Next phase | **Clinical Intelligence** |

Aligned documentation:

- `ENCOUNTER-SHELL-SSOT.md` (this document)
- `HEYDOCTOR-COPILOT-CLINICAL-OPERATING-SYSTEM.md`
- Brand SSOT (`HEYDOCTOR-COPILOT-BRAND.md`)
- `LANDING-HERO-SSOT.md`
