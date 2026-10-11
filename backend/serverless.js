import mongoose from 'mongoose';
import { createApp } from './app.js';

// Vercel serves the React build; this function only handles the API.
const app = createApp({ serveFrontend: false });
mongoose.set('bufferCommands', false);
let connectionPromise;

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri?.trim()) throw new Error('Missing database configuration');

  // Concurrent requests share the same connection attempt. Warm requests reuse it.
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    }).finally(() => { connectionPromise = undefined; });
  }
  await connectionPromise;
}

function restoreApiPath(req) {
  const url = new URL(req.url, 'http://localhost');
  if (/^\/api(?:\/index(?:\.js)?)?\/?$/.test(url.pathname) && url.searchParams.has('__route')) {
    const route = url.searchParams.get('__route');
    url.searchParams.delete('__route');
    const path = route.split('/').map(encodeURIComponent).join('/');
    req.url = `/api/${path}${url.search}`;
  }
}

export default async function handler(req, res) {
  try {
    await connectDatabase();
  } catch (error) {
    // Log only the error type so connection strings never appear in logs.
    console.error(`Database connection failed (${error.name}).`);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Database unavailable. Please try again shortly.' }));
    return;
  }
  restoreApiPath(req);
  return app(req, res);
}
