import express from 'express';
import {
    createReview,
    getCourseReviews
} from '../controllers/reviewController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/course/:courseId', getCourseReviews);

export default router;
