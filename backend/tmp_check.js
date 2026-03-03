process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import 'dotenv/config';
import prisma from './config/prisma.js';

async function check() {
    const lecture = await prisma.lecture.findFirst();
    console.log('Sample lecture data from DB:', lecture);
    process.exit(0);
}
check();
