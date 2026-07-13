import { DataSource } from 'typeorm';
import path from 'path';

const isProduction = process.env.NODE_ENV === 'production';
const ext = isProduction ? 'js' : 'ts';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'instagram_clone',
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  entities: [path.join(__dirname, `../models/**/*.${ext}`)],
  migrations: [path.join(__dirname, `../../database/migrations/**/*.${ext}`)],
  subscribers: [],
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});
