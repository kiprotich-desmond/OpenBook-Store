require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
    origin: [
        'https://open-book-store.vercel.app',
            'http://localhost:5173',
                'http://localhost:3000'
                  ],
                    credentials: true
                    }));
                    
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/user', require('./routes/user-lists'));       // wishlist + favorites
app.use('/api/orders', require('./routes/orders'));         // checkout, receipts, sales
app.use('/api/contact', require('./routes/contact'));

app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

app.listen(PORT, () => {
  console.log(`OpenBook Store API running on http://localhost:${PORT}`);
});
