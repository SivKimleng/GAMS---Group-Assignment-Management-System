import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

const sslEnabled = process.env.DB_SSL === 'true';
const caPath = process.env.DB_SSL_CA_PATH;

const sslConfig = sslEnabled
  ? {
      rejectUnauthorized: true,
      ...(caPath ? { ca: fs.readFileSync(path.resolve(caPath), 'utf8') } : {})
    }
  : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number.parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslConfig
});

export default pool;
