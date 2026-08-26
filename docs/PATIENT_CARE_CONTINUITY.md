# Patient Care Continuity — Epic 1

**Kind:** Continuity Package (ephemeral projection)  
**Not:** a write domain, a source of truth, or the RC-19A Continuity panel

The package is derived from one `ClinicalOperationsView`. It is keyed by `EncounterId` and may represent only the current `ClinicalActId` of that Encounter.

Settlement is operational context. Clinical handoff does not require payment.

Do not persist a `ContinuityPackage`. Do not mint identities. Do not mount UI in this epic.
