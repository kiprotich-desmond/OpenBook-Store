const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const { readDB, writeDB } = require('../db');

const router = express.Router();

// ---------- Real: email + password signup ----------
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });

  const db = readDB();
  if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: uuid(), name, email, passwordHash, wishlist: [], favorites: [], owned: [] };
  db.users.push(user);
  writeDB(db);

  const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// ---------- Real: email + password login ----------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// ---------- Real: admin login ----------
// Compares against ADMIN_USERNAME / ADMIN_PASSWORD_HASH in .env.
// Generate a hash locally with:  node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"
router.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;
  if (username !== process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD_HASH) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }
  const ok = await bcrypt.compare(password || '', process.env.ADMIN_PASSWORD_HASH);
  if (!ok) return res.status(401).json({ error: 'Invalid admin credentials.' });

  const token = jwt.sign({ role: 'admin', username }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

// ---------- STUBBED: Google / Facebook OAuth ----------
// These routes exist so the frontend has something to call, but they do NOT
// perform real OAuth. A real implementation needs:
//   1. A registered app with Google Cloud Console / Meta for Developers
//   2. GOOGLE_CLIENT_ID/SECRET or FACEBOOK_APP_ID/SECRET in .env
//   3. A library such as 'passport-google-oauth20' or a manual OAuth code
//      exchange, verifying the provider's token before trusting the identity
router.post('/oauth/google', (req, res) => {
  res.status(501).json({ error: 'Google sign-in is not wired up yet. Requires GOOGLE_CLIENT_ID/SECRET and a real OAuth flow — see comments in routes/auth.js.' });
});
router.post('/oauth/facebook', (req, res) => {
  res.status(501).json({ error: 'Facebook sign-in is not wired up yet. Requires FACEBOOK_APP_ID/SECRET and a real OAuth flow — see comments in routes/auth.js.' });
});

module.exports = router;
