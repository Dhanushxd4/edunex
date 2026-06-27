export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: School
        Insert: Omit<School, 'id' | 'joined'>
        Update: Partial<Omit<School, 'id'>>
      }
      students: {
        Row: Student
        Insert: Omit<Student, 'id' | 'created_at'>
        Update: Partial<Omit<Student, 'id'>>
      }
      teachers: {
        Row: Teacher
        Insert: Omit<Teacher, 'id' | 'created_at'>
        Update: Partial<Omit<Teacher, 'id'>>
      }
      courses: {
        Row: Course
        Insert: Omit<Course, 'id' | 'created_at'>
        Update: Partial<Omit<Course, 'id'>>
      }
      lessons: {
        Row: Lesson
        Insert: Omit<Lesson, 'id' | 'created_at'>
        Update: Partial<Omit<Lesson, 'id'>>
      }
      enrollments: {
        Row: Enrollment
        Insert: Omit<Enrollment, 'id' | 'enrolled_at'>
        Update: Partial<Omit<Enrollment, 'id'>>
      }
      calls: {
        Row: Call
        Insert: Omit<Call, 'id' | 'called_at'>
        Update: Partial<Omit<Call, 'id'>>
      }
      fees: {
        Row: Fee
        Insert: Omit<Fee, 'id' | 'created_at'>
        Update: Partial<Omit<Fee, 'id'>>
      }
      marks: {
        Row: Mark
        Insert: Omit<Mark, 'id' | 'created_at'>
        Update: Partial<Omit<Mark, 'id'>>
      }
      exams: {
        Row: Exam
        Insert: Omit<Exam, 'id' | 'created_at'>
        Update: Partial<Omit<Exam, 'id'>>
      }
      enquiries: {
        Row: Enquiry
        Insert: Omit<Enquiry, 'id' | 'created_at'>
        Update: Partial<Omit<Enquiry, 'id'>>
      }
      admissions: {
        Row: Admission
        Insert: Omit<Admission, 'id' | 'created_at'>
        Update: Partial<Omit<Admission, 'id'>>
      }
      alerts: {
        Row: Alert
        Insert: Omit<Alert, 'id' | 'created_at'>
        Update: Partial<Omit<Alert, 'id'>>
      }
      bus_routes: {
        Row: BusRoute
        Insert: Omit<BusRoute, 'id' | 'created_at'>
        Update: Partial<Omit<BusRoute, 'id'>>
      }
      ivr_responses: {
        Row: IvrResponse
        Insert: Omit<IvrResponse, 'id' | 'responded_at'>
        Update: Partial<Omit<IvrResponse, 'id'>>
      }
      gamification_points: {
        Row: GamificationPoints
        Insert: Omit<GamificationPoints, 'id' | 'created_at'>
        Update: Partial<Omit<GamificationPoints, 'id'>>
      }
      badges: {
        Row: Badge
        Insert: Omit<Badge, 'id' | 'created_at'>
        Update: Partial<Omit<Badge, 'id'>>
      }
    }
  }
}

// ── Entity types ───────────────────────────────────────────

export interface School {
  id: string
  name: string
  email: string
  password_hash: string
  principal: string
  city: string
  state: string
  phone: string
  board: string
  medium: string
  plan: 'starter' | 'professional' | 'elite'
  status: 'active' | 'inactive' | 'trial'
  twilio_number: string | null
  call_duration: number
  student_count: number | null
  joined: string
}

export interface Student {
  id: string
  school_id: string
  name: string
  cls: string
  roll: string
  phone: string
  parent: string
  parent_email: string | null
  fee_status: 'paid' | 'pending' | 'overdue'
  absent: boolean
  created_at: string
}

export interface Teacher {
  id: string
  school_id: string
  name: string
  subject: string
  classes: string[]
  phone: string
  email: string | null
  status: 'active' | 'on_leave'
  created_at: string
}

export interface Course {
  id: string
  school_id: string
  title: string
  subject: string
  cls: string
  description: string | null
  thumbnail: string | null
  teacher_id: string | null
  status: 'draft' | 'published'
  lesson_count: number
  created_at: string
}

export interface Lesson {
  id: string
  course_id: string
  school_id: string
  title: string
  content: string | null
  video_url: string | null
  order: number
  duration_minutes: number | null
  created_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  school_id: string
  progress: number
  completed: boolean
  enrolled_at: string
}

export interface Call {
  id: string
  school_id: string
  student_id: string | null
  student_name: string
  parent_phone: string
  type: 'absent' | 'fee' | 'alarm' | 'demo' | 'custom'
  status: 'initiated' | 'completed' | 'failed' | 'no-answer'
  twilio_sid: string | null
  called_at: string
}

export interface Fee {
  id: string
  school_id: string
  student_id: string
  term: string
  amount: number
  paid: number
  due: number
  status: 'paid' | 'pending' | 'overdue'
  due_date: string | null
  created_at: string
}

export interface Mark {
  id: string
  school_id: string
  student_id: string
  exam_id: string | null
  subject: string
  marks: number
  total: number
  grade: string
  created_at: string
}

export interface Exam {
  id: string
  school_id: string
  title: string
  cls: string
  subject: string
  total_marks: number
  questions: ExamQuestion[]
  status: 'draft' | 'published'
  date: string | null
  created_at: string
}

export interface ExamQuestion {
  id: string
  question: string
  type: 'mcq' | 'short' | 'long'
  options?: string[]
  answer?: string
  marks: number
}

export interface Enquiry {
  id: string
  school_id: string
  name: string
  phone: string
  cls: string
  source: 'phone' | 'walk-in' | 'whatsapp' | 'online'
  status: 'new' | 'called' | 'interested' | 'admitted' | 'dropped'
  notes: string | null
  created_at: string
}

export interface Admission {
  id: string
  school_id: string
  child_name: string
  parent_name: string
  phone: string
  email: string | null
  class_applied: string
  dob: string | null
  current_school: string | null
  source: string | null
  status: 'pending' | 'reviewed' | 'admitted' | 'rejected'
  created_at: string
}

export interface Alert {
  id: string
  school_id: string
  message: string
  message_te: string | null
  channel: 'sms' | 'whatsapp' | 'both'
  template: string | null
  scheduled_at: string | null
  sent_at: string | null
  status: 'scheduled' | 'sent' | 'failed'
  created_at: string
}

export interface BusRoute {
  id: string
  school_id: string
  number: string
  driver: string
  driver_phone: string | null
  stops: BusStop[]
  maps_link: string | null
  student_count: number
  status: 'active' | 'inactive'
  created_at: string
}

export interface BusStop {
  name: string
  time: string
}

export interface IvrResponse {
  id: string
  school_id: string
  student_id: string | null
  student_name: string
  parent_phone: string
  response: '1' | '2'
  responded_at: string
}

export interface GamificationPoints {
  id: string
  student_id: string
  school_id: string
  points: number
  reason: string
  created_at: string
}

export interface Badge {
  id: string
  student_id: string
  school_id: string
  name: string
  icon: string
  awarded_at: string
  created_at: string
}
