import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

test('serverless adapter connects once and supports rewritten MongoDB task APIs', { timeout: 300000 }, async (t) => {
  // Never import .env or connect to a deployment database from this test.
  const previousUri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;
  const { default: handler } = await import('../api/index.js');
  const observedUrls = [];
  const server = createServer((req, res) => {
    res.once('finish', () => observedUrls.push(req.originalUrl || req.url));
    Promise.resolve(handler(req, res)).catch((error) => {
      res.statusCode = 500;
      res.end(JSON.stringify({ message: error.message }));
    });
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const request = async (route, method = 'GET', body) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${route}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: response.status === 204 ? null : await response.json() };
  };
  let database;
  const originalConnect = mongoose.connect;
  let connectionCount = 0;
  try {
    await t.test('missing MongoDB configuration returns a JSON 503', async () => {
      const unavailable = await request('/api/index?__route=tasks');
      assert.equal(unavailable.status, 503);
      assert.equal(typeof unavailable.body.message, 'string');
    });

    const databaseName = `serverless_test_${Date.now()}`;
    database = await MongoMemoryServer.create({
      binary: { downloadDir: fileURLToPath(new URL('./.cache/mongodb-binaries/', import.meta.url)) },
      instance: { dbName: databaseName },
    });
    process.env.MONGODB_URI = database.getUri(databaseName);
    // Count real connection calls without replacing the database with a mock.
    mongoose.connect = function (...args) {
      connectionCount += 1;
      return originalConnect.apply(this, args);
    };

    await t.test('concurrent cold requests share one real MongoDB connection', async () => {
      const responses = await Promise.all(Array.from({ length: 4 }, () => request('/api/index?__route=tasks')));
      for (const response of responses) assert.deepEqual(response, { status: 200, body: [] });
      assert.equal(connectionCount, 1);
    });

    let taskId;
    await t.test('rewritten create, list, completion, and delete persist in MongoDB', async () => {
      const created = await request('/api/index?__route=tasks', 'POST', { title: 'Prepare a class presentation' });
      assert.equal(created.status, 201);
      assert.equal(created.body.title, 'Prepare a class presentation');
      assert.equal(created.body.completed, false);
      taskId = created.body.id;
      const list = await request('/api/index?__route=tasks&view=all');
      assert.equal(list.status, 200);
      assert.equal(list.body[0].id, taskId);
      assert.ok(observedUrls.includes('/api/tasks?view=all'));
      const completed = await request(`/api/index?__route=tasks%2F${taskId}`, 'PATCH', { completed: true });
      assert.equal(completed.status, 200);
      assert.equal(completed.body.completed, true);
      const saved = await mongoose.connection.collection('tasks').findOne({ _id: new mongoose.Types.ObjectId(taskId) });
      assert.equal(saved.completed, true);
      assert.equal((await request(`/api/index?__route=tasks%2F${taskId}`, 'DELETE')).status, 204);
      assert.deepEqual((await request('/api/index?__route=tasks')).body, []);
    });

    await t.test('original API routes, health, and unknown endpoints respond correctly', async () => {
      assert.deepEqual(await request('/api/tasks?view=all'), { status: 200, body: [] });
      assert.deepEqual(await request('/api/index?__route=health'), {
        status: 200,
        body: { status: 'ok', database: 'connected' },
      });
      const unknown = await request('/api/index?__route=missing');
      assert.equal(unknown.status, 404);
      assert.equal(typeof unknown.body.message, 'string');
      assert.equal(connectionCount, 1);
    });
  } finally {
    mongoose.connect = originalConnect;
    await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState === 1) await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    if (database) await database.stop();
    if (previousUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = previousUri;
  }
});
