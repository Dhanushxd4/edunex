import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookMarked, Plus, Users, Play } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/store/ui.store'

interface Course {
  id: string
  title: string
  subject: string
  cls: string
  teacher: string
  lessons: number
  enrolled: number
  status: 'published' | 'draft'
  thumbnail: string
}

const DEMO: Course[] = [
  { id: '1', title: 'Quadratic Equations — Complete Guide', subject: 'Mathematics', cls: 'Class 10', teacher: 'Mr. Anil Kumar',  lessons: 12, enrolled: 38, status: 'published', thumbnail: '' },
  { id: '2', title: 'Cell Biology & Life Processes',        subject: 'Science',     cls: 'Class 9',  teacher: 'Ms. Kavitha Rao', lessons: 8,  enrolled: 29, status: 'published', thumbnail: '' },
  { id: '3', title: 'Comprehension & Writing Skills',       subject: 'English',     cls: 'Class 10', teacher: 'Ms. Kavitha Rao', lessons: 6,  enrolled: 0,  status: 'draft',     thumbnail: '' },
]

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-700',
  Science:     'bg-green-100 text-green-700',
  English:     'bg-purple-100 text-purple-700',
  Telugu:      'bg-orange-100 text-orange-700',
  Social:      'bg-gold-muted text-gold-dark',
}

export function CoursesPage() {
  const toast = useToast()
  const [courses, setCourses] = useState<Course[]>(DEMO)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ title: '', subject: 'Mathematics', cls: 'Class 10', teacher: '' })

  function handleCreate() {
    if (!form.title || !form.teacher) { toast.error('Title and teacher are required'); return }
    const course: Course = {
      id: Date.now().toString(),
      title: form.title,
      subject: form.subject,
      cls: form.cls,
      teacher: form.teacher,
      lessons: 0,
      enrolled: 0,
      status: 'draft',
      thumbnail: '',
    }
    setCourses((prev) => [course, ...prev])
    setAddOpen(false)
    setForm({ title: '', subject: 'Mathematics', cls: 'Class 10', teacher: '' })
    toast.success('Course created', form.title)
  }

  function publish(id: string) {
    setCourses((prev) => prev.map((c) => c.id === id ? { ...c, status: 'published' } : c))
    toast.success('Course published!')
  }

  return (
    <div className="space-y-5 animate-fadeUp">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink-0">Courses (LMS)</h2>
          <p className="text-xs text-ink-3 mt-0.5">{courses.filter((c) => c.status === 'published').length} published · {courses.filter((c) => c.status === 'draft').length} draft</p>
        </div>
        <Button variant="gold" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>New Course</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card hover className="flex flex-col gap-3">
              {/* Thumbnail */}
              <div className="h-28 bg-gradient-to-br from-cream-300 to-cream-400 rounded-btn flex items-center justify-center">
                <BookMarked className="h-10 w-10 text-ink-3" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SUBJECT_COLORS[course.subject] ?? 'bg-cream-400 text-ink-2'}`}>
                    {course.subject}
                  </span>
                  <Badge variant={course.status === 'published' ? 'green' : 'gray'}>
                    {course.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-ink-0 leading-snug">{course.title}</h3>
                <p className="text-xs text-ink-3 mt-0.5">{course.cls} · {course.teacher}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-ink-3 pt-1 border-t border-black/8">
                <span className="flex items-center gap-1"><Play className="h-3 w-3" />{course.lessons} lessons</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.enrolled} enrolled</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Play className="h-3.5 w-3.5 mr-1" /> Open
                </Button>
                {course.status === 'draft' && (
                  <Button variant="gold" size="sm" onClick={() => publish(course.id)}>Publish</Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create New Course" size="md">
        <div className="space-y-4">
          <Input label="Course Title *" placeholder="e.g. Quadratic Equations — Complete Guide" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Subject" options={['Mathematics','Science','English','Telugu','Social Studies'].map((s) => ({ value: s, label: s }))} value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            <Select label="Class" options={['Class 6','Class 7','Class 8','Class 9','Class 10'].map((c) => ({ value: c, label: c }))} value={form.cls} onChange={(e) => setForm((f) => ({ ...f, cls: e.target.value }))} />
          </div>
          <Input label="Assigned Teacher *" placeholder="Teacher name" value={form.teacher} onChange={(e) => setForm((f) => ({ ...f, teacher: e.target.value }))} />
          <div className="flex gap-3 pt-1">
            <Button variant="ghost" onClick={() => setAddOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="gold" onClick={handleCreate} className="flex-1">Create Course</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
