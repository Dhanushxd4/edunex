export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name: string;
  thumbnail_url: string;
  preview_video_id: string; // YouTube video ID
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  is_free: boolean;
  duration_hours: number;
  lessons_count: number;
  students_count: number;
  rating: number;
  rating_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  video_id: string; // YouTube video ID
  duration_seconds: number;
  order_index: number;
  is_preview: boolean;
  created_at: string;
}

export interface Quiz {
  id: string;
  course_id: string;
  lesson_id?: string;
  title: string;
  questions: QuizQuestion[];
  passing_score: number;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed: boolean;
  watch_time_seconds: number;
  completed_at?: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at?: string;
  progress_percentage: number;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: 'student' | 'instructor' | 'admin';
  bio: string;
  created_at: string;
}

export interface Review {
  id: string;
  course_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  rating: number;
  comment: string;
  created_at: string;
}
