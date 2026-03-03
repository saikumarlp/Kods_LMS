import pg from 'pg';

const rawUrl = (process.env.DATABASE_URL || '').replace(/[?&]sslmode=[^&]*/g, '');
const pool = new pg.Pool({ connectionString: rawUrl, ssl: { rejectUnauthorized: false } });

// Fix lecture 92 - replace broken 10-char ID with a valid UX testing tutorial
const fixedUrl = 'https://www.youtube.com/embed/jV1vkHv4zq8'; // UX testing walkthrough

const client = await pool.connect();
await client.query('UPDATE "Lecture" SET "videoUrl" = $1 WHERE id = 92', [fixedUrl]);
console.log('✅ Fixed lecture 92 videoUrl →', fixedUrl);
client.release();
await pool.end();
