/**
 * Migration: Store only 11-character video IDs and replace unavailable videos.
 * Run: node --env-file=.env scripts/fixUnavailableVideos.js
 */
import pg from 'pg';

// Known safe 11-character IDs from requested channels
const safeFallbacks = [
    'pkYVOmU3MgA', // freeCodeCamp (Python)
    '8ext9G7xspg', // freeCodeCamp (React)
    'rfscVS0vtbw', // freeCodeCamp (Python for Beginners)
    'NWONe5fB3E0', // Mosh (SQL)
    'W6NZfCO5SIk', // Mosh (JavaScript)
    'NUXdtN1W1FE', // Mosh (Machine Learning)
    'c9Wg6Cb_YlU', // DesignCourse (UI/UX)
    'K2qAo1R_VNE', // DesignCourse (Figma)
    'tAI1lK-t0tE'  // Figma Official (Prototyping)
];

function extractYouTubeId(url) {
    if (!url || typeof url !== 'string') return null;
    const embedMatch = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|\?v=|&v=|\/shorts\/|^)([a-zA-Z0-9_-]{11})/);
    return embedMatch ? embedMatch[1] : null;
}

// Checks if a video is publicly available & embeddable using YouTube's oEmbed API
async function isVideoAvailable(id) {
    try {
        const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
        return res.ok;
    } catch {
        return false;
    }
}

const rawUrl = (process.env.DATABASE_URL || '').replace(/[?&]sslmode=[^&]*/g, '');
const pool = new pg.Pool({ connectionString: rawUrl, ssl: { rejectUnauthorized: false } });

async function main() {
    const client = await pool.connect();
    try {
        console.log('🔄 Fetching all lectures from database...');
        const { rows } = await client.query('SELECT id, title, "videoUrl" FROM "Lecture"');
        console.log(`Found ${rows.length} lectures. Verifying availability and storing only IDs...\n`);

        let updated = 0, replaced = 0, invalidFound = 0;
        let fallbackIndex = 0;

        for (const lecture of rows) {
            let id = extractYouTubeId(lecture.videoUrl);

            // If ID extraction failed, or video is not available/embeddable
            let needsReplacement = false;

            if (!id) {
                needsReplacement = true;
                invalidFound++;
            } else {
                const available = await isVideoAvailable(id);
                if (!available) {
                    needsReplacement = true;
                    invalidFound++;
                }
            }

            if (needsReplacement) {
                // Pick a safe fallback
                id = safeFallbacks[fallbackIndex % safeFallbacks.length];
                fallbackIndex++;
                replaced++;
                console.log(`❌ [Unavailable] "${lecture.title}" -> Replaced with safe fallback ID: ${id}`);
            }

            // Update to store ONLY the ID (even if it was already valid, it might have been a full URL previously)
            if (lecture.videoUrl !== id) {
                await client.query('UPDATE "Lecture" SET "videoUrl" = $1 WHERE id = $2', [id, lecture.id]);
                if (!needsReplacement) {
                    console.log(`✅ [Normalized] "${lecture.title}" -> Stored as ID: ${id}`);
                }
                updated++;
            } else {
                // Already stored as exactly the 11-char ID and is available
                // console.log(`⏩ [Skipped] "${lecture.title}" -> Already valid ID: ${id}`);
            }
        }

        console.log(`\n📊 Done! Total Fixed/Replaced: ${replaced}`);
        console.log(`📊 Total records updated to store only IDs: ${updated}`);
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(e => { console.error(e); process.exit(1); });
