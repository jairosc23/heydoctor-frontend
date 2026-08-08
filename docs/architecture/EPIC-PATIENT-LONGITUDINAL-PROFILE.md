# EPIC — Patient Longitudinal Profile

| Field | Value |
|---|---|
| **Status** | RCA OPEN — awaiting Network evidence |
| **Priority** | Maximum |
| **Branch** | `epic/patient-longitudinal-profile` |
| **Frozen peers** | Medication Platform v1.0 / ADR-020 — **do not modify** |
| **Out of scope** | Medication Domain, CDS, FHIR, Medication Intelligence |

---

## Objective

Resolve antecedents persistence so Patient Profile → Encounter → Snapshot/Memory stay consistent, with professional save UX states.

---

## RCA gate (mandatory before any fix)

Confirm **exactly one** root cause with Network evidence:

| Code | Meaning |
|---|---|
| **A** | Backend does not persist |
| **B** | Encounter consumes another source / field |
| **C** | Encounter overwrites Profile after save |

### Required capture sequence (same patient)

```
PUT /patients/{id}/profile
  → Response body
  → GET /patients/{id}/profile
  → Clinical Snapshot inputs (what UI reads)
  → Encounter Antecedents section (chips / draft)
  → Clinical Memory surfaces (if any)
  → unexpected PUT /profile after Encounter open?
```

### Decision matrix

| Evidence | Verdict |
|---|---|
| PUT 200 but Response/GET missing saved fields | **A** |
| PUT+GET contain data; Encounter/Snapshot empty or other fields | **B** |
| PUT+GET OK, then Encounter emits PUT with empty arrays and data disappears | **C** |

### Environment blocker (agent)

As of RCA start: no `E2E_DOCTOR_*` / `.env.e2e` / Playwright storageState in this workspace.  
**No A/B/C verdict without authenticated Network capture.**

### Structural suspects (NOT verdict — pending evidence)

Documented only to guide the capture (do not treat as root cause):

1. **Field mismatch (B-candidate):** Patient Profile tab saves `allergies` / `medications` / `chronicConditions` / `notes`. Encounter Antecedents UI does not render `notes`; “personales” maps to `chronicConditions`.
2. **Snapshot/Memory alternate sources (B-candidate):** Shell Snapshot meds from Clinical Memory (prescriptions), not always `profile.medications`.
3. **Dirty draft flush (C-candidate):** `PatientLongitudinalSections.flush` can PUT `chronicConditions/medications/allergies/familyHistory` (incl. empty) and clears `surgeries`/`disabilities` to `[]` when dirty; dirty blocks re-hydration from profile props.

---

## Post-RCA plan (blocked until verdict)

1. Minimal fix for proven A/B/C only.  
2. Professional save states on Profile (+ align Encounter feedback):  
   `Cambios sin guardar → Guardando… → Información guardada → Información actualizada → Error al guardar`  
3. Validation · CI · PR · GO/NO-GO · **STOP**.

---

## Explicit non-goals

- No Medication Platform changes.  
- No CDS / FHIR / Medication Intelligence in this epic.  
- No implementation until Network evidence closes A/B/C.
