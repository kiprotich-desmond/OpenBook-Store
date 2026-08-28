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
  const requestedBookIds = [...new Set(bookIds)];
  const books = db.books.filter(b => requestedBookIds.includes(b.id));
  if (books.length !== requestedBookIds.length) return res.status(400).json({ error: 'One or more books were not found.' });
  const total = books.reduce((sum, b) => sum + b.price, 0);

  if (process.env.STRIPE_SECRET_KEY) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Stripe expects cents
      currency: 'usd',
      metadata: {
        userId: String(req.user.id),
        bookIds: books.map(b => String(b.id)).sort().join(','),
      },
    });
    return res.json({ mode: 'stripe', clientSecret: intent.client_secret, paymentIntentId: intent.id, total });
  }

  // Simulation mode — no real card is charged.
  res.json({ mode: 'simulation', total, message: 'Stripe not configured — this checkout will not charge a real card. Call /confirm to complete the demo order.' });
});

// ---------- Confirm order (runs after payment succeeds, real or simulated) ----------
router.post('/confirm', requireAuth, async (req, res) => {
  const { bookIds, paymentIntentId } = req.body || {};
  if (!Array.isArray(bookIds) || !bookIds.length) return res.status(400).json({ error: 'No books provided.' });

  let db = readDB();
  let user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });

  const requestedBookIds = [...new Set(bookIds)];
  let books = db.books.filter(b => requestedBookIds.includes(b.id));
  if (books.length !== requestedBookIds.length) return res.status(400).json({ error: 'One or more books were not found.' });
  let total = books.reduce((s, b) => s + b.price, 0);
  let verifiedPaymentIntentId;

  if (process.env.STRIPE_SECRET_KEY) {
    if (typeof paymentIntentId !== 'string' || !paymentIntentId.trim()) {
      return res.status(400).json({ error: 'PaymentIntent ID is required.' });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    let intent;
    try {
      intent = await stripe.paymentIntents.retrieve(paymentIntentId.trim());
    } catch (err) {
      return res.status(400).json({ error: 'Unable to verify payment.' });
    }

    if (!intent) return res.status(400).json({ error: 'Unable to verify payment.' });

    // Re-read immediately before verification and mutation so replay checks use current data.
    db = readDB();
    user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    books = db.books.filter(b => requestedBookIds.includes(b.id));
    if (books.length !== requestedBookIds.length) return res.status(400).json({ error: 'One or more books were not found.' });
    total = books.reduce((s, b) => s + b.price, 0);

    if (intent.status !== 'succeeded') return res.status(402).json({ error: 'Payment has not succeeded.' });
    if (intent.amount !== Math.round(total * 100)) return res.status(400).json({ error: 'Payment amount does not match order total.' });
    if (intent.currency !== 'usd') return res.status(400).json({ error: 'Payment currency does not match checkout currency.' });
    if (!intent.metadata || intent.metadata.userId !== String(user.id)) return res.status(403).json({ error: 'Payment does not belong to this user.' });

    const confirmedBookIds = books.map(b => String(b.id)).sort().join(',');
    const paidBookIds = [...new Set((intent.metadata.bookIds || '').split(',').filter(Boolean))].sort().join(',');
    if (paidBookIds !== confirmedBookIds) return res.status(400).json({ error: 'Payment books do not match order books.' });

    verifiedPaymentIntentId = intent.id;
    if (db.orders.some(order => order.paymentIntentId === verifiedPaymentIntentId)) {
      return res.status(409).json({ error: 'Payment has already been used for an order.' });
    }
  }

  const purchaseId = 'OBS-' + uuid().slice(0, 8).toUpperCase();
  const now = new Date().toISOString();

  const order = {
    id: purchaseId,
    userId: user.id,
    userEmail: user.email,
    books: books.map(b => ({ id: b.id, title: b.title, price: b.price })),
    total,
    date: now,
  };
  if (verifiedPaymentIntentId) order.paymentIntentId = verifiedPaymentIntentId;
  db.orders.push(order);
  user.owned = [...new Set([...user.owned, ...books.map(b => b.id)])];
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
