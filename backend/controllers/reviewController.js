import prisma from '../config/prisma.js';

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private/Student
export const createReview = async (req, res, next) => {
    try {
        const { courseId, rating, comment } = req.body;

        // Check enrollment
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId: req.user.id, courseId: Number(courseId) }
            }
        });

        if (!enrollment) {
            res.status(403);
            throw new Error('You must be enrolled to review this course');
        }

        const existingReview = await prisma.review.findUnique({
            where: {
                userId_courseId: { userId: req.user.id, courseId: Number(courseId) }
            }
        });

        if (existingReview) {
            res.status(400);
            throw new Error('Course already reviewed');
        }

        const review = await prisma.review.create({
            data: {
                rating: Number(rating),
                comment,
                userId: req.user.id,
                courseId: Number(courseId)
            }
        });

        // Update course average rating
        const allReviews = await prisma.review.findMany({
            where: { courseId: Number(courseId) }
        });

        const numReviews = allReviews.length;
        const totalRating = allReviews.reduce((acc, item) => item.rating + acc, 0);
        const averageRating = totalRating / numReviews;

        await prisma.course.update({
            where: { id: Number(courseId) },
            data: { averageRating }
        });

        res.status(201).json({ message: 'Review added', review });
    } catch (error) {
        next(error);
    }
};

// @desc    Get course reviews
// @route   GET /api/reviews/course/:courseId
// @access  Public
export const getCourseReviews = async (req, res, next) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { courseId: Number(req.params.courseId) },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json(reviews);
    } catch (error) {
        next(error);
    }
};
