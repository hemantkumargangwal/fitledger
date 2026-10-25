# Frontend instructions

React 18 + Vite + Tailwind CSS frontend. Source lives under `src/`.

- Use function components and hooks. Keep page orchestration in `src/pages/`,
  reusable UI in `src/components/`, and network calls in `src/services/`.
- Use the shared Axios client in `src/services/api.js`; do not create unscoped
  direct HTTP clients. Preserve auth and tenant headers.
- Reuse `Toast`, `ModalForm`, `DataTable`, `Spinner`, and shared utilities
  before adding a one-off replacement. Model loading, empty, and error states.
- Keep Tailwind classes accessible and responsive. Preserve visible focus states,
  labels, semantic buttons, and non-color-only status indicators.
- Do not add TypeScript or UI libraries as incidental cleanup; this project is
  currently JavaScript-based.
- Verify frontend work with `npm --prefix client run lint` and
  `npm --prefix client run build`.
