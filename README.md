<h1 align="center">OpenBook Store</h1>

<h3 align="center">
  Digital bookstore built with Node.js, Express, Tailwind CSS and Vanilla JavaScript
</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-222222?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="MIT License" />
  <img src="https://img.shields.io/badge/Status-Active%20Migration-FFA500?style=for-the-badge" alt="Active Migration" />
</p>

> A digital bookstore for legitimately sourced ebooks and research materials — bringing public-domain works, open-access research, and licensed or original titles into one reading experience.

<p align="center">
  <a href="#main-features">Features</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#how-to-run-the-project">Get Started</a> ·
  <a href="#production-migration">Roadmap</a> ·
  <a href="CONTRIBUTING.md">Contribute</a>
</p>

---

## Project Overview

OpenBook Store is designed to help readers discover titles, save favourites, purchase ebooks, and build a personal library, with catalog and sales tools for administrators.

The project is undergoing an architectural migration from a demo-oriented prototype toward a connected ebook commerce platform. Today, the active static storefront and the Express API run independently: the storefront uses browser `localStorage`, while the backend provides authentication, catalog management, and order persistence.

## Main Features

### Backend functionality

- [x] Email/password signup and login with bcrypt password hashing and JWT authentication.
- [x] Protected routes, admin authorization, and rate limiting for signup, login, and admin login.
- [x] Public catalog API and admin catalog create, update, and delete operations.
- [x] Catalog validation for prices, tiers, page counts, and years.
- [x] Single cover uploads with extension/MIME checks and an 8 MB size limit.
- [x] Optional Stripe PaymentIntent creation and server-side verification before recording an order.
- [x] Order history, ownership recording, and admin sales summaries.
- [x] Per-user wishlist and favourites APIs, including a public shared-wishlist endpoint.
- [x] SMTP email integration through Nodemailer, with console output when SMTP is unconfigured.
- [x] PDF watermark utility using buyer details — implemented, but not connected to delivery.

### Storefront demo capabilities

- [x] Catalog browsing, search, categories, offers, and book detail pages.
- [x] Local cart, wishlist, favourites, and personal-library views.
- [x] Simulated sign-in, checkout, receipts, and order history.
- [x] Demo admin catalog and sales screens backed by browser state.

These storefront flows are UI demonstrations; they do not call the backend or process payments. Planned integration work is listed under [Production Migration](#production-migration).

## Technology Stack

### Backend

<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&amp;logo=nodedotjs&amp;logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express_4-000000?style=for-the-badge&amp;logo=express&amp;logoColor=white" alt="Express 4" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&amp;logo=javascript&amp;logoColor=black" alt="JavaScript" />
</p>

CommonJS modules and Express routers under `/api`, with Multer for cover uploads and `pdf-lib` for PDF watermarking.

### Frontend

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&amp;logo=html5&amp;logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&amp;logo=javascript&amp;logoColor=black" alt="Vanilla JavaScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&amp;logo=tailwindcss&amp;logoColor=white" alt="Tailwind CSS" />
</p>

**`design-mockup/` is the active frontend:** static HTML, shared CSS, Tailwind via CDN, and vanilla JavaScript. It needs no build step. `frontend/` contains an **inactive React scaffold**.

### Security and Integrations

<p>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&amp;logo=jsonwebtokens&amp;logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/bcryptjs-4A5568?style=for-the-badge" alt="bcryptjs" />
  <img src="https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&amp;logo=stripe&amp;logoColor=white" alt="Stripe" />
  <img src="https://img.shields.io/badge/Nodemailer-0F766E?style=for-the-badge" alt="Nodemailer" />
</p>

JWT and bcrypt support backend authentication. Stripe and SMTP have optional real backend integrations; Google and Facebook OAuth routes remain `501` stubs.

### Current Infrastructure / Persistence

<p>
  <img src="https://img.shields.io/badge/JSON-Filesystem-4A5568?style=for-the-badge&amp;logo=json&amp;logoColor=white" alt="JSON filesystem persistence" />
  <img src="https://img.shields.io/badge/Browser-localStorage-B45309?style=for-the-badge" alt="Browser localStorage" />
  <img src="https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&amp;logo=github&amp;logoColor=white" alt="GitHub Pages" />
</p>

- **Backend data:** a local JSON file at `backend/data/db.json`; cover images live in `backend/uploads/`.
- **Storefront state:** browser `localStorage`, separate from backend data.
- **Static deployment:** a GitHub Actions workflow deploys `design-mockup/` to GitHub Pages on pushes to `main`.
- **Backend hosting:** no deployment configuration is included.

**PostgreSQL is the planned production database; it is not implemented.** JSON/filesystem persistence currently serves local development and demos.

## Architecture

```text
Browser
   |
   v
Static Storefront (design-mockup/)
HTML + Tailwind CSS + Vanilla JavaScript
   |
   +----> Browser localStorage (current state)
   |
   :  Planned API connection — not wired yet
   v
Express API (backend/, port 4000)
   |
   +----> JSON persistence + cover uploads
   +----> Stripe (optional PaymentIntents)
   +----> SMTP (optional email delivery)

PDF watermark utility — not yet wired into ebook delivery
```

The frontend's catalog is defined in `design-mockup/shared.js`; the backend's demo catalog comes from `backend/data/seed.js`. They are maintained separately until API integration replaces the browser-side copy.

### Migration Target

```text
Browser
   |
   v
Storefront
   |
   v
Express Modular Monolith
   |
   +----> PostgreSQL
   +----> Stripe Checkout + Webhooks
   +----> Private Object Storage
   +----> Transactional Email
```

## Repository Structure

```text
OpenBook-Store/
├── backend/
│   ├── server.js         Express entry point
│   ├── db.js             JSON persistence layer
│   ├── routes/           Auth, catalog, orders, user lists, contact
│   ├── middleware/       JWT and admin authorization
│   ├── utils/            Email and PDF watermarking
│   └── data/seed.js      Demo catalog seed
├── design-mockup/        Active static storefront
│   ├── index.html        Storefront entry page
│   ├── shared.js         Catalog, shared UI, and browser state
│   └── style.css         Shared styling
├── frontend/             Inactive React scaffold
├── .github/workflows/    Static GitHub Pages deployment
├── CONTRIBUTING.md       Contribution workflow
├── AGENTS.md             Repository-specific coding-agent guidelines
├── LICENSE               MIT software license
└── README.md
```

## How to Run the Project

### 1. Start the storefront

Open `design-mockup/index.html` in a browser, or serve `design-mockup/` with a static file server. No dependency installation or build is required. Internet access is needed for CDN-hosted styling and remote assets.

The storefront demo works independently of the backend. Starting the API does not connect the two automatically.

### 2. Install backend dependencies

With Node.js and npm installed, run from the repository root:

```bash
cd backend
npm ci
```

### 3. Configure the backend environment

Create `backend/.env` manually — this repository does not include an `.env.example` file.

```dotenv
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_USERNAME=choose-a-local-admin-username
ADMIN_PASSWORD_HASH=replace-with-a-bcrypt-hash
PORT=4000
```

Generate a random JWT secret from the `backend/` directory:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Generate the admin password hash locally with `bcryptjs`, replacing the example password before running:

```bash
node -e "console.log(require('bcryptjs').hashSync('replace-with-your-local-admin-password', 10))"
```

Paste the outputs into the corresponding `.env` fields. Keep `.env` local; it is gitignored.

| Optional variables | Behavior |
| --- | --- |
| `STRIPE_SECRET_KEY` | Enables real backend PaymentIntent creation and verification. Leave unset for simulated checkout. **Simulation mode is for development/demo use only and must not be used for production commerce.** |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Configure email delivery. Port defaults to `587`; without `SMTP_HOST`, emails are logged to the console. |

Stripe configuration alone does not enable storefront payments: Stripe.js confirmation and API integration still need to be implemented.

### 4. Seed and start the API

From `backend/`:

```bash
npm run seed
npm run dev
```

The seed writes eight demo books and **resets the local JSON database**, including users and orders. Use it for initial setup or an intentional demo reset.

The API runs at `http://localhost:4000` by default. Check it from another terminal:

```bash
curl http://localhost:4000/api/health
curl http://localhost:4000/api/books
```

The health endpoint returns `{"status":"ok"}`. `npm start` runs the same server as `npm run dev`.

## Project Status

**Current stage: functional prototype undergoing architectural migration.**

| Area | Current state |
| --- | --- |
| Active storefront | Static, browser-local demo; not connected to the API. |
| Backend | Functional API with JWT auth and local JSON persistence. |
| Payments | Optional Stripe PaymentIntent creation and verification; simulation without a key. No Stripe.js checkout or webhook fulfillment. |
| Email | Real SMTP when configured; console fallback otherwise. |
| Ebook delivery | Cover uploads only. No PDF/EPUB upload or secure book delivery; PDF watermark utility is standalone. |
| Social login | Google/Facebook endpoints return `501`; OAuth is unimplemented. |
| Deployment | GitHub Pages workflow for the static frontend; no backend deployment configuration is currently committed to the repository. |

## Production Migration

The next phase connects the existing storefront and API, then replaces demo infrastructure with production services:

- [ ] Connect the active storefront to backend authentication, catalog, lists, and order APIs.
- [ ] Migrate JSON persistence to PostgreSQL with an appropriate schema and migrations.
- [ ] Introduce revocable production sessions.
- [ ] Implement secure ebook upload, storage, and ownership-checked delivery.
- [ ] Integrate Stripe-hosted Checkout and signed webhook fulfillment.
- [ ] Provide a real server-backed user library and connect PDF watermarking to delivery.

These are migration goals, not current capabilities. The persistence layer in `backend/db.js` is a starting point; production migration may also require changes to routes and business logic.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow. Start from the latest `main`, work on a feature or fix branch, and open a pull request into `main` with at least one other person's review before merging.

Backend contributions belong in `backend/`; active storefront work belongs in `design-mockup/`. Report bugs and feature requests through GitHub Issues, including reproduction steps for bugs.

## License

The software is licensed under the [MIT License](LICENSE), copyright © 2026 kiprotich-desmond.

Book and research content is governed by its own licensing terms. See the storefront's [Content Licensing](design-mockup/licensing.html), [Terms & Conditions](design-mockup/terms.html), [Privacy Policy](design-mockup/privacy.html), and [Refund Policy](design-mockup/refund-policy.html) pages.
