# OpenBook Store

An online storefront for ebooks and research materials, built around legitimately sourced content — public domain works, open-access research, and licensed/original titles.

## Project structure

```
OpenBook-Store/
├── backend/          Express API — auth, books, orders, wishlist, admin, watermarking
├── frontend/          React app (early scaffold — not yet the active UI)
├── design-mockup/     37-page static HTML/Tailwind prototype — the current working design
└── README.md          You are here
```

## Which frontend is "real" right now?

**`design-mockup/`** is the actively developed, full-featured frontend — 37 linked pages (catalog, wishlist, favourites, checkout, admin, legal pages, etc.), styled with Tailwind, using the `backend/` API contract.

**`frontend/`** is an earlier React scaffold from before `design-mockup/` existed. It is not currently wired up or actively maintained. The team should decide whether to:
- Port `design-mockup/`'s design into React (`frontend/`) for a component-based build, or
- Continue building directly on the static `design-mockup/` pages and retire `frontend/`

This decision should happen before more work goes into either path.

## Getting started

### Backend
```bash
cd backend
npm install
cp .env.example .env    # fill in your own values — see backend/README.md
npm run seed             # populates the demo catalog
npm run dev
```
Runs at `http://localhost:4000`. Full setup and what's real vs. stubbed: see `backend/README.md`.

### Design mockup (current frontend)
No install needed — open `design-mockup/index.html` directly in a browser, or serve the folder with any static file server. Currently uses browser localStorage for cart/wishlist/favourites rather than the backend API; connecting it to the real `backend/` endpoints is the next major step.

### React scaffold (frontend/)
```bash
cd frontend
npm install
npm start
```
Runs at `http://localhost:3000`.

## Tech stack

- **Backend:** Node.js, Express, JSON file storage (swap for Postgres/MongoDB before production — see `backend/README.md`)
- **Current frontend:** Static HTML + Tailwind CSS (CDN) + vanilla JS
- **React scaffold:** React (not yet active)
- **Payments:** Stripe (integration point ready in `backend/routes/orders.js`, needs real API keys)
- **Auth:** JWT + bcrypt (real email/password); Google/Facebook sign-in stubbed pending OAuth app registration

## Contributing

See `CONTRIBUTING.md` for branch/PR workflow and setup notes.

## Legal

Terms & Conditions, Privacy Policy, Content Licensing, Refund Policy, Cookie Policy, and Accessibility Statement are all in `design-mockup/` as standalone pages.
