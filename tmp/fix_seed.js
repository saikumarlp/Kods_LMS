import fs from 'fs';

const path = 'd:/Bank_Application/lms-project/backend/seed.js';
let seedContent = fs.readFileSync(path, 'utf8');

const replacements = {
    // Python
    "M5ILgIgOsZI": "rfscVS0vtbw",
    "TqPqTfcO-_I": "rfscVS0vtbw",
    "Zp5MuPOtsME": "rfscVS0vtbw",
    "yC2-A2_Hk0Q": "rfscVS0vtbw",
    "WcJeOJDn2mY": "rfscVS0vtbw",
    "hYzwCsKNcOU": "rfscVS0vtbw",
    "qy1p_YyNqY4": "rfscVS0vtbw",
    "jZ_y9A1cRQA": "rfscVS0vtbw",
    "qDA2Kj4PiyQ": "rfscVS0vtbw",

    // DSA
    "njTh_OwMrdU": "8hly31xKli0",
    "I59htGqEExo": "8hly31xKli0",
    "zp6pAezg8kQ": "8hly31xKli0",
    "DBRW8nwZVks": "8hly31xKli0",

    // MERN (yU7jY3NI1jc is CSS)
    "yU7jY3NI1jc": "1Rs2ND1ryYc",

    // ML (fAcyU8jVwIE) Saving Models with Pickle
    "fAcyU8jVwIE": "i_LwzRmAUMU",

    // React
    "Y2hqTGmO-Bc": "bMknfKXIFA8",
    "IurA1kCq8O0": "bMknfKXIFA8",

    // Node/Prisma (E5K2w7hU6iU)
    "E5K2w7hU6iU": "8aGhZQkoFbQ",

    // SQL
    "fsG1XaZNigw": "HXV3zeQKqGY",
    "Z0oYxVfXbEQ": "HXV3zeQKqGY",
    "Q0P0m0wK8wQ": "HXV3zeQKqGY",

    // DevOps (v_1aB6xL-7M)
    "v_1aB6xL-7M": "hQcFE0RD0cQ",

    // UI/UX (HZ2Bw1HIEt4, 7V-eR2L_N8s, tAI1lK-t0tE, 2M34yH9n-0)
    "HZ2Bw1HIEt4": "c9Wg6Cb_YlU",
    "7V-eR2L_N8s": "c9Wg6Cb_YlU",
    "tAI1lK-t0tE": "c9Wg6Cb_YlU",
    "2M34yH9n-0": "c9Wg6Cb_YlU",

    // Behavioral
    "8PjdjaNWww0": "Tt08KmFfIYQ"
};

for (const [badId, goodId] of Object.entries(replacements)) {
    seedContent = seedContent.split(`https://www.youtube.com/embed/${badId}`).join(`https://www.youtube.com/embed/${goodId}`);
}

// Convert all full URLs in the coursesData to just IDs
seedContent = seedContent.replace(/url:\s*"https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]+)"/g, 'url: "$1"');

// Ensure the db save logic extracts ID if a full URL happens to be passed dynamically during insert
seedContent = seedContent.replace(
    /videoUrl:\s*lecData\.url,/g,
    `videoUrl: lecData.url ? (lecData.url.match(/(?:youtube\\.com\\/embed\\/|youtu\\.be\\/|\\?v=|&v=|\\/shorts\\/|^)([a-zA-Z0-9_-]{11})/) ? lecData.url.match(/(?:youtube\\.com\\/embed\\/|youtu\\.be\\/|\\?v=|&v=|\\/shorts\\/|^)([a-zA-Z0-9_-]{11})/)[1] : lecData.url) : null,`
);

fs.writeFileSync(path, seedContent, 'utf8');
console.log('Seed updated!');
