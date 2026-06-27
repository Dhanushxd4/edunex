import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { useToast } from '@/store/ui.store'
import { gradeFromMarks } from '@/lib/utils'

const STUDENTS = [
  { id: '1', name: 'Arjun Mehta',   roll: '12' },
  { id: '2', name: 'Priya Sharma',  roll: '22' },
  { id: '3', name: 'Rahul Verma',   roll: '08' },
  { id: '4', name: 'Sneha Patel',   roll: '18' },
  { id: '5', name: 'Karan Singh',   roll: '05' },
]
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Telugu', 'Social Studies']

export function MarksPage() {
  const toast = useToast()
  const [subject, setSubject] = useState('Mathematics')
  const [total, setTotal] = useState('100')
  const [marks, setMarks] = useState<Record<string, string>>({})
  const [published, setPublished] = useState(false)

  function publish() {
    setPublished(true)
    toast.success('Results published', 'Visible in Parent Portal')
  }

  const gradeVariant = (g: string) => {
    if (['A+', 'A'].includes(g)) return 'green' as const
    if (['B+', 'B'].includes(g)) return 'blue' as const
    if (g === 'C') return 'orange' as const
    return 'red' as const
  }

  return (
    <div className="space-y-5 animate-fadeUp">
      <Card>
        <div className="flex flex-wrap gap-3 items-end mb-4">
          <div className="w-56">
            <Select label="Subject" options={SUBJECTS.map((s) => ({ value: s, label: s }))} value={subject} onChange={(e) => { setSubject(e.target.value); setMarks({}) }} />
          </div>
          <div className="w-32">
            <Select label="Total Marks" options={['50', '75', '100'].map((n) => ({ value: n, label: n }))} value={total} onChange={(e) => setTotal(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          {STUDENTS.map((s) => {
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

        <div className="mt-4 flex gap-3">
          <Button variant="gold" onClick={publish} leftIcon={<Send className="h-4 w-4" />}>
            {published ? 'Published ✓' : 'Publish Results'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
