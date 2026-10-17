
import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';

mongoose.set('bufferCommands', false);

const port = Number(process.env.PORT || 5000);

try {
  // Check that Railway has the MongoDB URI
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error('MONGODB_URI is missing from environment variables');
  }

  // Connect to MongoDB Atlas
  await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 10000
  });

  console.log('MongoDB connected successfully!');

  // Start the backend server
  const server = createApp().listen(port, '0.0.0.0', () => {
    console.log(`API running on port ${port}`);
  });

  server.on('error', async (error) => {
    console.error('Server failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  });

  // Graceful shutdown
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => {
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });
    });
  }

} catch (error) {
  console.error('MongoDB connection failed!');
  console.error('Error type:', error.name);
  console.error('Error message:', error.message);
  process.exit(1);
}
