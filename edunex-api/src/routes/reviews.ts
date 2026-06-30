import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/reviews/course/:courseId
router.get('/course/:courseId', async (req: Request, res: Response) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { courseId: req.params.courseId },
      include: { user: { select: { fullName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews/course/:courseId
router.post('/course/:courseId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });

    const review = await prisma.review.upsert({
      where: { userId_courseId: { userId: req.user!.id, courseId: req.params.courseId } },
      update: { rating, comment },
      create: { userId: req.user!.id, courseId: req.params.courseId, rating, comment },
      include: { user: { select: { fullName: true, avatarUrl: true } } },
    });

    // Recalculate avg rating
    const agg = await prisma.review.aggregate({ where: { courseId: req.params.courseId }, _avg: { rating: true }, _count: true });
    await prisma.course.update({
      where: { id: req.params.courseId },
      data: { rating: agg._avg.rating || 0, ratingCount: agg._count },
    });

    res.json(review);
  } catch (e) {
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

export default router;
