import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/courses - list with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q, category, level, is_free, page = '1', limit = '12' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { isPublished: true };
    if (q) where.OR = [{ title: { contains: q as string, mode: 'insensitive' } }, { description: { contains: q as string, mode: 'insensitive' } }];
    if (category) where.category = category as string;
    if (level) where.level = (level as string).toUpperCase();
    if (is_free === 'true') where.isFree = true;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: { instructor: { select: { id: true, fullName: true, avatarUrl: true } } },
        orderBy: { studentsCount: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.course.count({ where }),
    ]);

    res.json({ courses, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/courses/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        instructor: { select: { id: true, fullName: true, avatarUrl: true, bio: true } },
        lessons: { orderBy: { orderIndex: 'asc' } },
        reviews: {
          include: { user: { select: { fullName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        quizzes: { include: { questions: { orderBy: { orderIndex: 'asc' } } } },
      },
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// POST /api/courses (instructor/admin only)
router.post('/', authenticate, requireRole('INSTRUCTOR', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, shortDesc, thumbnailUrl, previewVideoId, category, level, price, isFree, tags } = req.body;
    const course = await prisma.course.create({
      data: {
        title, description, shortDesc, thumbnailUrl, previewVideoId,
        category, level, price: price || 0, isFree: isFree ?? true,
        tags: tags || [], instructorId: req.user!.id,
      },
    });
    res.status(201).json(course);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// PATCH /api/courses/:id
router.patch('/:id', authenticate, requireRole('INSTRUCTOR', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const course = await prisma.course.findUnique({ where: { id: req.params.id } });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.instructorId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const updated = await prisma.course.update({ where: { id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// DELETE /api/courses/:id
router.delete('/:id', authenticate, requireRole('INSTRUCTOR', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.json({ message: 'Course deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// GET /api/courses/:id/lessons
router.get('/:id/lessons', async (req: Request, res: Response) => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { courseId: req.params.id },
      orderBy: { orderIndex: 'asc' },
    });
    res.json(lessons);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
});

// POST /api/courses/:id/lessons
router.post('/:id/lessons', authenticate, requireRole('INSTRUCTOR', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, videoId, durationSeconds, orderIndex, isPreview } = req.body;
    const lesson = await prisma.lesson.create({
      data: { courseId: req.params.id, title, description, videoId, durationSeconds: durationSeconds || 0, orderIndex, isPreview: isPreview || false },
    });
    // Update lesson count
    await prisma.course.update({ where: { id: req.params.id }, data: { lessonsCount: { increment: 1 } } });
    res.status(201).json(lesson);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

export default router;
