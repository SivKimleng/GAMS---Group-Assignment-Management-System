import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';

const sslEnabled = process.env.DB_SSL === 'true';
const caPath = process.env.DB_SSL_CA_PATH;

const sslConfig = sslEnabled
  ? {
      rejectUnauthorized: true,
      ...(caPath
        ? { ca: fs.readFileSync(path.resolve(caPath), 'utf8') }
        : {})
    }
  : false;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,

    dialectOptions: sslEnabled
      ? {
          ssl: sslConfig,
        }
      : {},
  }
);

export default sequelize;