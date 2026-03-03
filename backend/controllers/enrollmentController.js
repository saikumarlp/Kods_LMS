import prisma from '../config/prisma.js';

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private/Student
export const enrollInCourse = async (req, res, next) => {
    try {
        const { courseId } = req.body;

        const course = await prisma.course.findUnique({
            where: { id: Number(courseId) },
            include: { sections: { include: { lectures: true } } }
        });

        if (!course) {
            res.status(404);
            throw new Error('Course not found');
        }

        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId: req.user.id, courseId: Number(courseId) }
            }
        });

        if (existingEnrollment) {
            res.status(400);
            throw new Error('Already enrolled in this course');
        }

        const enrollment = await prisma.enrollment.create({
            data: {
                userId: req.user.id,
                courseId: Number(courseId),
                progressPercent: 0.0
            }
        });

        const videoProgressData = [];
        course.sections.forEach(section => {
            section.lectures.forEach(lecture => {
                videoProgressData.push({
                    enrollmentId: enrollment.id,
                    lectureId: lecture.id,
                    isCompleted: false,
                    lastWatchedTimestamp: 0
                });
            });
        });

        if (videoProgressData.length > 0) {
            await prisma.videoProgress.createMany({
                data: videoProgressData
            });
        }

        res.status(201).json(enrollment);
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's enrollments (My Learning)
// @route   GET /api/enrollments
// @access  Private
export const getMyEnrollments = async (req, res, next) => {
    try {
        const enrollments = await prisma.enrollment.findMany({
            where: { userId: req.user.id },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        thumbnail: true,
                        instructor: { select: { name: true } }
                    }
                },
                videoProgress: true
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.json({ enrollments });
    } catch (error) {
        next(error);
    }
};

// @desc    Update video progress (timestamp & completion)
// @route   PUT /api/enrollments/progress
// @access  Private
export const updateVideoProgress = async (req, res, next) => {
    try {
        const { courseId, lectureId, lastWatchedTimestamp, isCompleted } = req.body;

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId: req.user.id, courseId: Number(courseId) }
            },
            include: { course: { include: { sections: { include: { lectures: true } } } } }
        });

        if (!enrollment) {
            res.status(404);
            throw new Error('Enrollment not found');
        }

        const videoProgress = await prisma.videoProgress.findUnique({
            where: {
                enrollmentId_lectureId: {
                    enrollmentId: enrollment.id,
                    lectureId: Number(lectureId)
                }
            }
        });

        if (!videoProgress) {
            res.status(404);
            throw new Error('Video progress record not found');
        }

        await prisma.videoProgress.update({
            where: { id: videoProgress.id },
            data: {
                lastWatchedTimestamp: lastWatchedTimestamp !== undefined ? Number(lastWatchedTimestamp) : videoProgress.lastWatchedTimestamp,
                isCompleted: isCompleted !== undefined ? Boolean(isCompleted) : videoProgress.isCompleted
            }
        });

        // Calculate total progress %
        const allProgress = await prisma.videoProgress.findMany({
            where: { enrollmentId: enrollment.id }
        });

        const totalLectures = allProgress.length;
        const completedLectures = allProgress.filter(p => p.isCompleted).length;
        const progressPercent = totalLectures === 0 ? 0 : (completedLectures / totalLectures) * 100;

        await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { progressPercent }
        });

        res.json({ message: 'Progress updated', progressPercent });
    } catch (error) {
        next(error);
    }
};
