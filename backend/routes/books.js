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

const allowedTiers = new Set(['library', 'catalog', 'offer']);

function parseNonNegativeNumber(value, fieldName) {
  if ((typeof value !== 'number' && typeof value !== 'string') ||
      (typeof value === 'string' && value.trim() === '')) {
    return { error: `${fieldName} must be a finite number greater than or equal to 0.` };
  }

  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    return { error: `${fieldName} must be a finite number greater than or equal to 0.` };
  }
  return { value: number };
}

function parseOptionalInteger(value, fieldName, positive = false) {
  if (value === '' || value === null) return { value: null };
  if ((typeof value !== 'number' && typeof value !== 'string') ||
      (typeof value === 'string' && value.trim() === '')) {
    return { error: `${fieldName} must be ${positive ? 'a positive' : 'an'} integer.` };
  }

  const number = Number(value);
  if (!Number.isFinite(number) || !Number.isInteger(number) || (positive && number <= 0)) {
    return { error: `${fieldName} must be ${positive ? 'a positive' : 'an'} integer.` };
  }
  return { value: number };
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

  const normalizedTier = tier || 'catalog';
  if (!allowedTiers.has(normalizedTier)) return res.status(400).json({ error: 'Tier must be library, catalog, or offer.' });

  const normalizedPrice = price === undefined
    ? { value: 0 }
    : parseNonNegativeNumber(price, 'Price');
  if (normalizedPrice.error) return res.status(400).json({ error: normalizedPrice.error });

  const normalizedOldPrice = oldPrice === undefined || oldPrice === '' || oldPrice === null
    ? { value: null }
    : parseNonNegativeNumber(oldPrice, 'Old price');
  if (normalizedOldPrice.error) return res.status(400).json({ error: normalizedOldPrice.error });

  const normalizedPages = pages === undefined ? { value: null } : parseOptionalInteger(pages, 'Pages', true);
  if (normalizedPages.error) return res.status(400).json({ error: normalizedPages.error });

  const normalizedYear = year === undefined ? { value: null } : parseOptionalInteger(year, 'Year');
  if (normalizedYear.error) return res.status(400).json({ error: normalizedYear.error });

  const db = readDB();
  const nextId = db.books.length ? Math.max(...db.books.map(b => b.id)) + 1 : 1;

  const book = {
    id: nextId,
    title, author,
    year: normalizedYear.value,
    pages: normalizedPages.value,
    category,
    tier: normalizedTier,
    price: normalizedTier === 'library' ? 0 : normalizedPrice.value,
    oldPrice: normalizedOldPrice.value,
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
  const normalizedTier = tier === undefined ? book.tier : tier;
  if (!allowedTiers.has(normalizedTier)) return res.status(400).json({ error: 'Tier must be library, catalog, or offer.' });

  const normalizedPrice = price === undefined
    ? { value: book.price }
    : parseNonNegativeNumber(price, 'Price');
  if (normalizedPrice.error) return res.status(400).json({ error: normalizedPrice.error });

  const normalizedOldPrice = oldPrice === undefined
    ? { value: book.oldPrice }
    : oldPrice === '' || oldPrice === null
      ? { value: null }
      : parseNonNegativeNumber(oldPrice, 'Old price');
  if (normalizedOldPrice.error) return res.status(400).json({ error: normalizedOldPrice.error });

  const normalizedPages = pages === undefined ? { value: book.pages } : parseOptionalInteger(pages, 'Pages', true);
  if (normalizedPages.error) return res.status(400).json({ error: normalizedPages.error });

  const normalizedYear = year === undefined ? { value: book.year } : parseOptionalInteger(year, 'Year');
  if (normalizedYear.error) return res.status(400).json({ error: normalizedYear.error });

  Object.assign(book, {
    title: title ?? book.title,
    author: author ?? book.author,
    year: normalizedYear.value,
    pages: normalizedPages.value,
    category: category ?? book.category,
    tier: normalizedTier,
    price: normalizedTier === 'library' ? 0 : normalizedPrice.value,
    oldPrice: normalizedOldPrice.value,
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
