import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, MapPin, CheckCircle, XCircle, AlertCircle, Star, UserX, Phone, Link2 } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Tabs } from '@/components/ui/Tabs'
import { Badge, feeStatusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'attendance',  label: 'Attendance' },
  { id: 'fees',        label: 'Fees' },
  { id: 'marks',       label: 'Marks' },
  { id: 'alerts',      label: 'Alerts' },
]

interface Student { name: string; class: string; section: string; roll_number: string; phone: string }
interface AttendanceRow { date: string; status: string }
interface FeeRow { term: string; amount: number; paid: boolean; due_date: string; paid_date: string | null }
interface MarkRow { subject: string; marks_obtained: number; max_marks: number; exam_name: string }
interface Alert { id: string; message: string; created_at: string }

interface ParentData {
  parent: { id: string; name: string; phone: string }
  student: Student | null
  attendance: AttendanceRow[]
  fees: FeeRow[]
  marks: MarkRow[]
  alerts: Alert[]
}

export function ParentPortalPage() {
  const [tab, setTab] = useState('overview')
  const { user } = useAuthStore()
  const [linkName, setLinkName] = useState('')
  const [linkRoll, setLinkRoll] = useState('')

  const { data, isLoading, refetch } = useQuery<ParentData>({
    queryKey: ['parent-me'],
    queryFn: () => api.get('/api/parents/me').then((r: { data: { data: ParentData } }) => r.data.data),
  })

  const linkMutation = useMutation({
    mutationFn: (body: { studentName?: string; rollNumber?: string }) =>
      api.patch('/api/parents/link-student', body),
    onSuccess: () => refetch(),
  })

  const student = data?.student
  const schoolName = user?.school_name ?? 'Your School'

  const todayStr = new Date().toISOString().split('T')[0]
  const todayAtt = data?.attendance.find(a => a.date === todayStr)
  const presentDays = data?.attendance.filter(a => a.status === 'present').length ?? 0
  const totalDays = data?.attendance.length ?? 0
  const allFeesPaid = data?.fees.length ? data.fees.every(f => f.paid) : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-ink-3 animate-pulse">Loading your child's info…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pt-2">
        <div className="flex items-center justify-center h-9 w-9 rounded-card bg-gradient-to-br from-gold-dark to-gold shadow-gold">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-ink-3">{schoolName}</p>
          <h1 className="text-base font-semibold text-ink-0 page-title">
            {student ? student.name : (data?.parent.name ?? 'Parent Portal')}
          </h1>
          {student
            ? <p className="text-xs text-ink-3">Class {student.class}{student.section} · Roll {student.roll_number}</p>
            : <p className="text-xs text-ink-3">Parent: {data?.parent.name}</p>
          }
        </div>
      </div>

      {/* No student linked yet */}
      {!student && (
        <Card className="mb-5">
          <div className="flex flex-col items-center text-center py-4 gap-3">
            <UserX className="h-8 w-8 text-ink-4" />
            <div>
              <p className="text-sm font-semibold text-ink-0">No student linked yet</p>
              <p className="text-xs text-ink-3 mt-1">Enter your child's name or roll number to link their profile.</p>
            </div>
            <div className="w-full flex gap-2">
              <Input placeholder="Child's name" value={linkName} onChange={e => setLinkName(e.target.value)} />
              <Input placeholder="Roll no." value={linkRoll} onChange={e => setLinkRoll(e.target.value)} className="w-28" />
            </div>
            <Button size="sm" leftIcon={<Link2 className="h-3.5 w-3.5" />}
              loading={linkMutation.isPending}
              onClick={() => linkMutation.mutate({ studentName: linkName || undefined, rollNumber: linkRoll || undefined })}>
              Link My Child
            </Button>
            {linkMutation.isError && <p className="text-xs text-danger">Student not found. Check the name or roll number.</p>}
          </div>
        </Card>
      )}

      <Tabs tabs={TABS} activeTab={tab} onChange={setTab} className="mb-5" />

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Card className="text-center">
                {todayAtt
                  ? todayAtt.status === 'present'
                    ? <><CheckCircle className="h-6 w-6 text-success mx-auto mb-1" /><p className="text-xs text-ink-3">Today</p><p className="text-sm font-semibold text-success">Present</p></>
                    : <><XCircle className="h-6 w-6 text-danger mx-auto mb-1" /><p className="text-xs text-ink-3">Today</p><p className="text-sm font-semibold text-danger">Absent</p></>
                  : <><p className="text-xs text-ink-3">Today</p><p className="text-sm font-semibold text-ink-3">—</p></>
                }
              </Card>
              <Card className="text-center">
                <p className="text-xs text-ink-3 mb-1">Fee Status</p>
                {allFeesPaid === null
                  ? <p className="text-sm text-ink-3">—</p>
                  : feeStatusBadge(allFeesPaid ? 'paid' : 'pending')}
              </Card>
            </div>

            {totalDays > 0 && (
              <Card>
                <p className="text-xs text-ink-3 mb-1">Attendance this month</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-cream-400 rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: `${Math.round(presentDays / totalDays * 100)}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-ink-0">{Math.round(presentDays / totalDays * 100)}%</span>
                </div>
                <p className="text-xs text-ink-4 mt-1">{presentDays} present / {totalDays} days</p>
              </Card>
            )}

            {student?.phone && (
              <Card>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-brand/10 rounded-btn">
                    <Phone className="h-5 w-5 text-sky-dark" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-0">Contact School</p>
                    <p className="text-xs text-ink-3">Click to call</p>
                  </div>
                  <a href={`tel:${student.phone}`}>
                    <Button variant="outline" size="sm">Call</Button>
                  </a>
                </div>
              </Card>
            )}

            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-sky-brand/10 rounded-btn">
                  <MapPin className="h-5 w-5 text-sky-dark" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-0">Bus Tracking</p>
                  <p className="text-xs text-ink-3">Live location via school app</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.open('/', '_self')}>Live Map</Button>
              </div>
            </Card>
          </div>
        )}

        {/* ── ATTENDANCE ── */}
        {tab === 'attendance' && (
          <Card>
            <h3 className="text-sm font-semibold text-ink-0 mb-3">Recent Attendance</h3>
            {(data?.attendance ?? []).length === 0 && (
              <p className="text-sm text-ink-3 text-center py-4">No attendance records yet.</p>
            )}
            <div className="space-y-2">
              {(data?.attendance ?? []).map((day) => (
                <div key={day.date} className="flex items-center gap-3 p-2.5 bg-cream-100 rounded-btn">
                  {day.status === 'present'
                    ? <CheckCircle className="h-4 w-4 text-success shrink-0" />
                    : <XCircle className="h-4 w-4 text-danger shrink-0" />}
                  <span className="text-sm text-ink-1">
                    {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <Badge variant={day.status === 'present' ? 'green' : 'red'} className="ml-auto">
                    {day.status === 'present' ? 'Present' : 'Absent'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── MARKS ── */}
        {tab === 'marks' && (
          <Card>
            <h3 className="text-sm font-semibold text-ink-0 mb-3">Latest Results</h3>
            {(data?.marks ?? []).length === 0 && (
              <p className="text-sm text-ink-3 text-center py-4">No marks recorded yet.</p>
            )}
            <div className="space-y-2">
              {(data?.marks ?? []).map((m, i) => {
                const pct = Math.round((m.marks_obtained / m.max_marks) * 100)
                const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : 'C'
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-cream-100 rounded-btn">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-0">{m.subject}</p>
                      <p className="text-xs text-ink-3">{m.exam_name}</p>
                      <div className="mt-1 h-1.5 bg-cream-400 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-ink-0">{m.marks_obtained}/{m.max_marks}</p>
                      <p className="text-xs text-gold font-medium">{grade}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* ── FEES ── */}
        {tab === 'fees' && (
          <div className="space-y-3">
            {(data?.fees ?? []).length === 0 && (
              <Card className="text-center py-6">
                <p className="text-sm text-ink-3">No fee records found.</p>
              </Card>
            )}
            {(data?.fees ?? []).map((f, i) => (
              <Card key={i}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink-0">{f.term}</p>
                    <p className="text-xs text-ink-3">Due: {new Date(f.due_date).toLocaleDateString('en-IN')}</p>
                    {f.paid && f.paid_date && (
                      <p className="text-xs text-success">Paid on {new Date(f.paid_date).toLocaleDateString('en-IN')}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-ink-0">₹{f.amount.toLocaleString('en-IN')}</p>
                    {feeStatusBadge(f.paid ? 'paid' : 'pending')}
                  </div>
                </div>
              </Card>
            ))}
            {allFeesPaid && (
              <Card className="text-center py-4">
                <Star className="h-8 w-8 text-success mx-auto mb-1" />
                <p className="text-base font-bold text-success">All Fees Paid</p>
                <p className="text-xs text-ink-3 mt-1">No dues pending.</p>
              </Card>
            )}
          </div>
        )}

        {/* ── ALERTS ── */}
        {tab === 'alerts' && (
          <div className="space-y-3">
            {(data?.alerts ?? []).length === 0 && (
              <Card className="text-center py-6">
                <p className="text-sm text-ink-3">No announcements from school yet.</p>
              </Card>
            )}
            {(data?.alerts ?? []).map((alert) => (
              <Card key={alert.id}>
                <div className="flex gap-3">
                  <AlertCircle className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-ink-1">{alert.message}</p>
                    <p className="text-xs text-ink-3 mt-1">
                      {new Date(alert.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </motion.div>
    </div>
  )
}
