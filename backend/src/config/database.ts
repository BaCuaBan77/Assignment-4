import { Pool } from 'pg';
import { createClient } from 'redis';

// PostgreSQL connection pool
export const pgPool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'sensordb',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test PostgreSQL connection
pgPool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pgPool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Redis client
export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// Connect to Redis
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('✅ Redis client connected');
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
  }
};

