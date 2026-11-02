# Approved landing: selective production promotion

## Verified production base

Railway frontend service b3984472-a0fa-4ce7-8747-99482ad3d7e2, project c4a53a53-7820-452d-8870-ccee0575c204, production environment 70c5b482-ca99-4a1d-bb0e-1e81f74ad277.

Running deployment: 93922061-75e0-441f-b774-569578e7dce0. Certified image digest: sha256:942291578523b9156e687641f843a359cd6e8589b9dbdbc82868a0ea404a9878. Read-only container inspection confirmed NEXT_PUBLIC_HEYDOCTOR_API_URL=https://pro-api.heydoctor.health.

A read-only Git-blob SHA-1 manifest of 5,291 source/assets/config files under /app was compared with 523099fb40157c958b05b7e8c5b795a6a90b9b90: 5,290 match exactly. The additional .railwayignore contains only `docs` followed by a newline and is preserved here. Documentation is excluded from the deployed source by this rule. Environment files, dependencies, .next and Git metadata were excluded; credentials were not exported. Manifest SHA-256: 248211069dc5b0d9e35ad2bb15ee43eaf7c07c33bc2b1c50312641936679a0d3.

This verifies application-source equivalence, not a recorded Railway Git commit or reproducible image digest.

## Exact selective changes

Copied verbatim from deployed staging e33c81f3aad1aaf53396aed1bd6761311559145c:

- components/landing/LandingHero.tsx: approved responsive grid and image maximum width.
- lib/landing-assets.constants.ts: approved basename and 1672 x 941 intrinsic ratio.
- public/brand/hero-doctor-approved.png: original graphic, unmodified.

Live staging HTML uses this approved PNG. Its downloaded bytes equal the candidate: SHA-256 1dc5414dca695c4fd2e72159e239cfbb9f5938f4ca9457a630e10a80169e6bc6, Git blob ef93de69fdbaeaeec21c51a2e5a6507a5fb91c8c. Existing object-contain and composite rendering remain intact. No crop, regeneration or substitution with hero-doctor.jpg.

Other staging authentication, booking, registration, clinical-document, middleware and Next configuration changes are excluded. Existing production routes, shared styles, dependencies and lockfile are unchanged. .railwayignore preserves production packaging; this document provides release evidence.

## Validation gate

Source and asset identity PASS. git diff --check PASS. Local npm ci failed with ENOSPC: no local TypeScript, build or HTTP route certification claimed. Existing PR CI must validate TypeScript/build. No E2E workflow dispatch or production deployment is authorized here.

Before promotion, validate the candidate landing at desktop/mobile widths and primary routes in an authorized local/isolated preview. Build with the existing production public API origin; do not import staging variables.

## Rollback

Keep deployment 93922061-75e0-441f-b774-569578e7dce0 and its original environment. Railway reported SUCCESS and canRollback=true during preparation. Before any separately authorized promotion, recheck rollback availability and that production has not advanced. On failure, use Railway's rollback action for this exact deployment/image, not a generic latest-source redeploy. Verify /api/health, landing and login without changing backend or variables.

The alternative source baseline is 523099fb40157c958b05b7e8c5b795a6a90b9b90 with the recovered docs exclusion; rebuilding is not equivalent to restoring the original image and requires separate authorization.

No merge or deployment performed. Promotion remains blocked until validation and final approval of the exact candidate SHA.
