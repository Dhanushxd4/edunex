import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/users/:id/profile (public)
router.get('/:id/profile', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, fullName: true, avatarUrl: true, bio: true, role: true, createdAt: true,
        instructorCourses: { where: { isPublished: true }, select: { id: true, title: true, thumbnailUrl: true, rating: true, studentsCount: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// GET /api/users/dashboard (authenticated)
router.get('/dashboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [enrollments, attempts] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: req.user!.id },
        include: { course: { select: { id: true, title: true, thumbnailUrl: true, lessonsCount: true } } },
      }),
      prisma.quizAttempt.findMany({
        where: { userId: req.user!.id },
        include: { quiz: { select: { title: true, courseId: true } } },
        orderBy: { completedAt: 'desc' },
        take: 5,
      }),
    ]);
    res.json({ enrollments, recentQuizAttempts: attempts });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

export default router;
