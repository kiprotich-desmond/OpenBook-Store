const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { readDB, writeDB } = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const coverTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};
// .single('cover') enforces exactly one file for the given field name
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (coverTypes[extension] === file.mimetype) return cb(null, true);

    const error = new Error('Invalid cover type');
    error.code = 'INVALID_COVER_TYPE';
    cb(error);
  },
});

function uploadCover(req, res, next) {
  upload.single('cover')(req, res, err => {
    if (!err) return next();
    if (err.code === 'INVALID_COVER_TYPE') {
      return res.status(400).json({ error: 'Cover must be a JPG, JPEG, PNG, or WEBP image.' });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Cover image must be 8 MB or smaller.' });
    }
    next(err);
  });
}

// ---------- Public ----------
router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.books);
});

// ---------- Admin: category counts (for Catalog Overview page) ----------
router.get('/admin/category-counts', requireAdmin, (req, res) => {
  const db = readDB();
  const counts = {};
  db.books.forEach(b => { counts[b.category] = (counts[b.category] || 0) + 1; });
  res.json({ total: db.books.length, byCategory: counts });
});

router.get('/:id', (req, res) => {
  const db = readDB();
  const book = db.books.find(b => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: 'Book not found.' });
  res.json(book);
});

// ---------- Admin only ----------
router.post('/', requireAdmin, uploadCover, (req, res) => {
  const { title, author, year, pages, category, desc, authorBio, tier, price, oldPrice } = req.body;
  if (!title || !author || !category) return res.status(400).json({ error: 'Title, author, and category are required.' });

  const db = readDB();
  const nextId = db.books.length ? Math.max(...db.books.map(b => b.id)) + 1 : 1;
  const isFree = tier === 'library';

  const book = {
    id: nextId,
    title, author,
    year: Number(year) || null,
    pages: Number(pages) || null,
    category,
    tier: tier || 'catalog',
    price: isFree ? 0 : Number(price) || 0,
    oldPrice: oldPrice ? Number(oldPrice) : null,
    desc: desc || '',
    authorBio: authorBio || '',
    cover: req.file ? `/uploads/${req.file.filename}` : null,
  };
  db.books.push(book);
  writeDB(db);
  res.status(201).json(book);
});

router.put('/:id', requireAdmin, uploadCover, (req, res) => {
  const db = readDB();
  const book = db.books.find(b => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: 'Book not found.' });

  const { title, author, year, pages, category, desc, authorBio, tier, price, oldPrice } = req.body;
  const isFree = tier === 'library';
  Object.assign(book, {
    title: title ?? book.title,
    author: author ?? book.author,
    year: year ? Number(year) : book.year,
    pages: pages ? Number(pages) : book.pages,
    category: category ?? book.category,
    tier: tier ?? book.tier,
    price: isFree ? 0 : (price !== undefined ? Number(price) : book.price),
    oldPrice: oldPrice ? Number(oldPrice) : book.oldPrice,
    desc: desc ?? book.desc,
    authorBio: authorBio ?? book.authorBio,
    cover: req.file ? `/uploads/${req.file.filename}` : book.cover,
  });
  writeDB(db);
  res.json(book);
});

router.delete('/:id', requireAdmin, (req, res) => {
  const db = readDB();
  const before = db.books.length;
  db.books = db.books.filter(b => b.id !== Number(req.params.id));
  if (db.books.length === before) return res.status(404).json({ error: 'Book not found.' });
  writeDB(db);
  res.json({ deleted: true });
});

module.exports = router;
