# HCX Component Taxonomy v1.0  
## Official Component Hierarchy & Ownership

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 1 — Foundations |
| **Document** | HCX Component Taxonomy |
| **Version** | 1.0 |
| **Status** | Official hierarchy — **no implementation** |
| **Path** | `docs/design/hcx/HCX-COMPONENT-TAXONOMY-v1.0.md` |

**Laws:** Philosophy & ownership only · no React components · no code · no commits.

---

## 1. Purpose

Define the **official component hierarchy** so future UI work places every piece in the correct layer — preventing parallel mini-systems and “one-off” clinical widgets that break HCX.

---

## 2. Hierarchy (canonical)

```
Primitive
    ↓
Foundation
    ↓
Composite
    ↓
Clinical
    ↓
Workspace
    ↓
Experience
```

Higher layers **compose** lower layers.  
Lower layers **must not** import clinical/COS semantics.  
Experience layers **must not** redefine Primitive/Foundation tokens.

---

## 3. Layer definitions

### 3.1 Primitive

**Owns:** Smallest visual/interactive atoms with no product meaning.

| Examples (conceptual) | Non-examples |
|-----------------------|--------------|
| Text, Icon slot, Box/Spacer, Raw pressable, Divider, Spinner atom | Button with clinical label semantics, PatientRow |

**Responsibilities**

- Token consumption only (color, space, radius, motion)  
- Accessibility basics (focusable primitives)  
- No domain knowledge (no patient, Rx, HAB)  

**Ownership:** Design System / HCX Foundations team.

---

### 3.2 Foundation

**Owns:** Reusable UI patterns shared across all products.

| Examples | Non-examples |
|----------|--------------|
| Button, Input, Select, Checkbox, Textarea, Badge, Banner, Modal shell, Tabs, Tooltip, Table shell | HAB Confirmation Mount, Copilot Assist Panel |

**Responsibilities**

- Density modes  
- Validation display patterns (generic)  
- Loading / empty / error shells (generic)  
- AA contrast for standard states  

**Ownership:** HCX Foundation.

**Rule:** Foundation banners are generic severity — Clinical layer specializes copy and placement rules.

---

### 3.3 Composite

**Owns:** Assemblies of Foundation pieces into recurring product patterns **without** clinical authority.

| Examples | Non-examples |
|----------|--------------|
| Search field + results list, Date range control, Pagination + table, Nav item group, Form section | Medication review confirm, Encounter zone layout |

**Responsibilities**

- Layout recipes  
- Keyboard patterns for multi-control widgets  
- Progressive disclosure shells  

**Ownership:** HCX + product design; still domain-agnostic.

---

### 3.4 Clinical

**Owns:** Domain-aware presentation that **visualizes** clinical concepts without owning engines.

| Examples | Non-examples |
|----------|--------------|
| Allergy alert banner, Vitals strip, Problem list row, Rx line item display, Consent text block, Identity header | PE emit engine, HAB decision service, Context bind engine |

**Responsibilities**

- Clinical readability (tabular doses, ID clarity)  
- Safety visual rules (warning/critical)  
- Clear labeling of provisional vs durable display  

**Ownership:** Clinical UX under HCX; **must not** redefine COS semantics.

**Hard rule:** Clinical components display; they do not authorize, emit, or bind context.

---

### 3.5 Workspace

**Owns:** Encounter / host layout structures that host mounts and zones.

| Examples | Non-examples |
|----------|--------------|
| Workspace chrome, Zone columns, Orientation rail, Assist dock region, Confirmation mount **host slot**, Context status banner region | Copilot model logic, Journey graph engine |

**Responsibilities**

- Zone hierarchy (Orient · Work · Assist · Confirm)  
- Responsive recomposition  
- Ensuring HAB UI region ≠ Assist region  

**Ownership:** HCX Workspace patterns (maps visually to E01 host concepts without modifying E01 EDP).

---

### 3.6 Experience

**Owns:** End-to-end product experiences for roles and modalities.

| Examples | Non-examples |
|----------|--------------|
| Physician encounter experience, Patient portal home, Staff queue experience, Tele lobby + in-call experience, Agenda day experience, Admin ops experience | Backend modules, EDPs |

**Responsibilities**

- Journey of screens/flows using Workspace + Clinical + lower layers  
- Role-appropriate density and tone  
- Ensuring Dispose ≠ Confirm visually across the flow  

**Ownership:** Product experience design under HCX governance.

---

## 4. Ownership matrix

| Layer | May use tokens | May know clinical terms | May look like HAB | May emit / authorize |
|-------|----------------|-------------------------|-------------------|----------------------|
| Primitive | Yes | No | No | No |
| Foundation | Yes | No | No | No |
| Composite | Yes | No | No | No |
| Clinical | Yes | Display only | Warn/display only | No |
| Workspace | Yes | Layout for clinical | Hosts HAB **slot** | No |
| Experience | Yes | Yes (flows) | Includes HAB UI | No (engines elsewhere) |

---

## 5. Catalog by layer (normative list)

### Primitive
Text · Icon · Box · Flex/Stack · Spacer · Divider · Pressable · Spinner · Skeleton bone · Portal/overlay root (abstract)

### Foundation
Button · IconButton · Link · Input · Textarea · Select · Checkbox · Radio · Switch · Badge · Tag · Banner · Toast · Modal · Sheet · Drawer · Tabs · Tooltip · Popover · Menu · Table · Pagination · Avatar · Progress

### Composite
SearchComposite · FilterBar · FormSection · DataTable · CommandPalette · NavList · EmptyState · ErrorState · LoadingState · SteppedForm shell

### Clinical
PatientIdentityHeader · AllergyAlert · CriticalAlert · WarningBanner · VitalsStrip · ProblemListItem · MedicationLine · OrderLine · ConsentBlock · TimelineEvent · TimelineDayGroup · CdsInsightCard (advisory) · ProtocolHint (advisory)

### Workspace
WorkspaceChrome · ZoneOrientation · ZoneClinicalWork · ZoneAssistDock · ZoneConfirmationHost · ContextStatusBanner · EncounterTitleBar · MountSlot

### Experience
PhysicianEncounterExperience · PatientPortalExperience · StaffQueueExperience · TelemedicineExperience · SchedulingExperience · DashboardExperience · AdminEnterpriseExperience · AiAssistExperience (compose only)

---

## 6. Special clinical safety components (Clinical + Workspace)

| Component (conceptual) | Layer | Notes |
|------------------------|-------|-------|
| `HabConfirmationMount` | Clinical UI in Workspace host | Confirm/Reject/Modify/Abort visuals; clarity ≫ aesthetics |
| `PrescriptionConfirmationPanel` | Clinical | Opaque; tabular; distinct from draft save |
| `MedicationReviewDiff` | Clinical | Highlight changes |
| `IdentityVerificationBlock` | Clinical | Mismatch = critical pattern |
| `CopilotDisposeControls` | Clinical/Experience assist | Must not reuse HAB button styles |

---

## 7. Dependency rules

1. **Downward only:** Experience → Workspace → Clinical → Composite → Foundation → Primitive.  
2. **No sideways forks:** Do not create `ClinicalButton` that bypasses Foundation Button tokens.  
3. **No parallel taxonomies:** “Design system v2” folders forbidden; extend HCX layers.  
4. **COS engines** are not components; UI consumes APIs/services owned elsewhere.

---

## 8. Naming conventions (future code — spec only)

| Layer | Prefix / pattern |
|-------|------------------|
| Primitive | `Hcx` + atom (`HcxText`) |
| Foundation | `Hcx` + control (`HcxButton`) |
| Composite | `Hcx` + pattern (`HcxSearchComposite`) |
| Clinical | `HcxClinical` + name |
| Workspace | `HcxWorkspace` + name |
| Experience | `HcxExperience` + name |

Naming is reserved for future implementation programs — **not authored here as code**.

---

## 9. Contribution rules

| Change type | Required |
|-------------|----------|
| New Primitive/Foundation | HCX Foundations review |
| New Clinical pattern | HCX + clinical safety visual checklist |
| New Workspace zone | Must preserve Orient/Work/Assist/Confirm |
| New Experience | Must reuse Workspace; no private chrome system |

---

## 10. Anti-patterns

- Building encounter UI from raw HTML outside taxonomy  
- Putting HAB controls inside Copilot dispose panel  
- Glass Foundation cards wrapping clinical prose  
- Experience-level one-offs that duplicate Foundation Buttons with new colors  
- “Staff HAB” components  

---

## Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| COS / EDP impact | **None** |

**End of HCX Component Taxonomy v1.0.**
