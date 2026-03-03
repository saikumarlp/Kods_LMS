import express from 'express';
import {
    createSection,
    deleteSection,
    createLecture,
    updateLecture,
    deleteLecture
} from '../controllers/contentController.js';
import { protect, instructor } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Section Routes
router.post('/courses/:courseId/sections', protect, instructor, createSection);
router.delete('/sections/:sectionId', protect, instructor, deleteSection);

// Lecture Routes
router.post('/sections/:sectionId/lectures', protect, instructor, createLecture);
router.route('/lectures/:lectureId')
    .put(protect, instructor, updateLecture)
    .delete(protect, instructor, deleteLecture);

export default router;
