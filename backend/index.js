process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

dotenv.config();

const app = express();

// Middlewares
// Allow: localhost (dev) + any Vercel preview/production domain
const allowedOriginPattern = /^https:\/\/[\w-]+(\.vercel\.app)$/;
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // allow server-to-server / curl
        if (allowedOrigins.includes(origin) || allowedOriginPattern.test(origin)) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api', contentRoutes); // Uses /api/courses/:courseId/sections etc
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
