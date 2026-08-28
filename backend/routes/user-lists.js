const express = require('express');
const { readDB, writeDB } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function findUser(db, id) {
  return db.users.find(u => u.id === id);
}

router.get('/wishlist', requireAuth, (req, res) => {
  const db = readDB();
  const user = findUser(db, req.user.id);
  res.json(user.wishlist);
});

router.post('/wishlist/:bookId', requireAuth, (req, res) => {
  const db = readDB();
  const user = findUser(db, req.user.id);
  const id = Number(req.params.bookId);
  user.wishlist = user.wishlist.includes(id) ? user.wishlist.filter(x => x !== id) : [...user.wishlist, id];
  writeDB(db);
  res.json(user.wishlist);
});

// Shareable wishlist link — real, works across devices, since it reads from
// the server rather than localStorage. Anyone with the link can view (not
// edit) this user's wishlist, per the "share with a friend" requirement.
router.get('/wishlist/shared/:userId', (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.userId);
  if (!user) return res.status(404).json({ error: 'Wishlist not found.' });
  const books = db.books.filter(b => user.wishlist.includes(b.id));
  res.json({ ownerName: user.name, books });
});

router.get('/favorites', requireAuth, (req, res) => {
  const db = readDB();
  const user = findUser(db, req.user.id);
  res.json(user.favorites);
});

router.post('/favorites/:bookId', requireAuth, (req, res) => {
  const db = readDB();
  const user = findUser(db, req.user.id);
  const id = Number(req.params.bookId);
  user.favorites = user.favorites.includes(id) ? user.favorites.filter(x => x !== id) : [...user.favorites, id];
  writeDB(db);
  res.json(user.favorites);
});

module.exports = router;
