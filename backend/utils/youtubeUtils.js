/**
 * Extracts the YouTube video ID from any supported URL format:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *   - https://youtube.com/shorts/VIDEO_ID
 * 
 * Returns null if no valid ID found.
 */
export function extractYouTubeId(url) {
    if (!url || typeof url !== 'string') return null;

    // Already an embed URL — extract id from path
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];

    // Shorts
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];

    // youtu.be/ID
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];

    // watch?v=ID or ?v=ID
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return watchMatch[1];

    // Raw 11-char video ID with no URL
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();

    return null;
}

/**
 * Converts any YouTube URL or video ID into just the 11-character video ID.
 * Returns null if input is invalid.
 * 
 * @param {string} url - any YouTube URL or video ID
 * @returns {string|null} - 11-character video ID
 */
export function normalizeYouTubeUrl(url) {
    return extractYouTubeId(url);
}
