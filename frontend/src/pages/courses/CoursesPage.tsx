import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookMarked, Plus, Users, Play, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Input, Select } from '@/components/ui/Input'
import { useToast } from '@/store/ui.store'
import { api } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Course {
  id: string
  title: string
  subject: string
  cls: string
  status: 'published' | 'draft'
  lesson_count: number
  created_at: string
}

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: 'bg-blue-100 text-blue-700',
  Science:     'bg-green-100 text-green-700',
  English:     'bg-purple-100 text-purple-700',
  Telugu:      'bg-orange-100 text-orange-700',
  'Social Studies': 'bg-gold-muted text-gold-dark',
}

export function CoursesPage() {
  const toast = useToast()
  const qc = useQueryClient()
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ title: '', subject: 'Mathematics', cls: 'Class 10' })

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses').then((r) => r.data),
  })
  const courses: Course[] = Array.isArray(coursesData) ? (coursesData as Course[]) : []

  const createCourse = useMutation({
    mutationFn: (body: unknown) => api.post('/courses', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] })
      setAddOpen(false)
      setForm({ title: '', subject: 'Mathematics', cls: 'Class 10' })
      toast.success('Course created')
    },
    onError: () => toast.error('Failed to create course'),
  })

  const publishCourse = useMutation({
    mutationFn: (id: string) => api.patch(`/courses/${id}`, { status: 'published' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success('Course published!') },
  })

  const deleteCourse = useMutation({
    mutationFn: (id: string) => api.delete(`/courses/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success('Course deleted') },
  })

  function handleCreate() {
    if (!form.title) { toast.error('Title is required'); return }
    createCourse.mutate(form)
  }

  return (
    <div className="space-y-5 animate-fadeUp">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink-0">Courses (LMS)</h2>
          <p className="text-xs text-ink-3 mt-0.5">
            {courses.filter((c) => c.status === 'published').length} published · {courses.filter((c) => c.status === 'draft').length} draft
          </p>
        </div>
        <Button variant="gold" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setAddOpen(true)}>New Course</Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-ink-3 text-sm gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" /> Loading courses…
        </div>
      )}

      {!isLoading && courses.length === 0 && (
        <Card className="text-center py-12">
          <BookMarked className="h-10 w-10 text-ink-4 mx-auto mb-3" />
          <p className="text-sm font-semibold text-ink-0">No courses yet</p>
          <p className="text-xs text-ink-3 mt-1">Click "New Course" to add your first course.</p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course, i) => (
          <motion.div key={course.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card hover className="flex flex-col gap-3">
              <div className="h-28 bg-gradient-to-br from-cream-300 to-cream-400 rounded-btn flex items-center justify-center relative">
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
                <p className="text-xs text-ink-3 mt-0.5">{course.cls}</p>
              </div>

              <div className="flex items-center gap-4 text-xs text-ink-3 pt-1 border-t border-black/8">
                <span className="flex items-center gap-1"><Play className="h-3 w-3" />{course.lesson_count ?? 0} lessons</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />0 enrolled</span>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Play className="h-3.5 w-3.5 mr-1" /> Open
                </Button>
                {course.status === 'draft' && (
                  <Button variant="gold" size="sm" loading={publishCourse.isPending} onClick={() => publishCourse.mutate(course.id)}>
                    Publish
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => { if (confirm('Delete this course?')) deleteCourse.mutate(course.id) }}>
                  <Trash2 className="h-3.5 w-3.5 text-danger" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create New Course" size="md">
        <div className="space-y-4">
          <Input
            label="Course Title *"
            placeholder="e.g. Quadratic Equations — Complete Guide"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Subject"
              options={['Mathematics','Science','English','Telugu','Social Studies'].map((s) => ({ value: s, label: s }))}
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            />
            <Select
              label="Class"
              options={['Class 6','Class 7','Class 8','Class 9','Class 10'].map((c) => ({ value: c, label: c }))}
              value={form.cls}
              onChange={(e) => setForm((f) => ({ ...f, cls: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="ghost" onClick={() => setAddOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="gold" onClick={handleCreate} loading={createCourse.isPending} className="flex-1">Create Course</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
