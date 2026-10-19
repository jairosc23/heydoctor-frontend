# Medical Copilot RC6 — Release Guide

## Freeze policy

RC6 = **Release Candidate Freeze**.

1. Certificar inventario + arquitectura + seguridad (lectura) + docs
2. Gates verdes en BE + FE + Playwright crítico
3. Commit + push **solo** a `release/medical-copilot-v1.0-rc2`
4. **No** merge a `main`
5. **No** deploy

## Promotion path (post-RC6)

```
RC6 freeze → QA clínica → checklist de promoción firmada → merge/deploy (proceso aparte)
```

## Tags existentes

- `medical-copilot-v1.0-rc2`
- `medical-copilot-v1.0-ga-fix`

RC6 no exige nuevo tag; la certificación vive en docs + checklist + commit en la branch de release.

## Compatibility

Backward compatibility preservada: RC6 no altera contratos governed ni baseline RC5 salvo regeneración documental.
