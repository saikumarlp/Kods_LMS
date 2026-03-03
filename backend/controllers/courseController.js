import prisma from '../config/prisma.js';

// @desc    Get all courses (with optional search and pagination)
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12; // default to 12
        const skip = (page - 1) * limit;

        const search = req.query.search || '';
        const category = req.query.category || '';
        const level = req.query.level || '';
        const price = req.query.price || ''; // 'free' or 'paid'
        const minRating = Number(req.query.rating) || 0;
        const sort = req.query.sort || 'newest'; // popular, highest-rated, newest

        // Build Where Clause dynamically using AND array to avoid OR collisions
        const whereClause = { AND: [] };

        if (search) {
            whereClause.AND.push({
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } }
                ]
            });
        }
        if (category) {
            whereClause.AND.push({ category });
        }
        if (level) {
            whereClause.AND.push({ level });
        }
        if (price === 'free') {
            whereClause.AND.push({ price: { equals: 0 } });
        } else if (price === 'paid') {
            whereClause.AND.push({ price: { gt: 0 } });
        } else if (price === '0-500') {
            whereClause.AND.push({
                OR: [
                    { discountPrice: { lte: 500 } },
                    { discountPrice: null, price: { lte: 500 } }
                ]
            });
        } else if (price === '500-1500') {
            whereClause.AND.push({
                OR: [
                    { discountPrice: { gt: 500, lte: 1500 } },
                    { discountPrice: null, price: { gt: 500, lte: 1500 } }
                ]
            });
        } else if (price === '1500+') {
            whereClause.AND.push({
                OR: [
                    { discountPrice: { gt: 1500 } },
                    { discountPrice: null, price: { gt: 1500 } }
                ]
            });
        }
        if (minRating > 0) {
            whereClause.AND.push({ averageRating: { gte: minRating } });
        }

        if (whereClause.AND.length === 0) {
            delete whereClause.AND;
        }

        // Determine Ordering
        let orderByClause = { createdAt: 'desc' }; // default newest
        if (sort === 'popular') {
            orderByClause = { enrollments: { _count: 'desc' } };
        } else if (sort === 'highest-rated') {
            orderByClause = { averageRating: 'desc' };
        }

        const totalCourses = await prisma.course.count({ where: whereClause });

        const courses = await prisma.course.findMany({
            where: whereClause,
            skip,
            take: limit,
            include: {
                instructor: {
                    select: { name: true, id: true }
                },
                _count: {
                    select: { enrollments: true, reviews: true }
                }
            },
            orderBy: orderByClause
        });

        res.json({
            courses,
            page,
            pages: Math.ceil(totalCourses / limit),
            total: totalCourses
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Public
export const getCourseById = async (req, res, next) => {
    try {
        const courseId = parseInt(req.params.id, 10);
        console.log('Incoming course ID:', req.params.id, 'Parsed:', courseId);

        if (isNaN(courseId)) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                instructor: {
                    select: { name: true, id: true }
                },
                sections: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        lectures: {
                            orderBy: { orderIndex: 'asc' }
                        }
                    }
                },
                reviews: {
                    include: {
                        user: { select: { name: true } }
                    }
                }
            }
        });

        console.log('Result from database:', course ? 'Course found' : 'Not found');

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        return res.json(course);
    } catch (error) {
        console.error('Server error fetching course details:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get course preview (public) - strips videoUrl from non-preview lectures
// @route   GET /api/courses/:id/preview
// @access  Public
export const getCoursePreview = async (req, res, next) => {
    try {
        const courseId = parseInt(req.params.id, 10);
        if (isNaN(courseId)) return res.status(400).json({ message: 'Invalid course ID' });

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                instructor: { select: { name: true, id: true } },
                sections: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        lectures: {
                            orderBy: { orderIndex: 'asc' }
                        }
                    }
                },
                reviews: {
                    include: { user: { select: { name: true } } }
                },
                _count: { select: { enrollments: true } }
            }
        });

        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Strip videoUrl from locked lectures to prevent direct access
        const sanitized = {
            ...course,
            sections: course.sections.map(section => ({
                ...section,
                lectures: section.lectures.map(lecture => ({
                    ...lecture,
                    videoUrl: lecture.isPreview ? lecture.videoUrl : null // hide url if not preview
                }))
            }))
        };

        return res.json(sanitized);
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Instructor
export const createCourse = async (req, res, next) => {
    try {
        const { title, description, price, discountPrice, thumbnail, category, level, totalDuration } = req.body;

        const course = await prisma.course.create({
            data: {
                title,
                description,
                price: Number(price),
                discountPrice: discountPrice ? Number(discountPrice) : null,
                thumbnail,
                category,
                level,
                totalDuration: totalDuration ? Number(totalDuration) : 0,
                instructorId: req.user.id
            }
        });

        res.status(201).json(course);
    } catch (error) {
        next(error);
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
export const updateCourse = async (req, res, next) => {
    try {
        const { title, description, price, discountPrice, thumbnail, category, level, totalDuration } = req.body;

        let course = await prisma.course.findUnique({
            where: { id: Number(req.params.id) }
        });

        if (!course) {
            res.status(404);
            throw new Error('Course not found');
        }

        // Check if user is the instructor of the course or an admin
        if (course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
            res.status(403);
            throw new Error('Not authorized to update this course');
        }

        const updatedCourse = await prisma.course.update({
            where: { id: Number(req.params.id) },
            data: {
                title,
                description,
                price: price !== undefined ? Number(price) : course.price,
                discountPrice: discountPrice !== undefined ? (discountPrice ? Number(discountPrice) : null) : course.discountPrice,
                thumbnail,
                category: category !== undefined ? category : course.category,
                level: level !== undefined ? level : course.level,
                totalDuration: totalDuration !== undefined ? Number(totalDuration) : course.totalDuration
            }
        });

        res.json(updatedCourse);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor
export const deleteCourse = async (req, res, next) => {
    try {
        const course = await prisma.course.findUnique({
            where: { id: Number(req.params.id) }
        });

        if (!course) {
            res.status(404);
            throw new Error('Course not found');
        }

        // Check if user is the instructor of the course or an admin
        if (course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
            res.status(403);
            throw new Error('Not authorized to delete this course');
        }

        await prisma.course.delete({
            where: { id: Number(req.params.id) }
        });

        res.json({ message: 'Course removed' });
    } catch (error) {
        next(error);
    }
};
