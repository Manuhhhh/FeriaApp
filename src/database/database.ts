import type { Database } from '../types/database';
import { Kysely, PostgresDialect } from 'kysely'; 
import Pool from 'pg-pool';

const dbName = process.env.DB_NAME || 'postgres';
const host = process.env.DB_HOST || 'localhost';
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || 'admin';
const port = parseInt(process.env.DB_PORT ?? "5432");

const dialect = new PostgresDialect({
    pool: new Pool({
        database: dbName,
        host: host,
        user: user,
        password: password,
        port: port,
        max: 10,
    })
})

export const db = new Kysely<Database>({
    dialect,
})