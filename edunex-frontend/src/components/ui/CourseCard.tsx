import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, Users, BookOpen, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { course: any; }

const levelColors: Record<string, string> = {
  BEGINNER: 'bg-green-500/10 text-green-400',
  INTERMEDIATE: 'bg-yellow-500/10 text-yellow-400',
  ADVANCED: 'bg-red-500/10 text-red-400',
};

export default function CourseCard({ course }: Props) {
  return (
    <Link href={`/courses/${course.id}`} className="card group flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {course.thumbnailUrl ? (
          <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-900 to-accent-700 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-primary-300" />
          </div>
        )}
        {course.previewVideoId && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <Play className="w-6 h-6 text-white ml-1" />
            </div>
          </div>
        )}
        {course.isFree && (
          <span className="absolute top-3 left-3 badge bg-green-500/20 text-green-400 border border-green-500/30">FREE</span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className={cn('badge', levelColors[course.level] || levelColors.BEGINNER)}>
            {course.level?.charAt(0) + course.level?.slice(1).toLowerCase()}
          </span>
          <span className="text-xs text-gray-500">{course.category}</span>
        </div>

        <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
          {course.title}
        </h3>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{course.description}</p>

        <div className="text-sm text-gray-500 mb-4">
          by <span className="text-gray-400 font-medium">{course.instructor?.fullName || 'Instructor'}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-yellow-400 font-medium">{(course.rating || 0).toFixed(1)}</span>
            <span>({course.ratingCount || 0})</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {course.studentsCount || 0}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {course.durationHours || 0}h
          </div>
        </div>

        {/* Price */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-white">
            {course.isFree ? 'Free' : `$${course.price}`}
          </span>
          <span className="text-xs text-primary-400 font-medium group-hover:underline">View Course →</span>
        </div>
      </div>
    </Link>
  );
}
