import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Users, UserX, DollarSign, Phone, BookOpen, TrendingUp, Zap, ArrowRight, Clock } from 'lucide-react'
import { KpiCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/Spinner'
import { useAuthStore } from '@/store/auth.store'
import { api } from '@/lib/api'

interface DashboardData {
  totalStudents: number
  absentToday: number
  pendingFees: number
  callsToday: number
  recentCalls: Array<{ id: string; student_name: string; type: string; status: string; called_at: string }>
}

const QUICK_ACTIONS = [
  { label: 'Mark Attendance', path: '/attendance', icon: <UserX className="h-5 w-5" />,     color: 'bg-gold-muted text-gold-dark' },
  { label: 'Collect Fees',    path: '/fees',       icon: <DollarSign className="h-5 w-5" />, color: 'bg-success/10 text-success' },
  { label: 'Generate Exam',   path: '/exams',      icon: <BookOpen className="h-5 w-5" />,   color: 'bg-sky-brand/10 text-sky-dark' },
  { label: 'Send Alert',      path: '/alerts',     icon: <Zap className="h-5 w-5" />,        color: 'bg-purple-100 text-purple-600' },
  { label: 'Analytics',       path: '/analytics',  icon: <TrendingUp className="h-5 w-5" />, color: 'bg-orange-100 text-orange-600' },
  { label: 'Demo Call',       path: '/demo',       icon: <Phone className="h-5 w-5" />,      color: 'bg-danger/10 text-danger' },
]

function callStatusBadge(status: string) {
  if (status === 'completed') return <Badge variant="green">Completed</Badge>
  if (status === 'no-answer') return <Badge variant="orange">No Answer</Badge>
  if (status === 'failed')    return <Badge variant="red">Failed</Badge>
  return <Badge variant="blue">Calling</Badge>
}

export function DashboardPage() {
  const { user } = useAuthStore()
  const navigate  = useNavigate()
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard', user?.school_id],
    queryFn:  () => api.get('/dashboard').then((r) => r.data),
    enabled:  !!user?.school_id,
    refetchInterval: 30_000,
  })

  // Fallback numbers if API not yet connected
  const stats = data ?? { totalStudents: 0, absentToday: 0, pendingFees: 0, callsToday: 0, recentCalls: [] }

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-semibold text-ink-0 page-title">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-ink-3 mt-0.5">Here's what's happening at your school today.</p>
      </motion.div>

      {/* Auto Agent banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex items-center justify-between bg-gradient-to-r from-gold-dark to-gold rounded-card px-5 py-3 text-white"
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
          </span>
          <span className="text-sm font-medium">Auto Agent is running — calls fire automatically</span>
        </div>
        <Button variant="glass" size="sm" onClick={() => navigate('/agent')} rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
          Manage
        </Button>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Students', value: stats.totalStudents.toLocaleString(), subtitle: `${stats.absentToday} absent today`, icon: <Users className="h-5 w-5 text-gold" />, iconBg: 'bg-gold-muted' },
          { title: 'Absent Today',   value: stats.absentToday,  subtitle: 'Parent calls sent',          icon: <UserX className="h-5 w-5 text-danger" />, iconBg: 'bg-danger/10' },
          { title: 'Pending Fees',   value: stats.pendingFees,  subtitle: 'students with dues',         icon: <DollarSign className="h-5 w-5 text-gold" />, iconBg: 'bg-gold-muted' },
          { title: 'Calls Today',    value: stats.callsToday,   subtitle: 'automated calls made',       icon: <Phone className="h-5 w-5 text-sky-dark" />, iconBg: 'bg-sky-brand/10' },
        ].map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <KpiCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions + Recent Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-2 card p-5">
          <h3 className="text-sm font-semibold text-ink-0 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button key={action.label} onClick={() => navigate(action.path)} className="flex flex-col items-center gap-2 p-3 rounded-card bg-cream-100 hover:bg-cream-300 transition-colors text-center card-hover">
                <div className={`p-2 rounded-btn ${action.color}`}>{action.icon}</div>
                <span className="text-xs font-medium text-ink-1 leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-3 card p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-ink-0">Recent Calls</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/attendance')} rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>View all</Button>
          </div>
          {stats.recentCalls.length === 0 ? (
            <div className="py-8 text-center text-sm text-ink-3">No calls made yet today</div>
          ) : (
            <div className="space-y-2">
              {stats.recentCalls.map((call) => (
                <div key={call.id} className="flex items-center gap-3 p-2.5 rounded-btn bg-cream-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-1 truncate">{call.student_name}</p>
                    <p className="text-xs text-ink-3 capitalize">{call.type} call</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {callStatusBadge(call.status)}
                    <span className="text-xs text-ink-3 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(call.called_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
