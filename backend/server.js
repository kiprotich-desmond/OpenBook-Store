require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// TODO: replace with a real database (Postgres/Mongo) — this is just
// placeholder data so the frontend has something to fetch during setup.
const books = [
  {
    id: 1,
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    price: 0,
    source: 'public-domain',
    coverUrl: null,
  },
  {
    id: 2,
    title: 'Sample Research Paper',
    author: 'Open Access Journal',
    price: 0,
    source: 'open-access',
    coverUrl: null,
  },
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/books', (req, res) => {
  res.json(books);
});

app.get('/api/books/:id', (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  res.json(book);
});

app.listen(PORT, () => {
  console.log(`OpenBook Store API running on http://localhost:${PORT}`);
});
