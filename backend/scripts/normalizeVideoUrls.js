/**
 * Migration: Normalize all existing lecture videoUrls to embed format.
 * Run: node --env-file=.env scripts/normalizeVideoUrls.js
 */

import pg from 'pg';

// ── YouTube URL normalizer (inline copy for standalone use) ──
function extractYouTubeId(url) {
    if (!url || typeof url !== 'string') return null;
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return watchMatch[1];
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
    return null;
}

function normalizeYouTubeUrl(url) {
    const id = extractYouTubeId(url);
    if (!id) return null;
    return `https://www.youtube.com/embed/${id}`;
}

const rawUrl = process.env.DATABASE_URL || '';
// Strip ?sslmode=... so pg doesn't override our ssl object
const connectionString = rawUrl.replace(/[?&]sslmode=[^&]*/g, '');

const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function main() {
    const client = await pool.connect();
    try {
        console.log('🔄 Fetching all lectures...');
        const { rows } = await client.query('SELECT id, title, "videoUrl" FROM "Lecture"');
        console.log(`Found ${rows.length} lectures. Normalizing URLs...\n`);

        let updated = 0, skipped = 0, invalid = 0;

        for (const lecture of rows) {
            if (!lecture.videoUrl) {
                console.log(`⬛ [${lecture.id}] "${lecture.title}" — no URL, skipping`);
                skipped++;
                continue;
            }

            const normalized = normalizeYouTubeUrl(lecture.videoUrl);

            if (!normalized) {
                console.warn(`❌ [${lecture.id}] "${lecture.title}" — invalid URL: ${lecture.videoUrl}`);
                invalid++;
                continue;
            }

            if (normalized === lecture.videoUrl) {
                console.log(`✅ [${lecture.id}] "${lecture.title}" — already correct`);
                skipped++;
                continue;
            }

            await client.query('UPDATE "Lecture" SET "videoUrl" = $1 WHERE id = $2', [normalized, lecture.id]);
            console.log(`🔧 [${lecture.id}] "${lecture.title}"\n   ${lecture.videoUrl} → ${normalized}`);
            updated++;
        }

        console.log(`\n📊 Done! Updated: ${updated}, Already correct/skipped: ${skipped}, Invalid: ${invalid}`);
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(e => { console.error(e); process.exit(1); });
