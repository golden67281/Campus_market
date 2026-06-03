import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow setting a persistent directory (e.g., Render Persistent Disk) to preserve database JSON files
const DATA_DIR = process.env.PERSISTENT_DATA_DIR || path.join(__dirname, '..', 'data');

// Queue/chain for sequential writes to avoid race conditions
const writeQueue = {};

// In-memory cache for tables: tableName -> array of records
const dbCache = {};

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

/**
 * Reads data from a table JSON file, utilizing the in-memory cache if available.
 * Serves in O(1) time complexity for subsequent reads.
 */
export async function readTable(tableName) {
  // Return cached copy if available
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
 * Writes data to memory cache first, then chains sequential background filesystem operations
 * ensuring no race conditions or corrupted JSON files.
 */
export async function writeTable(tableName, data) {
  // Update memory cache instantly
  dbCache[tableName] = data;

  const filePath = path.join(DATA_DIR, `${tableName}.json`);
  await ensureDir(DATA_DIR);

  // If there's already an active write chain for this file, append to it
  if (!writeQueue[tableName]) {
    writeQueue[tableName] = Promise.resolve();
  }

  const writeOperation = writeQueue[tableName].then(async () => {
    const tempPath = `${filePath}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(tempPath, filePath);
  });

  writeQueue[tableName] = writeOperation;
  // Await the write operation so client is guaranteed durability before response returns
  await writeOperation;
}

// Helper to generate custom human-readable ID
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}
