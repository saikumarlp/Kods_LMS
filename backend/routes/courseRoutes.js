import express from 'express';
import {
    getCourses,
    getCourseById,
    getCoursePreview,
    createCourse,
    updateCourse,
    deleteCourse
} from '../controllers/courseController.js';
import { protect, instructor } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getCourses)
    .post(protect, instructor, createCourse);

router.route('/:id')
    .get(getCourseById)
    .put(protect, instructor, updateCourse)
    .delete(protect, instructor, deleteCourse);

// Public preview (strips videoUrl from locked lectures)
router.get('/:id/preview', getCoursePreview);

export default router;
