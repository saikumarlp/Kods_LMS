import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

let connectionString = process.env.DATABASE_URL;
if (connectionString && !connectionString.includes('sslmode=require') && connectionString.includes('aivencloud.com')) {
    connectionString += (connectionString.includes('?') ? '&' : '?') + 'sslmode=require';
}
const pool = new pg.Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
