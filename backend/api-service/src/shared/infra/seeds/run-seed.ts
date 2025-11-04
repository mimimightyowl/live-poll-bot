import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
