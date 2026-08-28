const express = require('express');
const { v4: uuid } = require('uuid');
const { readDB, writeDB } = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { sendMail } = require('../utils/email');

const router = express.Router();

// ---------- Checkout ----------
// If STRIPE_SECRET_KEY is set, this creates a real Stripe PaymentIntent and
// the frontend must confirm it with Stripe.js before calling /confirm below.
// If not set, checkout runs in "simulation" mode: no real charge happens,
// but the order/receipt/email flow still runs so you can test end-to-end.
router.post('/checkout', requireAuth, async (req, res) => {
  const { bookIds } = req.body;
  if (!Array.isArray(bookIds) || !bookIds.length) return res.status(400).json({ error: 'No books provided.' });

  const db = readDB();
  const books = db.books.filter(b => bookIds.includes(b.id));
  const total = books.reduce((sum, b) => sum + b.price, 0);

  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe expects cents
      currency: 'usd',
      metadata: { bookIds: bookIds.join(',') },
    });
    return res.json({ mode: 'stripe', clientSecret: intent.client_secret, total });
  }

  // Simulation mode — no real card is charged.
  res.json({ mode: 'simulation', total, message: 'Stripe not configured — this checkout will not charge a real card. Call /confirm to complete the demo order.' });
});

// ---------- Confirm order (runs after payment succeeds, real or simulated) ----------
router.post('/confirm', requireAuth, async (req, res) => {
  const { bookIds } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  const books = db.books.filter(b => bookIds.includes(b.id));
  if (!books.length) return res.status(400).json({ error: 'No matching books.' });

  const purchaseId = 'OBS-' + uuid().slice(0, 8).toUpperCase();
  const now = new Date().toISOString();

  const order = {
    id: purchaseId,
    userId: user.id,
    userEmail: user.email,
    books: books.map(b => ({ id: b.id, title: b.title, price: b.price })),
    total: books.reduce((s, b) => s + b.price, 0),
    date: now,
  };
  db.orders.push(order);
  user.owned = [...new Set([...user.owned, ...bookIds])];
  writeDB(db);

  // Real watermarking would run here against the actual purchased PDF file,
  // e.g.: const watermarked = await watermarkPdf(fs.readFileSync(filePath), { name: user.name, email: user.email, purchaseId });
  // then attach `watermarked` to the email below. Omitted here since this
  // demo has no real uploaded PDF files to watermark yet — see utils/watermark.js.

  await sendMail({
    to: user.email,
    subject: `Your OpenBook Store receipt — ${purchaseId}`,
    text: `Thanks for your purchase!\n\nOrder ID: ${purchaseId}\n${order.books.map(b => `- ${b.title}: $${b.price}`).join('\n')}\nTotal: $${order.total}\n\nYour books are available in My Library.`,
  });

  res.json({ order, notification: `Purchase complete! Receipt sent to ${user.email}.` });
});

// ---------- User: order history ----------
router.get('/mine', requireAuth, (req, res) => {
  const db = readDB();
  res.json(db.orders.filter(o => o.userId === req.user.id));
});

// ---------- Admin: all sales ----------
router.get('/admin/all', requireAdmin, (req, res) => {
  const db = readDB();
  const totalRevenue = db.orders.reduce((s, o) => s + o.total, 0);
  res.json({ orders: db.orders, totalRevenue, count: db.orders.length });
});

module.exports = router;
