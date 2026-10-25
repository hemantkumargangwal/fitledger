# FitSaarthi repository instructions

## Scope and context

FitSaarthi is a multi-tenant gym-management SaaS. The React/Vite client is in
`client/`; the Express/Mongoose API is in `server/`. Read
`docs/CODEX_CONTEXT.md` before non-trivial work. It records the active task
format, durable architectural decisions, and the required verification command.

Use the closest applicable `AGENTS.md`; nested instructions add to this file.
Keep instructions and task records brief: load only files relevant to the work.

## Working agreement

- Inspect `git status --short` before editing. Existing changes are user work;
  preserve them and do not reset, checkout, clean, or reformat unrelated files.
- Do not install dependencies, alter package manifests, modify lockfiles, or
  change application behavior unless the user explicitly asks.
- Use `rg` for discovery. Read the route/controller/model or page/service at
  the boundary being changed before implementation.
- Make the smallest coherent change. Avoid speculative abstractions and broad
  rewrites. Reuse existing UI components and API/error conventions.
- Never read, print, commit, or copy values from `.env` files. Use only
  `.env.example` for environment-variable documentation.
- Do not run destructive database commands or migrations against any database
  without explicit user approval and an exact target.
- Do not create commits, push, open pull requests, or change branches unless
  expressly requested.

## Multi-tenancy and security

- Server data access must be scoped with authenticated `req.gymId`; never trust
  a client-provided gym or tenant identifier for authorization.
- Keep JWTs, passwords, SMTP credentials, payment-provider secrets, and MongoDB
  connection strings out of source, logs, errors, fixtures, and documentation.
- Validate external input at the API boundary and keep error responses aligned
  with `server/utils/errorHandler.js`.

## Verification and reporting

- For code changes, run the narrowest relevant check first, then `npm run check`
  from the repository root when feasible. Report commands actually run and any
  checks not run.
- For documentation/config-only changes, run `git diff --check` and validate
  referenced commands with `npm run` where appropriate.
- Final reports must state outcome, files changed, verification, and unresolved
  risks in concise bullets. Do not claim a test or deployment you did not run.
