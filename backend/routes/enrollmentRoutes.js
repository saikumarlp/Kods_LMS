import express from 'express';
import {
    enrollInCourse,
    getMyEnrollments,
    updateVideoProgress
} from '../controllers/enrollmentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, enrollInCourse)
    .get(protect, getMyEnrollments);

router.put('/progress', protect, updateVideoProgress);

export default router;
