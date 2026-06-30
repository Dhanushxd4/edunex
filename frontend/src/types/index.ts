export type { School, Student, Teacher, Course, Lesson, Enrollment, Call, Fee, Mark, Exam, ExamQuestion, Enquiry, Admission, Alert, BusRoute, BusStop, IvrResponse, GamificationPoints, Badge } from './database'

export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'parent' | 'student'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  school_id?: string
  school_name?: string
  school_plan?: 'starter' | 'professional' | 'elite'
  name: string
}

export interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
  roles: UserRole[]
}

export interface ToastData {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export type FeeStatus = 'paid' | 'pending' | 'overdue'
export type CallType = 'absent' | 'fee' | 'alarm' | 'demo' | 'custom'
export type CallStatus = 'initiated' | 'completed' | 'failed' | 'no-answer'
export type EnquiryStatus = 'new' | 'called' | 'interested' | 'admitted' | 'dropped'
export type CourseStatus = 'draft' | 'published'
