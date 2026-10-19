# Multi-Repo CI Architecture

This repository owns the HeyDoctor frontend deployable unit. It is validated
and deployed independently from the backend repository.

## Frontend Workflow Ownership

`.github/workflows/ci.yml` in this repository owns only frontend validation:

- dependency install with `npm ci`
- lint
- typecheck
- Next.js build
- frontend smoke tests

The stable branch-protection check for this repository is `frontend`.

## Backend Boundary

Backend validation belongs to `SAVAC-HeyDoctor/heydoctor-backend-pro`. The
frontend CI must not start PostgreSQL, run backend migrations, or assume a
backend monorepo checkout.

## Deployment Boundary

Vercel deploys this repository. Railway deploys the backend repository. Keeping
the workflows separate preserves deterministic local development and avoids CI
failures caused by repository layout assumptions.
