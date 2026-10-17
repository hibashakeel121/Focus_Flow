import express from 'express';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Note from './models/Note.js';
import Task from './models/Task.js';

export function createApp({ serveFrontend = process.env.NODE_ENV === 'production' } = {}) {
  const app = express();
  app.use(cors()); // 2. Add this line right here to enable CORS for all origins (or pass configuration options)

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.get('/api/health', (_req, res) => {
    const connected = mongoose.connection.readyState === 1;
    res.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'unavailable', database: connected ? 'connected' : 'disconnected' });
  });
  app.use('/api', (_req, res, next) => {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'Database unavailable. Please try again shortly.' });
    next();
  });
  app.param('id', (req, res, next, id) => {
    if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ message: 'Invalid resource ID.' });
    next();
  });
  function validateNote(req, res, next) {
    const { title, content } = req.body || {};
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 200 || typeof content !== 'string' || content.length > 100000) {
      return res.status(400).json({ message: 'Provide a title (1–200 characters) and content (up to 100,000 characters).' });
    }
    req.noteData = { title: title.trim(), content };
    next();
  }
  app.get('/api/notes', async (_req, res) => {
    res.json(await Note.find().sort({ createdAt: -1, _id: -1 }));
  });
  app.get('/api/notes/:id', async (req, res) => {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json(note);
  });
  app.post('/api/notes', validateNote, async (req, res) => {
    res.status(201).json(await Note.create(req.noteData));
  });
  app.put('/api/notes/:id', validateNote, async (req, res) => {
    const note = await Note.findByIdAndUpdate(req.params.id, req.noteData, { returnDocument: 'after', runValidators: true });
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json(note);
  });
  app.delete('/api/notes/:id', async (req, res) => {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.status(204).end();
  });

  app.get('/api/tasks', async (_req, res) => {
    const tasks = await Task.find().sort({ createdAt: -1, _id: -1 });
    res.status(200).json(tasks);
  });

  app.post('/api/tasks', async (req, res) => {
    const { title } = req.body || {};
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 200) {
      return res.status(400).json({ message: 'Enter a task title between 1 and 200 characters.' });
    }
    const task = await Task.create({ title: title.trim() });
    res.status(201).json(task);
  });

  app.patch('/api/tasks/:id', async (req, res) => {
    const { completed } = req.body || {};
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'The completed field must be true or false.' });
    }
    const task = await Task.findByIdAndUpdate(req.params.id, { completed }, { returnDocument: 'after', runValidators: true });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.status(200).json(task);
  });

  app.delete('/api/tasks/:id', async (req, res) => {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.status(204).end();
  });

  app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found.' }));
  if (serveFrontend) {
    const dist = fileURLToPath(new URL('../frontend/dist/', import.meta.url));
    app.use(express.static(dist));
    app.get('/{*path}', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }
  app.use((error, _req, res, _next) => {
    if (error.type === 'entity.parse.failed') return res.status(400).json({ message: 'Invalid JSON body.' });
    if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Request body is too large.' });
    if (error.name === 'ValidationError') return res.status(400).json({ message: 'Invalid resource data.' });
    console.error(error.message);
    res.status(500).json({ message: 'Unable to complete the request. Please try again.' });
  });
  return app;
}
