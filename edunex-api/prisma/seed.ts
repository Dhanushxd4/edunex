import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create instructor
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@edunex.com' },
    update: {},
    create: {
      email: 'instructor@edunex.com',
      password: await bcrypt.hash('password123', 12),
      fullName: 'Alex Morgan',
      role: 'INSTRUCTOR',
      bio: 'Senior Software Engineer with 10+ years experience. Passionate about teaching web development.',
    },
  });

  // Create courses
  const courses = [
    {
      title: 'Complete React & Next.js Bootcamp',
      description: 'Master React 18 and Next.js 14 from scratch. Build real-world projects including a full-stack LMS, e-commerce platform, and more.',
      category: 'Web Development',
      level: 'BEGINNER' as const,
      isFree: true,
      previewVideoId: 'dGcsHjM78Hk',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      tags: ['React', 'Next.js', 'TypeScript', 'JavaScript'],
      durationHours: 40,
      isPublished: true,
    },
    {
      title: 'Python for Data Science & Machine Learning',
      description: 'Learn Python programming, NumPy, Pandas, Matplotlib, Scikit-learn and TensorFlow. Build end-to-end ML models.',
      category: 'Data Science',
      level: 'INTERMEDIATE' as const,
      isFree: false,
      price: 49.99,
      previewVideoId: 'LHBE6MKrjvw',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800',
      tags: ['Python', 'Machine Learning', 'Data Science', 'TensorFlow'],
      durationHours: 55,
      isPublished: true,
    },
    {
      title: 'UI/UX Design Masterclass',
      description: 'Learn Figma, design principles, user research, prototyping, and design systems. Go from zero to professional designer.',
      category: 'Design',
      level: 'BEGINNER' as const,
      isFree: true,
      previewVideoId: 'WIljVl-bcFQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      tags: ['Figma', 'UI Design', 'UX Design', 'Prototyping'],
      durationHours: 28,
      isPublished: true,
    },
    {
      title: 'Node.js & Express REST API Development',
      description: 'Build scalable REST APIs with Node.js, Express, PostgreSQL and Prisma. Deploy to Railway and Vercel.',
      category: 'Web Development',
      level: 'INTERMEDIATE' as const,
      isFree: false,
      price: 39.99,
      previewVideoId: 'Oe421EPjeBE',
      thumbnailUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
      tags: ['Node.js', 'Express', 'REST API', 'PostgreSQL'],
      durationHours: 32,
      isPublished: true,
    },
    {
      title: 'Digital Marketing & SEO Fundamentals',
      description: 'Master SEO, Google Ads, social media marketing, email marketing, and analytics. Grow any business online.',
      category: 'Marketing',
      level: 'BEGINNER' as const,
      isFree: true,
      previewVideoId: 'BvFoAFoiMuI',
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
      tags: ['SEO', 'Google Ads', 'Social Media', 'Analytics'],
      durationHours: 22,
      isPublished: true,
    },
    {
      title: 'Advanced TypeScript for React Developers',
      description: 'Deep dive into TypeScript generics, utility types, decorators and advanced patterns for large-scale React apps.',
      category: 'Web Development',
      level: 'ADVANCED' as const,
      isFree: false,
      price: 59.99,
      previewVideoId: '30LWjhZzg50',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
      tags: ['TypeScript', 'React', 'Advanced', 'Patterns'],
      durationHours: 18,
      isPublished: true,
    },
  ];

  for (const courseData of courses) {
    const course = await prisma.course.create({
      data: { ...courseData, instructorId: instructor.id, studentsCount: Math.floor(Math.random() * 5000), rating: 4.5 + Math.random() * 0.4, ratingCount: Math.floor(Math.random() * 500) + 50, lessonsCount: Math.floor(Math.random() * 30) + 10 },
    });

    // Add sample lessons
    const lessonTitles = ['Introduction & Setup', 'Core Concepts', 'Hands-on Project', 'Advanced Techniques', 'Best Practices', 'Deployment & Beyond'];
    for (let i = 0; i < lessonTitles.length; i++) {
      await prisma.lesson.create({
        data: { courseId: course.id, title: lessonTitles[i], description: `In this lesson, you'll learn ${lessonTitles[i].toLowerCase()}.`, videoId: courseData.previewVideoId!, durationSeconds: (15 + Math.floor(Math.random() * 45)) * 60, orderIndex: i, isPreview: i === 0 },
      });
    }

    // Add a quiz
    const quiz = await prisma.quiz.create({
      data: {
        courseId: course.id,
        title: `${course.title} — Knowledge Check`,
        passingScore: 70,
        questions: {
          create: [
            { question: `What is the main purpose of this ${courseData.category} course?`, options: ['To learn advanced concepts', 'To build real-world projects', 'Both A and B', 'None of the above'], correctIndex: 2, explanation: 'The course covers both theory and practical project-building.', orderIndex: 0 },
            { question: 'How should you approach learning a new technology?', options: ['Just watch videos', 'Practice with projects', 'Read documentation only', 'Ask others to do it'], correctIndex: 1, explanation: 'Hands-on practice is the best way to solidify new skills.', orderIndex: 1 },
            { question: 'What is the recommended first step when starting this course?', options: ['Skip to advanced topics', 'Set up your development environment', 'Watch the last lesson first', 'Read reviews'], correctIndex: 1, explanation: 'Setting up your environment properly is crucial for following along.', orderIndex: 2 },
          ],
        },
      },
    });
  }

  console.log('✅ Seed data created!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
