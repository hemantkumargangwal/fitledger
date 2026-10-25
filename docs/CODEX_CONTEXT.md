# Codex project context and task tracker

## Project snapshot

- **Product:** FitSaarthi, a MERN gym-management SaaS.
- **Client:** React 18, Vite, Tailwind CSS, Axios, ESLint.
- **API:** Express 4, Mongoose 7, JWT authentication, MongoDB.
- **Tenancy:** Gym data is isolated by `gymId`; authenticated API work must use
  `req.gymId` rather than a client-supplied tenant identifier.
- **Package manager:** npm. Dependencies are managed separately at repository
  root, `client/`, and `server/`.

## Commands

| Purpose | Command |
| --- | --- |
| Run client + API locally | `npm run dev` |
| Run API tests | `npm run test` |
| Run client lint | `npm run lint` |
| Run all configured checks | `npm run check` |
| Build client only | `npm --prefix client run build` |

`npm run check` runs backend tests, frontend lint, and the production client
build. There is no TypeScript configuration or server lint/type-check script in
the current repository; do not report either as passing until the project adds
one.

## Environment and data safety

- Local secrets live in `server/.env` and `client/.env`, both ignored by Git.
- Document new variables only in the applicable `.env.example`; never add real
  values to tracked files.
- The API requires `MONGODB_URI` and `JWT_SECRET`. Treat non-local MongoDB URLs
  as production-like unless the user identifies a safe test database.
- Do not use seed/reset/drop commands without explicit approval and a named
  database target.

## Task tracker

Use this as the lightweight persistent status record. Add a row only for work
that spans turns/sessions or has a meaningful follow-up. Keep completed entries
until the next release/cleanup decision; do not turn routine one-file fixes into
project-management overhead.

| Status | Task | Owner | Scope / next action | Verification |
| --- | --- | --- | --- | --- |
| Ready | Codex development baseline | Maintainers | Revisit instructions when tooling, scripts, or architecture changes. | Config audit on 2026-10-24 |

Allowed statuses: `Planned`, `In progress`, `Blocked`, `Review`, `Done`, and
`Ready`. A task is `Done` only after its intended verification is recorded.

## Session handoff template

For a substantial unfinished task, append a short row or note with:

1. goal and explicitly excluded scope;
2. files or boundaries already inspected;
3. decisions and open risks;
4. exact next step; and
5. verification completed and still required.

Do not log secrets, raw tokens, personal data, verbose command output, or every
minor exploration step.
