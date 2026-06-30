import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/quizzes/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: { questions: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
});

// POST /api/quizzes/:id/submit
router.post('/:id/submit', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { answers } = req.body; // { questionId: selectedIndex }
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: { questions: true },
    });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    let correct = 0;
    const results = quiz.questions.map(q => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctIndex;
      if (isCorrect) correct++;
      return { questionId: q.id, correct: isCorrect, correctIndex: q.correctIndex, explanation: q.explanation };
    });

    const score = (correct / quiz.questions.length) * 100;
    const passed = score >= quiz.passingScore;

    const attempt = await prisma.quizAttempt.create({
      data: { userId: req.user!.id, quizId: quiz.id, score, passed, answers },
    });

    res.json({ score, passed, correct, total: quiz.questions.length, results, attempt });
  } catch (e) {
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// POST /api/quizzes (create quiz - instructor/admin)
router.post('/', authenticate, requireRole('INSTRUCTOR', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, lessonId, title, passingScore, questions } = req.body;
    const quiz = await prisma.quiz.create({
      data: {
        courseId, lessonId, title, passingScore: passingScore || 70,
        questions: {
          create: questions.map((q: any, i: number) => ({
            question: q.question, options: q.options, correctIndex: q.correctIndex,
            explanation: q.explanation || '', orderIndex: i,
          })),
        },
      },
      include: { questions: true },
    });
    res.status(201).json(quiz);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// GET /api/quizzes/:id/attempts (user's attempts)
router.get('/:id/attempts', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: req.params.id, userId: req.user!.id },
      orderBy: { completedAt: 'desc' },
    });
    res.json(attempts);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

export default router;
