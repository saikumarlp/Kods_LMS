import prisma from '../config/prisma.js';
import { normalizeYouTubeUrl } from '../utils/youtubeUtils.js';

// --- SECTIONS ---

// @desc    Create a section
// @route   POST /api/courses/:courseId/sections
// @access  Private/Instructor
export const createSection = async (req, res, next) => {
    try {
        const courseId = Number(req.params.courseId);
        const { title } = req.body;

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) {
            res.status(404);
            throw new Error('Course not found');
        }

        if (course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
            res.status(403);
            throw new Error('Not authorized');
        }

        const lastSection = await prisma.section.findFirst({
            where: { courseId },
            orderBy: { orderIndex: 'desc' }
        });

        const newOrderIndex = lastSection ? lastSection.orderIndex + 1 : 1;

        const section = await prisma.section.create({
            data: {
                title,
                courseId,
                orderIndex: newOrderIndex
            }
        });

        res.status(201).json(section);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a section
// @route   DELETE /api/sections/:sectionId
// @access  Private/Instructor
export const deleteSection = async (req, res, next) => {
    try {
        const sectionId = Number(req.params.sectionId);

        const section = await prisma.section.findUnique({
            where: { id: sectionId },
            include: { course: true }
        });

        if (!section) {
            res.status(404);
            throw new Error('Section not found');
        }

        if (section.course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
            res.status(403);
            throw new Error('Not authorized');
        }

        await prisma.section.delete({
            where: { id: sectionId }
        });

        res.json({ message: 'Section removed' });
    } catch (error) {
        next(error);
    }
};

// --- LECTURES ---

// @desc    Create a lecture in a section
// @route   POST /api/sections/:sectionId/lectures
// @access  Private/Instructor
export const createLecture = async (req, res, next) => {
    try {
        const sectionId = Number(req.params.sectionId);
        const { title, videoUrl, duration, isPreview } = req.body;

        const section = await prisma.section.findUnique({
            where: { id: sectionId },
            include: { course: true }
        });

        if (!section) {
            res.status(404);
            throw new Error('Section not found');
        }

        if (section.course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
            res.status(403);
            throw new Error('Not authorized');
        }

        const lastLecture = await prisma.lecture.findFirst({
            where: { sectionId },
            orderBy: { orderIndex: 'desc' }
        });

        const newOrderIndex = lastLecture ? lastLecture.orderIndex + 1 : 1;
        // Auto-preview first lecture of first section if not explicitly set
        const autoPreview = isPreview !== undefined ? Boolean(isPreview) : (newOrderIndex === 1);

        // Normalize YouTube URL to embed format
        let normalizedVideoUrl = null;
        if (videoUrl) {
            normalizedVideoUrl = normalizeYouTubeUrl(videoUrl);
            if (!normalizedVideoUrl) {
                res.status(400);
                throw new Error('Invalid YouTube URL. Please provide a valid YouTube video link.');
            }
        }

        const lecture = await prisma.lecture.create({
            data: {
                title,
                videoUrl: normalizedVideoUrl,
                duration: duration ? Number(duration) : 0,
                sectionId,
                orderIndex: newOrderIndex,
                isPreview: autoPreview
            }
        });

        res.status(201).json(lecture);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a lecture (e.g. upload video)
// @route   PUT /api/lectures/:lectureId
// @access  Private/Instructor
export const updateLecture = async (req, res, next) => {
    try {
        const lectureId = Number(req.params.lectureId);
        const { title, videoUrl, duration, isPreview } = req.body;

        const lecture = await prisma.lecture.findUnique({
            where: { id: lectureId },
            include: {
                section: { include: { course: true } }
            }
        });

        if (!lecture) {
            res.status(404);
            throw new Error('Lecture not found');
        }

        if (lecture.section.course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
            res.status(403);
            throw new Error('Not authorized');
        }

        const updatedLecture = await prisma.lecture.update({
            where: { id: lectureId },
            data: {
                title: title || lecture.title,
                videoUrl: (() => {
                    if (videoUrl === undefined) return lecture.videoUrl;
                    if (!videoUrl) return null;
                    const normalized = normalizeYouTubeUrl(videoUrl);
                    if (!normalized) throw Object.assign(new Error('Invalid YouTube URL.'), { status: 400 });
                    return normalized;
                })(),
                duration: duration !== undefined ? Number(duration) : lecture.duration,
                isPreview: isPreview !== undefined ? Boolean(isPreview) : lecture.isPreview
            }
        });

        res.json(updatedLecture);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a lecture
// @route   DELETE /api/lectures/:lectureId
// @access  Private/Instructor
export const deleteLecture = async (req, res, next) => {
    try {
        const lectureId = Number(req.params.lectureId);

        const lecture = await prisma.lecture.findUnique({
            where: { id: lectureId },
            include: {
                section: { include: { course: true } }
            }
        });

        if (!lecture) {
            res.status(404);
            throw new Error('Lecture not found');
        }

        if (lecture.section.course.instructorId !== req.user.id && req.user.role !== 'ADMIN') {
            res.status(403);
            throw new Error('Not authorized');
        }

        await prisma.lecture.delete({
            where: { id: lectureId }
        });

        res.json({ message: 'Lecture removed' });
    } catch (error) {
        next(error);
    }
};
