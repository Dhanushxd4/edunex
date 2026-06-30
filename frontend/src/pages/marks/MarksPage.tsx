import { useState } from 'react'
import { Send, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { useToast } from '@/store/ui.store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { gradeFromMarks } from '@/lib/utils'

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Telugu', 'Social Studies', 'Hindi', 'Computer Science', 'Physical Education']

export function MarksPage() {
  const toast = useToast()
  const qc = useQueryClient()
  const [cls, setCls] = useState('Class 10')
  const [subject, setSubject] = useState('Mathematics')
  const [total, setTotal] = useState('100')
  const [marks, setMarks] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const { data: studentsData, isLoading } = useQuery({
    queryKey: ['students-marks', cls],
    queryFn: () => api.get(`/students?cls=${encodeURIComponent(cls)}&limit=100`).then((r) => r.data),
  })
  const students = Array.isArray(studentsData) ? (studentsData as { id: string; name: string; roll: string }[]) : []

  const gradeVariant = (g: string) => {
    if (['A+', 'A'].includes(g)) return 'green' as const
    if (['B+', 'B'].includes(g)) return 'blue' as const
    if (g === 'C') return 'orange' as const
    return 'red' as const
  }

  async function publish() {
    const entries = Object.entries(marks).filter(([, v]) => v !== '')
    if (!entries.length) { toast.error('Enter at least one mark'); return }
    setSaving(true)
    try {
      // Save marks as PATCH on each student (using marks_data field)
      await Promise.all(
        entries.map(([id, mark]) =>
          api.patch(`/students/${id}`, {
            [`marks_${subject.replace(/\s+/g, '_').toLowerCase()}`]: parseInt(mark),
          })
        )
      )
      qc.invalidateQueries({ queryKey: ['students-marks'] })
      toast.success('Results published', 'Visible in Parent Portal')
    } catch {
      toast.error('Failed to save', 'Check connection and try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 animate-fadeUp">
      <Card>
        <div className="flex flex-wrap gap-3 items-end mb-4">
          <div className="w-40">
            <Select label="Class" options={['Nursery','LKG','UKG','Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10'].map((c) => ({ value: c, label: c }))} value={cls} onChange={(e) => { setCls(e.target.value); setMarks({}) }} />
          </div>
          <div className="w-52">
            <Select label="Subject" options={SUBJECTS.map((s) => ({ value: s, label: s }))} value={subject} onChange={(e) => { setSubject(e.target.value); setMarks({}) }} />
          </div>
          <div className="w-32">
            <Select label="Total Marks" options={['50', '75', '100'].map((n) => ({ value: n, label: n }))} value={total} onChange={(e) => setTotal(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-ink-3 text-sm gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading students…
          </div>
        ) : students.length === 0 ? (
          <p className="text-sm text-ink-3 text-center py-8">No students found for {cls}</p>
        ) : (
          <div className="space-y-2">
            {students.map((s) => {
              const m = parseInt(marks[s.id] ?? '') || 0
              const grade = marks[s.id] ? gradeFromMarks(m, parseInt(total)) : '—'
              return (
                <div key={s.id} className="flex items-center gap-4 p-3 bg-cream-100 rounded-btn">
                  <span className="text-xs text-ink-3 w-6">{s.roll}</span>
                  <span className="text-sm font-medium text-ink-0 flex-1">{s.name}</span>
                  <input
                    type="number"
                    min={0}
                    max={parseInt(total)}
                    value={marks[s.id] ?? ''}
                    onChange={(e) => setMarks((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    placeholder="—"
                    className="w-20 h-8 rounded-btn border border-black/10 text-center text-sm bg-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20"
                  />
                  <span className="text-xs text-ink-3 w-8 text-center">/{total}</span>
                  <Badge variant={gradeVariant(grade)}>{grade}</Badge>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-4 flex gap-3">
          <Button variant="gold" loading={saving} onClick={publish} leftIcon={<Send className="h-4 w-4" />}>
            Publish Results
          </Button>
        </div>
      </Card>
    </div>
  )
}
