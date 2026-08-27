import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/books`)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1>OpenBook Store</h1>
      <p>Ebooks and research materials, legitimately sourced.</p>

      {loading && <p>Loading books...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error} (is the backend running?)</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {books.map((book) => (
          <li
            key={book.id}
            style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem', marginBottom: '0.75rem' }}
          >
            <strong>{book.title}</strong>
            <div>{book.author}</div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>Source: {book.source}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
