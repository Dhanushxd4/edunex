import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// POST /api/enrollments/:courseId - enroll
router.post('/:courseId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user!.id, courseId: req.params.courseId } },
    });
    if (existing) return res.status(409).json({ error: 'Already enrolled' });

    const enrollment = await prisma.enrollment.create({
      data: { userId: req.user!.id, courseId: req.params.courseId },
    });
    await prisma.course.update({ where: { id: req.params.courseId }, data: { studentsCount: { increment: 1 } } });
    res.status(201).json(enrollment);
  } catch (e) {
    res.status(500).json({ error: 'Enrollment failed' });
  }
});

// GET /api/enrollments/my - user's enrolled courses
router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: req.user!.id },
      include: {
        course: {
          include: { instructor: { select: { fullName: true } } },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
    res.json(enrollments);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
});

// GET /api/enrollments/:courseId/check
router.get('/:courseId/check', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user!.id, courseId: req.params.courseId } },
    });
    res.json({ enrolled: !!enrollment, enrollment });
  } catch (e) {
    res.status(500).json({ error: 'Check failed' });
  }
});

export default router;
