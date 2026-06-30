'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, SlidersHorizontal, BookOpen, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import CourseCard from '@/components/ui/CourseCard';
import { CATEGORIES, LEVELS } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    level: '',
    is_free: searchParams.get('is_free') || '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: page.toString(), limit: '12' };
      if (filters.q) params.q = filters.q;
      if (filters.category) params.category = filters.category;
      if (filters.level) params.level = filters.level;
      if (filters.is_free) params.is_free = filters.is_free;
      const data = await api.courses.list(params);
      setCourses(data.courses);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      // fallback to empty
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">All Courses</h1>
          <p className="text-gray-400">{total > 0 ? `${total} courses available` : 'Discover your next skill'}</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={filters.q}
              onChange={e => setFilters(p => ({ ...p, q: e.target.value }))}
              placeholder="Search courses, topics, skills..."
              className="input pl-12"
              onKeyDown={e => e.key === 'Enter' && fetchCourses()}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-secondary flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <select className="input" value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
              <select className="input" value={filters.level} onChange={e => setFilters(p => ({ ...p, level: e.target.value }))}>
                <option value="">All Levels</option>
                {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
              <select className="input" value={filters.is_free} onChange={e => setFilters(p => ({ ...p, is_free: e.target.value }))}>
                <option value="">All Prices</option>
                <option value="true">Free Only</option>
                <option value="false">Paid Only</option>
              </select>
            </div>
          </div>
        )}

        {/* Course Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => <CourseCard key={course.id} course={course} />)}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn('w-10 h-10 rounded-xl text-sm font-medium transition-all', p === page ? 'bg-primary-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700')}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
