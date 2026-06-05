import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const cwd = process.cwd();
const baseEnvPath = path.resolve(cwd, '.env');
const localEnvPath = path.resolve(cwd, '.env.local');

if (fs.existsSync(baseEnvPath)) {
  dotenv.config({ path: baseEnvPath });
}

if (process.env.NODE_ENV !== 'production' && fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath, override: true });
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Create server/.env.local for local development.');
}

let databaseHost = '';
try {
  databaseHost = new URL(databaseUrl).hostname;
} catch {
  throw new Error('DATABASE_URL is not a valid URL.');
}

const usesNeon = databaseHost.endsWith('.neon.tech') || databaseHost.includes('.neon.tech');
const allowRemoteDb = process.env.ALLOW_REMOTE_DB === 'true';

if (process.env.NODE_ENV !== 'production' && usesNeon && !allowRemoteDb) {
  throw new Error(
    [
      `Refusing to start development server against remote Neon DB (${databaseHost}).`,
      'Create server/.env.local with a local/test DATABASE_URL, or set ALLOW_REMOTE_DB=true if you intentionally want to use Neon.',
    ].join(' ')
  );
}

