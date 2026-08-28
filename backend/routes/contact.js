const express = require('express');
const { readDB, writeDB } = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { sendMail } = require('../utils/email');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, subject, message } = req.body;
  if (!email || !subject || !message) return res.status(400).json({ error: 'Email, subject, and message are required.' });

  const db = readDB();
  const entry = { id: Date.now(), email, subject, message, date: new Date().toISOString() };
  db.messages.push(entry);
  writeDB(db);

  await sendMail({
    to: process.env.SMTP_FROM || 'admin@openbookstore.example',
    subject: `New contact message: ${subject}`,
    text: `From: ${email}\n\n${message}`,
  });

  res.json({ sent: true });
});

router.get('/admin/all', requireAdmin, (req, res) => {
  const db = readDB();
  res.json(db.messages);
});

module.exports = router;
