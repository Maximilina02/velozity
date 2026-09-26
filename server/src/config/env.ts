import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/velocity?schema=public',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'velocity_super_secret_access_key_998124',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'velocity_super_secret_refresh_key_384721',
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY_DAYS: parseInt(process.env.JWT_REFRESH_EXPIRY_DAYS || '7', 10),
};
