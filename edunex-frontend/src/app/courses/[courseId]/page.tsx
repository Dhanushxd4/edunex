'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Clock, Users, Star, BookOpen, CheckCircle, Lock, Loader2, Award } from 'lucide-react';
import { api, isLoggedIn } from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.courses.get(courseId as string),
      isLoggedIn() ? api.enrollments.check(courseId as string) : Promise.resolve(null),
      isLoggedIn() ? api.progress.getCourseProgress(courseId as string) : Promise.resolve(null),
    ]).then(([courseData, enrollData, progressData]) => {
      setCourse(courseData);
      if (enrollData) setEnrolled(enrollData.enrolled);
      if (progressData) setProgress(progressData.progress);
      if (courseData?.lessons?.length) setActiveLesson(courseData.lessons[0]);
    }).catch(console.error).finally(() => setLoading(false));
  }, [courseId]);

  const handleEnroll = async () => {
    if (!isLoggedIn()) return router.push('/auth/login');
    setEnrolling(true);
    try {
      await api.enrollments.enroll(courseId as string);
      setEnrolled(true);
      toast.success('Enrolled successfully!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const markLessonComplete = async (lesson: any) => {
    if (!isLoggedIn() || !enrolled) return;
    try {
      await api.progress.update(lesson.id, { courseId: courseId as string, completed: true, watchTimeSeconds: lesson.durationSeconds });
      setProgress(prev => [...prev.filter(p => p.lessonId !== lesson.id), { lessonId: lesson.id, completed: true }]);
      toast.success('Lesson marked complete!');
    } catch { /* silent */ }
  };

  const isLessonCompleted = (lessonId: string) => progress.some(p => p.lessonId === lessonId && p.completed);

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-16"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center pt-16 text-gray-400">Course not found</div>;

  return (
    <div className="min-h-screen pt-16">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="badge bg-primary-500/20 text-primary-400">{course.category}</span>
                <span className="badge bg-gray-700 text-gray-300">{course.level}</span>
                {course.isFree && <span className="badge bg-green-500/20 text-green-400">FREE</span>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{course.title}</h1>
              <p className="text-gray-400 text-lg mb-6">{course.description}</p>
              <div className="flex items-center gap-6 text-sm text-gray-400 flex-wrap">
                <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /><span className="text-yellow-400 font-medium">{(course.rating||0).toFixed(1)}</span> ({course.ratingCount||0})</div>
                <div className="flex items-center gap-1"><Users className="w-4 h-4" />{course.studentsCount||0} students</div>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.durationHours||0}h</div>
                <div className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{course.lessons?.length||0} lessons</div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-20">
                {course.previewVideoId && (
                  <div className="relative aspect-video mb-6 rounded-xl overflow-hidden">
                    <iframe src={`https://www.youtube.com/embed/${course.previewVideoId}?rel=0`} className="w-full h-full" allowFullScreen />
                  </div>
                )}
                <div className="text-3xl font-bold text-white mb-6">{course.isFree ? 'Free' : `$${course.price}`}</div>
                {enrolled ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-green-400 mb-4"><CheckCircle className="w-5 h-5" /><span className="font-medium">Enrolled</span></div>
                    <button className="btn-primary w-full">Continue Learning</button>
                  </div>
                ) : (
                  <button onClick={handleEnroll} disabled={enrolling} className="btn-primary w-full flex items-center justify-center gap-2">
                    {enrolling ? <><Loader2 className="w-5 h-5 animate-spin" />Enrolling...</> : course.isFree ? 'Enroll for Free' : `Enroll — $${course.price}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {activeLesson && (enrolled || activeLesson.isPreview) ? (
              <div className="mb-8">
                <div className="aspect-video rounded-2xl overflow-hidden bg-black mb-4">
                  <iframe src={`https://www.youtube.com/embed/${activeLesson.videoId}?rel=0&autoplay=1`} className="w-full h-full" allowFullScreen />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-white">{activeLesson.title}</h2>
                    {activeLesson.description && <p className="text-gray-400 mt-1">{activeLesson.description}</p>}
                  </div>
                  {enrolled && (
                    <button onClick={() => markLessonComplete(activeLesson)} className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all', isLessonCompleted(activeLesson.id) ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400 hover:text-white')}>
                      <CheckCircle className="w-4 h-4" />{isLessonCompleted(activeLesson.id) ? 'Completed' : 'Mark Complete'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center mb-8">
                <div className="text-center"><Lock className="w-12 h-12 text-gray-600 mx-auto mb-3" /><p className="text-gray-400">Enroll to access lessons</p></div>
              </div>
            )}
          </div>
          <div className="lg:col-span-1">
            <div className="card">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-semibold text-white">Course Content</h3>
                <p className="text-xs text-gray-500 mt-1">{course.lessons?.length||0} lessons</p>
              </div>
              <div className="divide-y divide-gray-800 max-h-[60vh] overflow-y-auto">
                {course.lessons?.map((lesson: any, idx: number) => (
                  <button key={lesson.id} onClick={() => (enrolled||lesson.isPreview) && setActiveLesson(lesson)}
                    className={cn('w-full text-left p-4 flex items-center gap-3 transition-colors', activeLesson?.id===lesson.id?'bg-primary-500/10':'hover:bg-gray-800/50', !enrolled&&!lesson.isPreview&&'opacity-60 cursor-not-allowed')}>
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0', isLessonCompleted(lesson.id)?'bg-green-500 text-white':'bg-gray-700 text-gray-400')}>
                      {isLessonCompleted(lesson.id) ? <CheckCircle className="w-4 h-4" /> : idx+1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium truncate', activeLesson?.id===lesson.id?'text-primary-400':'text-gray-300')}>{lesson.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{Math.round((lesson.durationSeconds||0)/60)}m{lesson.isPreview?' · Preview':''}</p>
                    </div>
                    {!enrolled&&!lesson.isPreview ? <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" /> : <Play className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
