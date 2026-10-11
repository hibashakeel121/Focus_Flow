import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';

// Store real MongoDB files on disk so saved tasks survive development sessions.
const databasePath = fileURLToPath(new URL('../.data/', import.meta.url));
const downloadDir = fileURLToPath(new URL('../.cache/mongodb-binaries/', import.meta.url));
await mkdir(databasePath, { recursive: true });

try {
  const database = await MongoMemoryServer.create({
    binary: { downloadDir },
    instance: {
      ip: '127.0.0.1',
      port: 27017,
      portGeneration: false,
      dbName: 'student_task_manager',
      dbPath: databasePath,
      storageEngine: 'wiredTiger',
    },
  });
  console.log(`MongoDB running at ${database.getUri('student_task_manager')}`);
  console.log('Database files are kept in backend/.data. Press Ctrl+C to stop.');

  let stopping = false;
  async function stopDatabase() {
    if (stopping) return;
    stopping = true;
    // Preserve the configured database directory rather than cleaning it up.
    await database.stop({ doCleanup: false });
    process.exit(0);
  }
  process.once('SIGINT', stopDatabase);
  process.once('SIGTERM', stopDatabase);
} catch (error) {
  console.error(`Unable to start local MongoDB: ${error.message}`);
  console.error('Stop any MongoDB already using port 27017, or use that server instead.');
  process.exit(1);
}
