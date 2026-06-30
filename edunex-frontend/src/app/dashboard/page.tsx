'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Award, TrendingUp, Clock, CheckCircle, BarChart2, Loader2 } from 'lucide-react';
import { api, isLoggedIn } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/auth/login'); return; }
    Promise.all([api.users.dashboard(), api.auth.me()])
      .then(([dash, me]) => { setData(dash); setUser(me); })
      .catch(() => router.push('/auth/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>;
  if (!data) return null;

  const completedCourses = data.enrollments?.filter((e: any) => e.progressPercentage === 100).length || 0;
  const inProgress = data.enrollments?.filter((e: any) => e.progressPercentage > 0 && e.progressPercentage < 100).length || 0;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className="text-gray-400">Continue your learning journey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: BookOpen, label: 'Enrolled', value: data.enrollments?.length || 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: TrendingUp, label: 'In Progress', value: inProgress, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
            { icon: CheckCircle, label: 'Completed', value: completedCourses, color: 'text-green-400', bg: 'bg-green-500/10' },
            { icon: Award, label: 'Quiz Passes', value: data.recentQuizAttempts?.filter((a: any) => a.passed).length || 0, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          ].map(s => (
            <div key={s.label} className="card p-5 flex items-center gap-4">
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', s.bg)}>
                <s.icon className={cn('w-5 h-5', s.color)} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-gray-400">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-white">My Courses</h2>
              <Link href="/courses" className="text-sm text-primary-400 hover:text-primary-300">Browse more →</Link>
            </div>
            {data.enrollments?.length === 0 ? (
              <div className="card p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">You haven't enrolled in any courses yet</p>
                <Link href="/courses" className="btn-primary inline-flex">Browse Courses</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {data.enrollments?.map((enrollment: any) => (
                  <Link key={enrollment.id} href={`/courses/${enrollment.courseId}`} className="card p-4 flex items-center gap-4 group hover:border-gray-700">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-900 to-accent-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-7 h-7 text-primary-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white group-hover:text-primary-400 transition-colors truncate">{enrollment.course?.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">by {enrollment.course?.instructor?.fullName || 'Instructor'}</p>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>{Math.round(enrollment.progressPercentage || 0)}% complete</span>
                          <span>{enrollment.course?.lessonsCount || 0} lessons</span>
                        </div>
                        <div className="progress-bar"><div className="progress-fill" style={{ width: `${enrollment.progressPercentage || 0}%` }} /></div>
                      </div>
                    </div>
                    {enrollment.progressPercentage === 100 && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Quiz Activity */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-5">Recent Quizzes</h2>
            {data.recentQuizAttempts?.length === 0 ? (
              <div className="card p-8 text-center">
                <Award className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No quiz attempts yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.recentQuizAttempts?.map((attempt: any) => (
                  <div key={attempt.id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-white text-sm truncate">{attempt.quiz?.title}</p>
                      <span className={cn('badge text-xs', attempt.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')}>
                        {attempt.passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-400">Score: {Math.round(attempt.score)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
