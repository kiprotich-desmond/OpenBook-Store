# OpenBook Store — Agent Instructions

## Project Overview

OpenBook Store is an online storefront for ebooks and research materials, built around legitimately sourced content: public domain works, open-access research, and licensed/original titles.

Current stage: **prototype / demo**. There are two parallel, unconnected implementations of the same product:

- A working but demo-grade **Express backend** (`backend/`) with a JSON-file database.
- An actively developed **static HTML frontend** (`design-mockup/`) that uses browser `localStorage` for all state and is **not yet connected to the backend API**.
- A dormant **React scaffold** (`frontend/`) that is declared inactive.

Connecting `design-mockup/` to the backend endpoints is called out in the README as the next major step. The active frontend is not connected to the backend integrations. In the backend, OAuth routes are stubs (`501`), Stripe has an optional real PaymentIntent path when `STRIPE_SECRET_KEY` is configured, SMTP has an optional real transport when `SMTP_*` is configured, and PDF watermarking is implemented but not wired into book delivery.

## Repository Structure

- `backend/` — Express API (auth, books, orders, wishlist/favorites, contact, watermarking). Runs standalone on port 4000.
- `design-mockup/` — **the currently active frontend**. A static multi-page HTML site with shared JS/CSS and Tailwind via CDN. Open in a browser; no build step.
- `frontend/` — **inactive** React scaffold (CRA). Do not modify unless explicitly asked — see root `README.md` ("Which frontend is 'real' right now?").
- `.github/workflows/static.yml` — GitHub Pages workflow that deploys `design-mockup/` on push to `main`.
- `obs-root-files.zip` — tracked but 0-byte placeholder. Leave untouched.
- `README.md`, `CONTRIBUTING.md` — the source of truth for setup, workflow, and which frontend is active.

## Backend

- **Runtime:** Node.js, Express 4, CommonJS (`"type": "commonjs"`). No TypeScript, no test/lint tooling.
- **Entry point:** `backend/server.js`. Listens on `process.env.PORT || 4000`. Serves `backend/uploads/` statically at `/uploads` and configures allowed production and local-development CORS origins.
- **Route organization:** `server.js` mounts routers under `/api`:
  - `routes/auth.js` — real email/password signup, login, admin login (JWT + bcrypt). Google/Facebook OAuth are **stubs** returning `501` with an explanation.
  - `routes/books.js` — public `GET /` and `GET /:id`; admin-only create/update/delete with single-file cover upload via `multer` (8 MB limit); admin `GET /admin/category-counts`.
  - `routes/user-lists.js` — per-user wishlist & favorites (JWT required); public shareable wishlist view `GET /wishlist/shared/:userId`.
  - `routes/orders.js` — checkout, order confirm, `GET /mine`, admin `GET /admin/all`.
  - `routes/contact.js` — public message submit, admin `GET /admin/all`.
- **Authentication model:** JWT Bearer tokens issued by `routes/auth.js`; enforced by `middleware/auth.js` (`requireAuth`, `requireAdmin`). Admin role is a JWT claim (`role: 'admin'`), verified against `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` in `.env`. Admin token lifetime 8h, user token 30d.
- **Persistence:** `db.js` reads/writes one JSON file (`backend/data/db.json`). The file is created on first use; it does not exist until the seed is run. The current persistence layer is centralized through `db.js`, which provides a useful abstraction point for a future database migration. A production database migration may still require broader application changes. **This is local development persistence, not production persistence.**
- **Seed:** `data/seed.js` (`npm run seed`) writes the demo catalog, kept in sync with the hardcoded `books` array in `design-mockup/shared.js`.
- **Payments — Stripe (integration point only):**
  - With `STRIPE_SECRET_KEY` set, `POST /api/orders/checkout` creates a real Stripe PaymentIntent and returns `{ mode: 'stripe', clientSecret }`; the frontend would still need Stripe.js to confirm it (none exists in the repo).
  - Without the key (default), checkout runs in **simulation mode** — useful for end-to-end testing; `POST /api/orders/confirm` completes the demo order, writes it to `db.json`, marks books owned, and calls `sendMail`.
- **Uploads/storage:** cover image uploads only, saved to `backend/uploads/` (gitignored). No book-file (PDF/EPUB) upload exists anywhere yet.
- **Email:** `utils/email.js` via nodemailer. Uses `SMTP_HOST/PORT/USER/PASS` + `SMTP_FROM` from `.env`; if unset it prints the email to the console and returns `{ simulated: true }` instead of failing.
- **Watermarking:** `utils/watermark.js` is genuinely functional (`pdf-lib`) — stamps a light diagonal watermark (name · email · purchaseId) on every PDF page. It is **not yet wired into the checkout flow** because no real PDF book files exist. PDF only; EPUB watermarking is explicitly unsupported.
- **Environment:** there is **no `.env.example` file in the repo** despite README references to it. Create `backend/.env` manually with the keys above (`JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, optional `SMTP_*` / `STRIPE_SECRET_KEY` / `PORT`).

## Frontend

**Active frontend: `design-mockup/`** — static HTML + Tailwind (CDN) + vanilla JS. `frontend/` is inactive.

- Every page loads `tw-config.js` (Tailwind theme: colors `cream`/`ink`/`rust`/`sand`/`gold`/`good`; fonts Spectral/Sora/Poppins/IBM Plex Mono), `style.css` (design tokens, splash animation, mobile menu), Tailwind CDN, then `shared.js`.
- `shared.js` owns the shared UI: header nav (`renderHeader('<current-page>.html')`), footer (`renderFooter()`), slide-out cart panel, login gate modal, splash, and the hardcoded `books` catalog array; renders book cards via `bookCard(book)`.
- **State is entirely `localStorage`** (keys: `obs_cart`, `obs_owned`, `obs_wishlist`, `obs_favorites`, `obs_logged_in`, `obs_admin`, `obs_admin_books`, `obs_sales`). Nothing calls the backend API.
- Navigation is plain relative `<a href="page.html">` links; dynamic pages read query params (`book.html?id=N`, `category.html?cat=`, `search-results.html?q=`).
- Wishlist "share" link and QR are demo-only (`?u=demo-user`, hardcoded QR) — real server-backed sharing exists in the backend but is not wired here.
- Login (`fakeLogin()`) and admin login (`localStorage.setItem('obs_admin','1')`) are UI simulations; the backend's real auth endpoints are unused.
- Checkout: `checkout.html` → `simulatePurchase()` writes `obs_owned` + `obs_sales`, clears cart, redirects to `receipt.html`. No Stripe.
- Admin pages: `admin-login.html`, `admin.html` (upload book → `obs_admin_books`), `admin-sales.html` (`obs_sales`), `admin-catalog.html` (category counts from the `books` array). All demo-only.

**Approach for agents:** for any storefront/UI change, edit `design-mockup/`. When touching shared behavior, remember pages rely on `shared.js` globals and inline per-page scripts. Keep book IDs and seed data consistent between `design-mockup/shared.js` and `backend/data/seed.js`.

## Development Commands

Verified from the repository (backend `package.json`, frontend `package.json`, READMEs). There are **no lint or test commands** anywhere in the repo.

Backend:

```bash
cd backend
npm install
npm run seed      # writes backend/data/db.json (8 demo books)
npm run dev       # node server.js on :4000
npm start         # same as npm run dev
node --check server.js   # syntax-only sanity check for backend files
```

Active frontend (`design-mockup/`): no install/build needed — open `design-mockup/index.html` directly in a browser, or serve the folder with any static file server.

Inactive React scaffold (`frontend/`): `cd frontend && npm install && npm start` (port 3000) or `npm run build`. Do not use unless working on `frontend/` is explicitly requested.

## Git Workflow

Per `CONTRIBUTING.md`:

- Branch naming: `feature/short-description` for features; `fix/short-description` for fixes is the de facto convention already in use.
- Always pull latest `main` first; create a feature/fix branch; commit with clear messages; push with `-u`; open a **PR into `main`**.
- **Never push directly to `main`.**
- Get a review from at least one other person before merging.
- Pre-PR checks from CONTRIBUTING: if you touched `backend/`, `npm run dev` must start; if you touched `design-mockup/`, open the changed page(s) and click through the changed flow; any new page must be linked from nav, footer, or another page (no orphaned pages).
- Bugs and feature requests go to **GitHub Issues** (include reproduction steps). AGENTS.md is not a bug tracker.

## Scope Discipline

- One task = one logical change. Keep diffs small and focused.
- Do not refactor unrelated code, and do not fix unrelated bugs automatically — report newly discovered issues separately (GitHub Issue).
- Preserve existing behavior unless the task explicitly changes it. Do not reformat or "improve" untouched code.
- Inspect `git diff` before finishing; make sure you stage/intend exactly the files for this task.
- Never include unrelated or pre-existing untracked files in a change.

## Backend Safety Rules

- Business rules must not be enforced only on the frontend. The backend must re-validate everything: required fields, input types, book IDs, ownership.
- Auth, payment, and storage changes require extra care — JWT/`bcrypt` handling in `middleware/auth.js` and `routes/auth.js`, Stripe logic in `routes/orders.js`, and file uploads in `routes/books.js` are security-sensitive. Preserve the existing `requireAuth`/`requireAdmin` guards on protected routes.
- Never expose or log secrets. Never commit `.env` files (already gitignored). Do not hardcode `JWT_SECRET`, admin credentials, or Stripe keys.
- Do not treat the local JSON database (`backend/data/db.json`) as production persistence. Changes to `db.js`'s storage contract affect every route.
- Validate API inputs on the server (types, ranges, presence) — do not trust `req.body`/`req.params`.
- Keep the real, optional, and stubbed behavior distinct: OAuth endpoints return `501`; Stripe and SMTP use real integrations only when configured and otherwise use demo behavior; watermarking is implemented but not wired into book delivery. Do not silently replace these states without a task that asks for it.

## Frontend Safety Rules

- The **active frontend is `design-mockup/`**. Preserve its existing visual identity (colors, fonts, splash, cart panel, layout) unless a redesign is explicitly requested.
- Test changes at mobile and desktop widths when touching responsive UI — the site uses Tailwind breakpoints (`sm`/`md`/`lg`) and a `mobile-menu` toggled in `shared.js`/`style.css`.
- Avoid touching the inactive `frontend/` React scaffold unless explicitly asked.
- Remember the frontend is static and localStorage-backed; do not claim backend connectivity that does not exist, and do not write "real" auth/payment behavior into the mockup in place of wiring the backend.

## Generated / Local Files

Already ignored by `.gitignore`: `node_modules/`, `.env`/`.env.local`/`**/.env`, build outputs (`build/`, `dist/`, `.next/`, `out/`), `backend/data/db.json`, `backend/uploads/`, logs, `.vscode/`, `.idea/`, Python caches.

Notes for agents:

- `obs-root-files.zip` is tracked but is an empty placeholder — do not touch.
- Pre-existing untracked files must not be automatically staged or committed.

## Deployment

- **GitHub Pages** for the active frontend: `.github/workflows/static.yml` uploads `design-mockup/` and deploys on pushes to `main`.
- Backend has **no deployment configuration** in the repo. It currently runs locally for development/demo.
- Do not remove or modify the GitHub Pages workflow as part of unrelated tasks.

## Known Architectural Notes

- The backend and the active frontend implement the same features (cart, wishlist, favorites, checkout, admin) **twice**: server-side with real auth and JSON persistence vs. a localStorage demo in `design-mockup/`. Wiring the mockup to the API is the intended next step; be careful not to entrench the two diverging.
- The repo's `README.md`/`backend/README.md` reference a `.env.example` file that is not present; copy the documented keys into `backend/.env` yourself.
- Book catalog data is duplicated: `backend/data/seed.js` and the `books` array in `design-mockup/shared.js`. Keep them in sync when adding/editing demo titles.
- Watermarking is implemented but unconnected (no PDF book uploads exist); EPUB watermarking is out of scope. OAuth is stubbed, while Stripe and SMTP have optional real backend paths when configured. None of these integrations is wired to the active frontend.
