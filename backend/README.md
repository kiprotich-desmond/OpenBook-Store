# OpenBook Store — Backend

A working Express API matching the frontend's requirements: books, auth, wishlist/favorites, checkout/orders, receipts, PDF watermarking, and admin management.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- Set `JWT_SECRET` to a long random string.
- Set `ADMIN_USERNAME` and generate `ADMIN_PASSWORD_HASH`:
  ```bash
  node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"
  ```
  Paste the output into `ADMIN_PASSWORD_HASH`.

Seed the demo catalog (matches the frontend's placeholder books):
```bash
npm run seed
```

Run it:
```bash
npm run dev
```
API runs at `http://localhost:4000`.

## What's fully real and working

- **Books API** — public browse/detail, admin create/edit/delete, single-file cover upload (`multer`, enforced to one file per upload)
- **Auth** — real email/password signup and login (bcrypt-hashed passwords, JWT sessions), real admin login
- **Wishlist & Favorites** — persisted per-user on the server, so a shared wishlist link genuinely works across devices (unlike the frontend prototype's localStorage version)
- **Orders & Receipts** — checkout, order history, admin sales log with revenue totals
- **PDF Watermarking** — `utils/watermark.js` uses `pdf-lib` to stamp a real, light, diagonal watermark (name, email, purchase ID) onto a PDF. This is genuinely functional, not a stub — wire it into the checkout flow once you have real uploaded book files to watermark.
- **Contact form** — stores messages and (if SMTP is set) emails them

## What's intentionally stubbed — and what real setup each needs

- **Stripe payments** — `routes/orders.js` checks for `STRIPE_SECRET_KEY`. Without it, checkout runs in "simulation" mode (no real charge, but the rest of the flow works for testing). To go live: create a Stripe account, get your secret key, and add frontend Stripe.js to actually collect card details — this backend alone can't take real payments.
- **Google / Facebook login** — `routes/auth.js` has clearly-labeled stub endpoints that return a `501` explaining what's missing. Real OAuth needs you to register an app with Google Cloud Console and/or Meta for Developers, then implement the actual token exchange.
- **Sending real email** — works automatically once you fill in `SMTP_HOST/USER/PASS` in `.env` (e.g. via SendGrid, Mailgun, or Gmail SMTP for testing). Until then, emails are printed to the console instead of sent, so nothing breaks.
- **EPUB watermarking** — the included watermarker only handles PDF. EPUB needs a different technique (metadata/stylesheet injection); flag this if EPUB purchases also need a visible watermark.

## Database

This backend uses a single JSON file (`data/db.json`) as its database, so it runs with zero external setup — good for development and demoing the full flow end-to-end. **For real production use with real users, replace `db.js` with a proper Postgres or MongoDB connection** — every route only calls the functions exported from `db.js`, so the routes themselves won't need to change, just that one file.
