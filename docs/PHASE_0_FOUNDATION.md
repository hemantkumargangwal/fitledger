# Phase 0 — Foundation Handoff

**Status:** Complete  
**Completed scope:** Shared technical foundation only. No product feature module was advanced.

## Delivered

- Testable Express application factory separated from database connection/server startup.
- Backward-compatible `/api/*` routes plus versioned `/api/v1/*` aliases.
- Standard error contract with stable codes, field errors, and request correlation IDs.
- Request ID propagation, structured request logs, CORS allowlist, reduced body limit, and baseline security headers.
- Owner-only authorization middleware applied to protected V1 routes.
- Tenant-scope helpers that prevent request data from overriding authenticated `gymId`.
- Generic validation middleware and whitelisted pagination sorting.
- Frontend API error normalization and idempotency-key helper.
- Reusable accessible `Button`, `Card`, `FormField`, `PageState`, and `StatusBadge` UI primitives.
- Design tokens, reduced-motion behavior, and global visible-focus treatment.
- Route-level code splitting, reducing the initial JavaScript bundle from roughly 797 KB to roughly 213 KB before gzip.
- Node test harness, foundation tests, clean frontend lint, root verification command, and GitHub Actions workflow.

## Compatibility notes

- Existing controller response bodies remain supported. New errors include both the planned `error` object and legacy top-level `message` during migration.
- Existing `/api` clients continue working. New modules should use `/api/v1`.
- Existing feature controllers are not yet moved into the target feature folders; each module will move only when its vertical slice is implemented.
- Full Helmet policies, distributed rate limiting, file storage, and database-backed idempotency belong to their relevant feature/release phases.

## Verification

Run from the repository root:

```bash
npm run check
```

This runs 13 backend foundation tests, frontend ESLint, and the production Vite build.

## Next module

Phase 1 is Authentication: finish the owner-only auth contract, change-password endpoint/UI, reset challenge hardening, validation, rate limiting, error migration, and complete auth test coverage.
