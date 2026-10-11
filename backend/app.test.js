import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from './app.js';

async function withServer(callback) {
  const server = createApp().listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  const request = async (route, method = 'GET', body) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}${route}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: response.status === 204 ? null : await response.json() };
  };
  try {
    await callback(request);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('API reports database unavailability', async () => {
  await withServer(async (request) => {
    assert.equal((await request('/api/health')).status, 503);
    assert.equal((await request('/api/tasks')).status, 503);
    assert.equal((await request('/api/notes')).status, 503);
  });
});

test('MongoDB task validation, CRUD, completion, and persistence', { timeout: 300000 }, async (t) => {
  // Launch real, disposable MongoDB when an existing test server is not configured.
  const localMongo = process.env.TEST_MONGODB_URI ? null : await MongoMemoryServer.create({
    binary: { downloadDir: fileURLToPath(new URL('./.cache/mongodb-binaries/', import.meta.url)) },
  });
  const uri = process.env.TEST_MONGODB_URI || localMongo.getUri();
  // Never clean up the application's database when using an existing MongoDB server.
  const connectionOptions = { dbName: `student_tasks_test_${Date.now()}`, serverSelectionTimeoutMS: 5000 };
  let taskId;
  try {
    await mongoose.connect(uri, connectionOptions);
    await withServer(async (request) => {
      await t.test('health and empty task list', async () => {
        assert.equal((await request('/api/health')).status, 200);
        assert.deepEqual(await request('/api/tasks'), { status: 200, body: [] });
      });

      await t.test('reject empty, nonstring, and oversized titles', async () => {
        for (const title of ['', '   ', null, 42, {}, 'a'.repeat(201)]) {
          const result = await request('/api/tasks', 'POST', { title });
          assert.equal(result.status, 400);
          assert.equal(typeof result.body.message, 'string');
        }
        assert.equal((await request('/api/tasks', 'POST', {})).status, 400);
        assert.deepEqual((await request('/api/tasks')).body, []);
      });

      await t.test('create a task with a trimmed title and server defaults', async () => {
        const created = await request('/api/tasks', 'POST', {
          title: '  Finish the science assignment  ',
          completed: true,
          id: 'untrusted-client-id',
        });
        assert.equal(created.status, 201);
        assert.equal(created.body.title, 'Finish the science assignment');
        assert.equal(created.body.completed, false);
        assert.match(created.body.id, /^[a-f\d]{24}$/i);
        assert.ok(Number.isFinite(Date.parse(created.body.createdAt)));
        assert.ok(Number.isFinite(Date.parse(created.body.updatedAt)));
        assert.equal(created.body._id, undefined);
        taskId = created.body.id;
        const tasks = await request('/api/tasks');
        assert.equal(tasks.status, 200);
        assert.equal(tasks.body.length, 1);
        assert.equal(tasks.body[0].id, taskId);
      });

      await t.test('reject malformed IDs and missing tasks', async () => {
        const missingId = new mongoose.Types.ObjectId().toString();
        assert.equal((await request('/api/tasks/invalid', 'DELETE')).status, 400);
        assert.equal((await request('/api/tasks/invalid', 'PATCH', { completed: true })).status, 400);
        assert.equal((await request(`/api/tasks/${missingId}`, 'DELETE')).status, 404);
        assert.equal((await request(`/api/tasks/${missingId}`, 'PATCH', { completed: true })).status, 404);
      });

      await t.test('require a boolean completion value and allow both states', async () => {
        for (const body of [{}, { completed: 'true' }, { completed: 1 }, { completed: null }]) {
          assert.equal((await request(`/api/tasks/${taskId}`, 'PATCH', body)).status, 400);
        }
        const completed = await request(`/api/tasks/${taskId}`, 'PATCH', { completed: true });
        assert.equal(completed.status, 200);
        assert.equal(completed.body.completed, true);
        const reopened = await request(`/api/tasks/${taskId}`, 'PATCH', { completed: false });
        assert.equal(reopened.status, 200);
        assert.equal(reopened.body.completed, false);
        await request(`/api/tasks/${taskId}`, 'PATCH', { completed: true });
      });
    });

    // Restart the API and reconnect Mongoose to verify tasks survive fresh instances.
    await mongoose.disconnect();
    await mongoose.connect(uri, connectionOptions);
    await withServer(async (request) => {
      await t.test('retrieve saved tasks after restarting the API and database connection', async () => {
        const tasks = await request('/api/tasks');
        assert.equal(tasks.status, 200);
        assert.equal(tasks.body.length, 1);
        assert.equal(tasks.body[0].id, taskId);
        assert.equal(tasks.body[0].title, 'Finish the science assignment');
        assert.equal(tasks.body[0].completed, true);
      });

      await t.test('delete a task and return to the empty list', async () => {
        assert.equal((await request(`/api/tasks/${taskId}`, 'DELETE')).status, 204);
        assert.equal((await request(`/api/tasks/${taskId}`, 'DELETE')).status, 404);
        assert.deepEqual((await request('/api/tasks')).body, []);
      });

      await t.test('existing notes still support create, update, and delete', async () => {
        const created = await request('/api/notes', 'POST', { title: 'Class notes', content: 'Original' });
        assert.equal(created.status, 201);
        const noteId = created.body.id;
        const updated = await request(`/api/notes/${noteId}`, 'PUT', { title: 'Edited notes', content: 'Saved' });
        assert.equal(updated.status, 200);
        assert.equal((await request(`/api/notes/${noteId}`)).body.content, 'Saved');
        assert.equal((await request('/api/notes')).body.length, 1);
        assert.equal((await request(`/api/notes/${noteId}`, 'DELETE')).status, 204);
        assert.equal((await request(`/api/notes/${noteId}`)).status, 404);
        assert.deepEqual((await request('/api/notes')).body, []);
      });
    });
  } finally {
    if (mongoose.connection.readyState === 1) await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    if (localMongo) await localMongo.stop();
  }
});
