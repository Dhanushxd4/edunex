'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import CourseCard from './CourseCard';

export default function FeaturedCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.courses.list({ limit: '6' }).then(d => setCourses(d.courses)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="section-title mb-3">Featured Courses</h2>
            <p className="section-subtitle">Hand-picked by our expert team</p>
          </div>
          <Link href="/courses" className="hidden md:flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium transition-colors">
            View all courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No courses yet. <Link href="/auth/signup" className="text-primary-400">Be the first instructor!</Link></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
        <div className="text-center mt-10 md:hidden">
          <Link href="/courses" className="btn-secondary inline-flex items-center gap-2">View all courses <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </section>
  );
}
