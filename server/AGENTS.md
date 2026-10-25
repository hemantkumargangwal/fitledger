# Backend instructions

Express + Mongoose API. Routes are mounted from `app.js`; controllers implement
request behavior; models own persistence constraints.

- Authenticate protected routes with `middleware/auth` and use `req.gymId` for
  every tenant-owned read, write, update, and delete.
- Keep route definitions thin. Put persistence and validation logic in the
  appropriate controller/service and use `asyncHandler` where the route style
  supports it.
- Preserve the public error envelope from `utils/errorHandler.js`. Prefer
  `AppError` for expected 4xx failures; do not expose stack traces or secrets.
- Add focused Node test coverage under `test/` for changed behavior. Do not
  connect tests to a real production database or external messaging/payment API.
- Verify with `npm --prefix server test`. Run the root check for changes that
  affect client/server contracts.
