// db.js — a minimal file-based database so this backend runs with zero
// external setup (no Postgres/MongoDB install needed for local dev or demo).
//
// For a real production deployment, replace this file with a proper
// connection to Postgres (e.g. via Prisma) or MongoDB — the rest of the
// codebase only calls the functions exported here, so swapping the storage
// layer does not require touching the routes.

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const empty = { books: [], users: [], orders: [], messages: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(empty, null, 2));
    return empty;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
