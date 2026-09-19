const assert = require('node:assert/strict');
const { once } = require('node:events');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { after, before, describe, test } = require('node:test');

describe('application smoke tests', () => {
  let tempDir;
  let server;
  const previousEnv = {
    NODE_ENV: process.env.NODE_ENV,
    OPENBOOK_TEST_DB_PATH: process.env.OPENBOOK_TEST_DB_PATH,
    OPENBOOK_TEST_UPLOAD_DIR: process.env.OPENBOOK_TEST_UPLOAD_DIR,
  };

  before(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'openbook-smoke-'));
    process.env.NODE_ENV = 'test';
    process.env.OPENBOOK_TEST_DB_PATH = path.join(tempDir, 'db.json');
    process.env.OPENBOOK_TEST_UPLOAD_DIR = path.join(tempDir, 'uploads');

    // Paths must be set before importing any application or route modules.
    const { createApp } = require('../app');
    server = http.createServer(createApp());
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
  });

  after(async () => {
    try {
      if (server && server.listening) {
        await new Promise((resolve, reject) => {
          server.close(error => error ? reject(error) : resolve());
        });
      }
    } finally {
      for (const [key, value] of Object.entries(previousEnv)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
      if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  function getJson(pathname) {
    return new Promise((resolve, reject) => {
      const request = http.get({
        hostname: '127.0.0.1',
        port: server.address().port,
        path: pathname,
        agent: false,
      }, response => {
        let body = '';
        response.setEncoding('utf8');
        response.on('data', chunk => { body += chunk; });
        response.on('error', reject);
        response.on('end', () => {
          try {
            assert.match(response.headers['content-type'], /^application\/json\b/);
            resolve({ status: response.statusCode, body: JSON.parse(body) });
          } catch (error) {
            reject(error);
          }
        });
      });
      request.on('error', reject);
      request.setTimeout(5000, () => request.destroy(new Error('Smoke request timed out')));
    });
  }

  test('GET /api/health returns healthy JSON', async () => {
    const response = await getJson('/api/health');
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { status: 'ok' });
  });

  test('unknown routes return the existing JSON 404', async () => {
    const response = await getJson('/a-route-that-does-not-exist');
    assert.equal(response.status, 404);
    assert.deepEqual(response.body, { error: 'Not found.' });
  });
});
