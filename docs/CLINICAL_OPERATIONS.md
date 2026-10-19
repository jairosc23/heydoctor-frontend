# Clinical Operations Domain

**Kind:** Clinical Operations Projection  
**Not:** a write domain

COD does not own Encounter, Clinical Completion, or Commercial Settlement. It does not mint `EncounterId`, `ClinicalActId`, or `SettlementId`. It does not persist.

It projects, at one logical instant (`asOf`), the read state of:

- Encounter
- Clinical Completion
- Commercial Settlement

`CorrelationId` remains observability only.

Do not call Completion or Settlement workflows from this module. Do not mount this projection on frozen closure surfaces unless a later front is authorized.
