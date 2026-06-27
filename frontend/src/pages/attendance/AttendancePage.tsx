import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, Check, X, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { useToast } from '@/store/ui.store'
import { api } from '@/lib/api'

interface AttendanceStudent {
  id: string
  name: string
  roll: string
  phone: string
  parent: string
  present: boolean
  callStatus: 'pending' | 'called' | 'failed' | null
}

const CLASSES = ['10A', '10B', '9A', '9B', '8A', '8B', '8C']

const DEMO_STUDENTS: AttendanceStudent[] = [
  { id: '1', name: 'Arjun Mehta',   roll: '12', phone: '9876543210', parent: 'Rajesh Mehta',   present: true,  callStatus: null },
  { id: '2', name: 'Priya Sharma',  roll: '22', phone: '9876543211', parent: 'Suresh Sharma',  present: false, callStatus: 'called' },
  { id: '3', name: 'Rahul Verma',   roll: '08', phone: '9876543212', parent: 'Mahesh Verma',   present: true,  callStatus: null },
  { id: '4', name: 'Sneha Patel',   roll: '18', phone: '9876543213', parent: 'Dinesh Patel',   present: true,  callStatus: null },
  { id: '5', name: 'Karan Singh',   roll: '05', phone: '9876543214', parent: 'Vijay Singh',    present: false, callStatus: 'pending' },
  { id: '6', name: 'Lakshmi Devi',  roll: '10', phone: '9876543215', parent: 'Ravi Kumar',     present: true,  callStatus: null },
  { id: '7', name: 'Chaitanya Rao', roll: '03', phone: '9876543216', parent: 'Krishna Rao',    present: true,  callStatus: null },
]

export function AttendancePage() {
  const toast = useToast()
  const [activeClass, setActiveClass] = useState('10A')
  const [students, setStudents] = useState<AttendanceStudent[]>(DEMO_STUDENTS)
  const [callingId, setCallingId] = useState<string | null>(null)

  const presentCount = students.filter((s) => s.present).length
  const absentCount  = students.filter((s) => !s.present).length

  function toggle(id: string) {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        const nowAbsent = s.present
        if (nowAbsent) {
          fireCall(s)
        }
        return { ...s, present: !s.present, callStatus: nowAbsent ? 'pending' : null }
      }),
    )
  }

  async function fireCall(student: AttendanceStudent) {
    setCallingId(student.id)
    try {
      await api.post('/calls/make', {
        phone: student.phone,
        type: 'absent',
        studentName: student.name,
        parentName: student.parent,
      })
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, callStatus: 'called' } : s)),
      )
      toast.success('Call initiated', `Calling ${student.parent} about ${student.name}`)
    } catch {
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, callStatus: 'failed' } : s)),
      )
      toast.error('Call failed', 'Check backend connection')
    } finally {
      setCallingId(null)
    }
  }

  async function callAllAbsent() {
    const absent = students.filter((s) => !s.present && s.callStatus !== 'called')
    if (absent.length === 0) {
      toast.info('No uncalled absent students')
      return
    }
    for (const student of absent) {
      await fireCall(student)
    }
    toast.success('Batch calls sent', `Called ${absent.length} parents`)
  }

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* Class tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 bg-cream-300 rounded-btn p-1">
          {CLASSES.map((c) => (
            <button
              key={c}
              onClick={() => setActiveClass(c)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                activeClass === c ? 'bg-white text-ink-1 shadow-card' : 'text-ink-3 hover:text-ink-2'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <Button
          variant="gold"
          size="sm"
          leftIcon={<Phone className="h-4 w-4" />}
          onClick={callAllAbsent}
        >
          Call All Absent ({absentCount})
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Users className="h-4 w-4 text-ink-3" />
            <span className="text-2xl font-bold text-ink-0">{students.length}</span>
          </div>
          <p className="text-xs text-ink-3 mt-1">Total</p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Check className="h-4 w-4 text-success" />
            <span className="text-2xl font-bold text-success">{presentCount}</span>
          </div>
          <p className="text-xs text-ink-3 mt-1">Present</p>
        </Card>
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2">
            <X className="h-4 w-4 text-danger" />
            <span className="text-2xl font-bold text-danger">{absentCount}</span>
          </div>
          <p className="text-xs text-ink-3 mt-1">Absent</p>
        </Card>
      </div>

      {/* Student list */}
      <div className="space-y-2">
        {students.map((student, i) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`card flex items-center gap-4 px-4 py-3 transition-colors ${
              !student.present ? 'border border-danger/20 bg-danger/[.02]' : ''
            }`}
          >
            <Avatar name={student.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-0">{student.name}</p>
              <p className="text-xs text-ink-3">Roll {student.roll} · {student.parent}</p>
            </div>

            {/* Call status */}
            {student.callStatus === 'called' && (
              <Badge variant="green" dot>Called ✓</Badge>
            )}
            {student.callStatus === 'failed' && (
              <Badge variant="red" dot>Failed</Badge>
            )}
            {student.callStatus === 'pending' && callingId === student.id && (
              <Badge variant="gold" dot>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 animate-pulse" /> Calling…
                </span>
              </Badge>
            )}

            {/* Toggle */}
            <button
              onClick={() => toggle(student.id)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                student.present ? 'bg-success' : 'bg-danger'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                  student.present ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-medium w-14 text-right ${student.present ? 'text-success' : 'text-danger'}`}>
              {student.present ? 'Present' : 'Absent'}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Info note */}
      <p className="text-xs text-ink-3 text-center">
        Toggling a student absent automatically triggers a Twilio call to the parent
      </p>
    </div>
  )
}
