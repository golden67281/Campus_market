import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow setting a persistent directory (e.g., Render Persistent Disk) to preserve database JSON files
const DATA_DIR = process.env.PERSISTENT_DATA_DIR || path.join(__dirname, '..', 'data');

// Queue/chain for sequential writes to avoid race conditions (JSON fallback)
const writeQueue = {};

// In-memory cache for tables: tableName -> array of records (JSON fallback)
const dbCache = {};

let mongoClient = null;
let mongoDb = null;
let isConnecting = false;
let connectionFailed = false;

/**
 * Retrieves the MongoDB database instance if MONGODB_URI is provided.
 * Handles retries and reconnection automatically.
 */
async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }

  // Return existing connection if healthy
  if (mongoDb && mongoClient) {
    return mongoDb;
  }

  // Prevent multiple simultaneous connection attempts
  if (isConnecting) {
    // Wait for existing connection attempt
    await new Promise(resolve => setTimeout(resolve, 2000));
    return mongoDb;
  }

  isConnecting = true;

  try {
    console.log('🔌 Connecting to MongoDB Atlas → campus_market...');

    // Close any stale client
    if (mongoClient) {
      try { await mongoClient.close(); } catch (_) {}
      mongoClient = null;
      mongoDb = null;
    }

    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
    });

    await mongoClient.connect();
    mongoDb = mongoClient.db('campus_market');

    // Verify connection with a ping
    await mongoDb.command({ ping: 1 });

    connectionFailed = false;
    console.log('🍃 Successfully connected to MongoDB → campus_market database!');
    return mongoDb;

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    connectionFailed = true;
    mongoClient = null;
    mongoDb = null;
    return null;
  } finally {
    isConnecting = false;
  }
}

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

/**
 * Reads data from a table.
 * If MongoDB is connected, retrieves documents from the collection.
 * Includes auto-migration to copy local JSON data to empty MongoDB collections.
 */
export async function readTable(tableName) {
  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection(tableName);
      // Do NOT exclude _id — our documents use _id as a string key (e.g. "u_aarav")
      const data = await collection.find({}).toArray();

      // Auto-Migration: If MongoDB collection is empty, migrate local JSON data
      if (data.length === 0) {
        const pathsToTry = [
          path.join(DATA_DIR, `${tableName}.json`),
          path.join(__dirname, '..', 'data', `${tableName}.json`)
        ];
        for (const filePath of pathsToTry) {
          try {
            const content = await fs.readFile(filePath, 'utf8');
            const jsonData = JSON.parse(content || '[]');
            if (jsonData.length > 0) {
              console.log(`📦 [Auto-Migration] Seeding MongoDB '${tableName}' from: ${filePath}`);
              await writeTable(tableName, jsonData);
              return [...jsonData];
            }
          } catch (_) {
            // Try next path
          }
        }
      }

      return data;

    } catch (err) {
      console.error(`❌ MongoDB read error on '${tableName}':`, err.message);
      // Reset connection so next call retries
      mongoDb = null;
      mongoClient = null;
    }
  }

  // Fallback: Read from local JSON files
  if (dbCache[tableName]) {
    return [...dbCache[tableName]];
  }

  const filePath = path.join(DATA_DIR, `${tableName}.json`);
  await ensureDir(DATA_DIR);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(content || '[]');
    dbCache[tableName] = data;
    return [...data];
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(filePath, '[]', 'utf8');
      dbCache[tableName] = [];
      return [];
    }
    throw err;
  }
}

/**
 * Writes data to a table.
 * If MongoDB is connected, performs an upsert sync to insert/update modified documents.
 */
export async function writeTable(tableName, data) {
  // Update memory cache
  dbCache[tableName] = data;

  const db = await getDb();
  if (db) {
    try {
      const collection = db.collection(tableName);

      if (data.length === 0) {
        await collection.deleteMany({});
        return;
      }

      // Use _id field as document ID for MongoDB
      const bulkOps = [];
      const newIds = new Set(data.map(item => item._id));

      for (const item of data) {
        const { _id, ...rest } = item;
        bulkOps.push({
          replaceOne: {
            filter: { _id: _id },
            replacement: { _id, ...rest },
            upsert: true
          }
        });
      }

      // Delete removed documents
      bulkOps.push({
        deleteMany: {
          filter: { _id: { $nin: Array.from(newIds) } }
        }
      });

      await collection.bulkWrite(bulkOps);
      return;

    } catch (err) {
      console.error(`❌ MongoDB write error on '${tableName}':`, err.message);
      // Reset connection so next call retries
      mongoDb = null;
      mongoClient = null;
    }
  }

  // Fallback: Write to local JSON files
  const filePath = path.join(DATA_DIR, `${tableName}.json`);
  await ensureDir(DATA_DIR);

  if (!writeQueue[tableName]) {
    writeQueue[tableName] = Promise.resolve();
  }

  const writeOperation = writeQueue[tableName].then(async () => {
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(tempPath, filePath);
  });

  writeQueue[tableName] = writeOperation;
  await writeOperation;
}

// Helper to generate custom human-readable ID
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}
