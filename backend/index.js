import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';

mongoose.set('bufferCommands', false);
const port = Number(process.env.PORT || 5000);
try {
  await mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000
});
  const server = createApp().listen(port, () => console.log(`API running at http://localhost:${port}`));
  server.on('error', async (error) => {
    console.error(`Server failed: ${error.code || error.name}`);
    await mongoose.disconnect();
    process.exit(1);
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    }));
  }
} catch (error) {
  console.error(`MongoDB connection failed (${error.name}). Run npm run db from the project root, start your own MongoDB, or set MONGODB_URI in backend/.env.`);
  process.exit(1);
}
