import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'smartlab',
  password: process.env.DB_PASS || 'smartlab',
  database: process.env.DB_NAME || 'smartlab',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

// Test connection on startup
pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  console.log('Database pool closed');
  process.exit(0);
});

export default pool;
