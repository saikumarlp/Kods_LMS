import fs from 'fs';
import https from 'https';

const seedFile = fs.readFileSync('d:/Bank_Application/lms-project/backend/seed.js', 'utf8');
const urls = [...seedFile.matchAll(/url:\s*"([^"]+)"/g)].map(m => m[1]);
const uniqueUrls = [...new Set(urls)];

console.log(`Checking ${uniqueUrls.length} unique URLs...`);

const checkUrl = (url) => {
    return new Promise((resolve) => {
        let videoId = url;
        const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/|\?v=|&v=|\/shorts\/|^)([a-zA-Z0-9_-]{11})/);
        if (match) videoId = match[1];

        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

        https.get(oembedUrl, (res) => {
            if (res.statusCode === 200) {
                resolve({ url, status: 'OK' });
            } else {
                resolve({ url, status: res.statusCode });
            }
        }).on('error', (e) => {
            resolve({ url, status: 'ERROR', error: e.message });
        });
    });
};

async function checkAll() {
    const results = [];
    for (const url of uniqueUrls) {
        const res = await checkUrl(url);
        if (res.status !== 'OK') {
            results.push(res);
        }
        process.stdout.write(res.status === 'OK' ? '.' : 'X');
    }
    console.log('\nBroken Links:');
    console.log(JSON.stringify(results, null, 2));
}

checkAll();
