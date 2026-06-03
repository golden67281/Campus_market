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

let client = null;
let db = null;
let connectionAttempted = false;

/**
 * Retrieves the MongoDB database instance if MONGODB_URI is provided.
 * Reuses the connection across subsequent calls.
 */
async function getDb() {
  if (db) return db;
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    if (!connectionAttempted) {
      console.log('ℹ️ MONGODB_URI not found in environment. Running in local JSON flat-file mode.');
      connectionAttempted = true;
    }
    return null;
  }

  try {
    if (!client) {
      console.log('🔌 Connecting to MongoDB database...');
      client = new MongoClient(uri);
      await client.connect();
      db = client.db();
      console.log('🍃 Successfully connected to MongoDB database!');
    }
    return db;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB. Falling back to local JSON files. Error:', error.message);
    return null;
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
  const mongoDb = await getDb();
  if (mongoDb) {
    try {
      const collection = mongoDb.collection(tableName);
      const data = await collection.find({}).toArray();

      // Auto-Migration: If MongoDB collection is empty, check if we can migrate local JSON data
      if (data.length === 0) {
        const filePath = path.join(DATA_DIR, `${tableName}.json`);
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const jsonData = JSON.parse(content || '[]');
          if (jsonData.length > 0) {
            console.log(`📦 [Auto-Migration] Seeding empty MongoDB collection '${tableName}' from local JSON file...`);
            await writeTable(tableName, jsonData);
            return [...jsonData];
          }
        } catch (jsonErr) {
          // JSON file doesn't exist or is invalid, ignore
        }
      }

      return data;
    } catch (err) {
      console.error(`❌ MongoDB read error on table '${tableName}':`, err.message);
      // Fall through to JSON file fallback if MongoDB fails
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
 * If MongoDB is connected, performs an upsert sync to insert/update modified documents
 * and delete removed documents.
 */
export async function writeTable(tableName, data) {
  // Update memory cache for JSON fallback
  dbCache[tableName] = data;

  const mongoDb = await getDb();
  if (mongoDb) {
    try {
      const collection = mongoDb.collection(tableName);

      if (data.length === 0) {
        await collection.deleteMany({});
        return;
      }

      // Synchronize in-memory array with MongoDB using bulk operations
      const bulkOps = [];
      const newIds = new Set(data.map(item => item._id));

      for (const item of data) {
        bulkOps.push({
          replaceOne: {
            filter: { _id: item._id },
            replacement: item,
            upsert: true
          }
        });
      }

      // Delete items that are no longer in the list
      bulkOps.push({
        deleteMany: {
          filter: { _id: { $nin: Array.from(newIds) } }
        }
      });

      await collection.bulkWrite(bulkOps);
      return;
    } catch (err) {
      console.error(`❌ MongoDB write error on table '${tableName}':`, err.message);
      // Fall through to JSON file write if MongoDB fails
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
