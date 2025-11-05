import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { env } from '../../env';

const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

async function runSeed() {
  try {
    const seedFile = path.join(__dirname, 'dev-seed.sql');
    const seedSQL = fs.readFileSync(seedFile, 'utf8');

    await pool.query(seedSQL);
    console.log('✅ Dev seed data loaded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error loading seed data:', (error as Error).message);
    process.exit(1);
  }
}

runSeed();
