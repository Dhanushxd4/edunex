import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// POST /api/progress/lesson/:lessonId - mark lesson progress
router.post('/lesson/:lessonId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, completed, watchTimeSeconds } = req.body;
    const progress = await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId: req.user!.id, lessonId: req.params.lessonId } },
      update: { completed, watchTimeSeconds, completedAt: completed ? new Date() : null },
      create: { userId: req.user!.id, lessonId: req.params.lessonId, courseId, completed, watchTimeSeconds: watchTimeSeconds || 0 },
    });

    // Recalculate course progress
    if (courseId) {
      const [totalLessons, completedLessons] = await Promise.all([
        prisma.lesson.count({ where: { courseId } }),
        prisma.userProgress.count({ where: { userId: req.user!.id, courseId, completed: true } }),
      ]);
      const percentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      await prisma.enrollment.update({
        where: { userId_courseId: { userId: req.user!.id, courseId } },
        data: { progressPercentage: percentage, completedAt: percentage === 100 ? new Date() : null },
      });
    }

    res.json(progress);
  } catch (e) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// GET /api/progress/course/:courseId
router.get('/course/:courseId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const progress = await prisma.userProgress.findMany({
      where: { userId: req.user!.id, courseId: req.params.courseId },
    });
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: req.user!.id, courseId: req.params.courseId } },
    });
    res.json({ progress, progressPercentage: enrollment?.progressPercentage || 0 });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

export default router;
