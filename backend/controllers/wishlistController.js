import prisma from '../config/prisma.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
    try {
        const wishlist = await prisma.wishlist.findMany({
            where: { userId: req.user.id },
            include: {
                course: {
                    include: {
                        instructor: { select: { name: true, id: true } },
                        _count: { select: { reviews: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(wishlist);
    } catch (error) {
        next(error);
    }
};

// @desc    Add course to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = async (req, res, next) => {
    try {
        const { courseId } = req.body;

        const exists = await prisma.wishlist.findUnique({
            where: {
                userId_courseId: {
                    userId: req.user.id,
                    courseId: Number(courseId)
                }
            }
        });

        if (exists) {
            res.status(400);
            throw new Error('Course already in wishlist');
        }

        const wishlistItem = await prisma.wishlist.create({
            data: {
                userId: req.user.id,
                courseId: Number(courseId)
            }
        });

        res.status(201).json(wishlistItem);
    } catch (error) {
        next(error);
    }
};

// @desc    Remove course from wishlist
// @route   DELETE /api/wishlist/:courseId
// @access  Private
export const removeFromWishlist = async (req, res, next) => {
    try {
        const courseId = Number(req.params.courseId);

        const exists = await prisma.wishlist.findUnique({
            where: {
                userId_courseId: {
                    userId: req.user.id,
                    courseId
                }
            }
        });

        if (!exists) {
            res.status(404);
            throw new Error('Course not found in wishlist');
        }

        await prisma.wishlist.delete({
            where: {
                userId_courseId: {
                    userId: req.user.id,
                    courseId
                }
            }
        });

        res.json({ message: 'Course removed from wishlist' });
    } catch (error) {
        next(error);
    }
};
