import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';
import {
    getWishlist,
    addToWishlist,
    removeFromWishlist
} from '../controllers/wishlistController.js';

const router = express.Router();

router.route('/')
    .get(protect, getWishlist)
    .post(protect, addToWishlist);

router.route('/:courseId')
    .delete(protect, removeFromWishlist);

export default router;
