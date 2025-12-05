import { createPool } from "mysql2/promise";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('../infra/.env') });
export const db = createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT || 3306,
    connectionLimit: process.env.DATABASE_CONNECTION_LIMIT || 10
});